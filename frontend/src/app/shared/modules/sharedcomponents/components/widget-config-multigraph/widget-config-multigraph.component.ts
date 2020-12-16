import {
    Component, OnInit, OnDestroy, OnChanges, SimpleChanges,
    HostBinding, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { HttpService } from '../../../../../core/http/http.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { MatAutocompleteTrigger } from '@angular/material';
import { MultigraphService } from '../../../../../core/services/multigraph.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import * as deepEqual from 'fast-deep-equal';
import { pairwise, startWith, distinctUntilChanged } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'widget-config-multigraph',
    templateUrl: './widget-config-multigraph.component.html',
    styleUrls: []
})
export class WidgetConfigMultigraphComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild('chartTable') chartTable: MatTable<any>;
    @ViewChild('tagKeyInput', { read: ElementRef }) tagKeyInput: ElementRef;
    @ViewChild('tagKeyInput', { read: MatAutocompleteTrigger }) tagKeyACTrigger: MatAutocompleteTrigger;

    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.multigraph-configuration') private _tabClass = true;

    @Input() widget: any = {};
    @Input() isDataLoaded: boolean;
    /** Outputs */
    @Output() widgetChange = new EventEmitter();

    /** Subscriptions */
    private subscription: Subscription = new Subscription();

    /** local variables */
    widgetTags = { rawWidgetTags: {}, totalQueries: 0, tags: [] };
    isWidgetTagsLoaded = false;
    isWidgetTagsLoaded$ = new Subject();
    needRequery = false;
    tagKeyControlInput = new FormControl('');

    /** Form Group */
    widgetConfigMultigraph: FormGroup = new FormGroup({});
    // form control options
    layoutPresetOptions: Array<any> = [
        {
            label: 'Grid',
            value: 'grid'
        },
        /* {
            label: 'Freeflow',
            value: 'freeflow'
        }*/
    ];

    // custom row/colum count select value options
    customPresetValues: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    availableTagOptions: Array<any> = [];

    sortAsOptions: Array<any> = [
        { label: 'Asc', value: 'asc'},
        { label: 'Desc', value: 'desc'}
    ];

    /** Mat Table Stuff */
    chartDisplayColumns: string[] = ['label', 'sort', 'x', 'y', 'g', 'order'];

    // default mutilgraph
    multigraph: any = {
        chart: [
            {
                key: 'metric_group',
                displayAs: 'g', // g|x|y
                sortAs: 'asc'
            }
        ],
        layout: 'grid', // grid | freeflow
        gridOptions: {
            viewportDisplay: 'custom', // fit | custom
            custom: {
                x: 3,
                y: 3
            }
        }
    };

    multigraphSubs: any = false;

    constructor(
        private fb: FormBuilder,
        private httpService: HttpService,
        private utilService: UtilsService,
        private multiService: MultigraphService,
        private loggerService: LoggerService
    ) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if ( !changes.widget ) {
            return;
        }
        this.setupMultigraph();
    }

    setupMultigraph() {
        // get widget tags
        this.getWidgetTagKeys();
        // check of they have multigraph or not
        if (this.widget.settings.multigraph) {
            this.multigraph = this.utilService.deepClone(this.widget.settings.multigraph);
            // we just set to custom if it used fit before then it can save later
            // since we only support custom not auto for now
            if (this.multigraph.gridOptions.viewportDisplay === 'fit') {
                this.multigraph.gridOptions.viewportDisplay = 'custom';
            }
        }
        const groupByTags = this.multiService.getGroupByTags(this.widget.queries);
        this,this.multiService.updateMultigraphConf(groupByTags, this.multigraph);
        this.createForm(this.multigraph);
    }

    createForm(multigraph: any) {
       
        // setup the group
        this.widgetConfigMultigraph = this.fb.group({
            chart: this.fb.array([]),
            layout: new FormControl('', [Validators.required]),
            gridOptions: this.fb.group({
                viewportDisplay: new FormControl('', [Validators.required]),
                custom: this.fb.group({
                    x: new FormControl(1, [Validators.required]),
                    y: new FormControl(1, [Validators.required])
                })
            })
        });

        for (const i in multigraph.chart) {
            if (multigraph.chart[i]) {
                let chartItem = multigraph.chart[i];
                if (!chartItem.sortAs) {
                    chartItem.sortAs = 'asc';
                }
                this.addChartItem(chartItem);
            }
        }
        // patch with values (triggering first valueChange)
        this.widgetConfigMultigraph.patchValue(this.multigraph, {
            emitEvent: true
        });

        this.widgetConfigMultigraph.updateValueAndValidity({ onlySelf: false, emitEvent: true });

        this.setViewportDisplayValidators();
    }

    setViewportDisplayValidators() {

        // form changes for chart group
        this.subscription.add(
            this.widgetConfigMultigraph.controls['chart'].valueChanges
                .pipe(
                    startWith(''),
                    distinctUntilChanged(),
                    pairwise()
                ).subscribe(([prev, changes]: [any, any]) => {
                    if (this.chartTable && !deepEqual(prev, changes)) {
                        this.chartTable.renderRows();
                        this.widgetChange.emit({
                            action: 'UpdateMultigraph',
                            payload: {
                                requery: this.needRequery,
                                changes: this.widgetConfigMultigraph.getRawValue()
                            }
                        });
                        this.needRequery = false;
                    }
                })
        );

        // form change for viewport options
        this.subscription.add(
            this.widgetConfigMultigraph.controls['gridOptions'].valueChanges
                .pipe(
                    startWith(''),
                    distinctUntilChanged(),
                    pairwise()
                ).subscribe(([prev, changes]: [any, any]) => {
                    if (!deepEqual(prev, changes)) {
                        this.widgetChange.emit({
                            action: 'UpdateMultigraph',
                            payload: {
                                requery: this.needRequery,
                                changes: this.widgetConfigMultigraph.getRawValue()
                            }
                        });
                        this.needRequery = false;
                    }
                })
        );
    }

    widgetTagOptions() {
        const chartItems: string[] = this.widgetConfigMultigraph.getRawValue().chart.map(item => item.key);
        return this.widgetTags.tags.filter(tag => !chartItems.includes(tag));
    }

    addChartItem(data: any) {
        this.needRequery = true;
        const chartItem = this.fb.group(data);
        const control = <FormArray>this.FC_chart;
        control.push(chartItem);
    }

    addTagKeyChartItem(key: string) {
        const control = <FormArray>this.FC_chart;
        const chartItem = { key, displayAs: 'g', sortAs: 'asc', order: (control['controls'].length - 1) };
        this.addChartItem(chartItem);
    }

    dropTable(event: any) {
        // console.log('DROP TABLE EVENT', event);
        const prevIndex = this.FC_chart['controls'].findIndex((d) => d === event.item.data);
        moveItemInArray(this.FC_chart['controls'], prevIndex, event.currentIndex);
        this.setChartDataOrder();
        // this.chartTable.renderRows();
    }

    setChartDataOrder() {
        const controls = this.FC_chart['controls'];
        for (let i; i < controls.length; i++) {
            const formGroup = <FormGroup>controls[i];
            formGroup.get('order').setValue(i);
        }
        this.FC_chart.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    setViewportDisplayMode(event: any) {
        // console.log('SET VIEWPORT DISPLAY MODE', event);
        this.FC_gridOpts_viewportDisplay.setValue(event.value);
    }

    selectLayoutTypeChange(event: any) {
        // console.log('SET LAYOUT TYPE CHANGE', event);
        this.FC_layout.setValue(event.value);
        // this.widgetConfigMultigraph.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    selectCustomRows(event: any) {
        this.FC_gridOpts_custom_x.setValue(event.value, { emitEvent: false });
        this.FC_gridOpts_viewportDisplay.setValue('custom');
    }

    selectCustomColumns(event: any) {
        this.FC_gridOpts_custom_y.setValue(event.value, { emitEvent: false });
        this.FC_gridOpts_viewportDisplay.setValue('custom');
    }

    removeMultigraphTag(index: number) {
        this.needRequery = true;
        const control = <FormArray>this.FC_chart;
        control.removeAt(index);
        this.chartTable.renderRows();
    }

    /** auto complete stuff */

    onTagKeyInputBlur(event: any) {
        // console.log('TAG KEY INPUT BLUR', event);
        // check if in tag key array
        const val = this.tagKeyControlInput.value;

        const idx = this.widgetTags.tags.findIndex(item => item && item.toLowerCase() === val.toLowerCase());

        if (idx === -1) {
            this.tagKeyControlInput.setValue('');
        } else {
            this.addTagKeyChartItem(this.widgetTags.tags[idx]);
            this.tagKeyControlInput.setValue('');
        }
    }

    onTagKeyInputFocus() {
        // console.log('TAG KEY INPUT FOCUS');
        this.tagKeyControlInput.setValue('');
        this.tagKeyACTrigger.openPanel();
    }

    tagKeyOptionSelected(event: any) {
        // console.log('TAG KEY OPTION SELECTED', event);
        this.addTagKeyChartItem(event.option.value);
        this.tagKeyControlInput.setValue('');
        this.tagKeyInput.nativeElement.focus();
    }

    checkIfGroupByTags(tag: string): boolean {
        const groupByTags = this.multiService.getGroupByTags(this.widget.queries);
        return groupByTags.includes(tag);
    }

    /** network stuff */

    getWidgetTagKeys() {
        this.subscription.add(this.httpService.getTagKeysForQueries([this.widget]).subscribe((res: any) => {
            this.widgetTags = { rawWidgetTags: {}, totalQueries: 0, tags: [] };
            for (let i = 0; res && i < res.results.length; i++) {
                const [wid, qid] = res.results[i].id ? res.results[i].id.split(':') : [null, null];
                if (!wid) { continue; }
                const keys = res.results[i].tagKeys.map(d => d.name);
                if (!this.widgetTags.rawWidgetTags[wid]) {
                    this.widgetTags.rawWidgetTags[wid] = {};
                }
                this.widgetTags.rawWidgetTags[wid][qid] = keys;
                this.widgetTags.totalQueries++;
                this.widgetTags.tags = [...this.widgetTags.tags,
                ...keys.filter(k => this.widgetTags.tags.indexOf(k) < 0)];
            }
            this.widgetTags.tags.sort(this.utilService.sortAlphaNum);
            this.isWidgetTagsLoaded = true;
            this.isWidgetTagsLoaded$.next(true);
        },
            error => {
                this.isWidgetTagsLoaded = true;
                this.isWidgetTagsLoaded$.next(true);
            })
        );
    }

    /** FORM CONTROL QUICK ACCESSORS */
    get FC_layout() {
        return this.widgetConfigMultigraph.get('layout');
    }

    get FC_chart() {
        return this.widgetConfigMultigraph.get('chart');
    }

    get FC_gridOpts_viewportDisplay() {
        return this.widgetConfigMultigraph.get('gridOptions').get('viewportDisplay');
    }

    get FC_gridOpts_custom_x() {
        return this.widgetConfigMultigraph.get('gridOptions').get('custom').get('x');
    }

    get FC_gridOpts_custom_y() {
        return this.widgetConfigMultigraph.get('gridOptions').get('custom').get('y');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
