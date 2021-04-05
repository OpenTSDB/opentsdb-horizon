import { Component, OnInit, OnChanges, SimpleChanges, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/*
export interface VisualizationData {
    color: string;
    lineWeight: string;
    lineType: string;
  }
*/
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-visual-appearance',
    templateUrl: './widget-config-visual-appearance.component.html',
    styleUrls: []
})
export class WidgetConfigVisualAppearanceComponent implements OnInit, OnChanges  {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.visual-appearance-configuration') private _tabClass = true;
    @HostBinding('class.has-columns') private _modifierClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    dataSources = [];

    gForms = new FormGroup({});

    displayControl: FormControl;
    stackOrderControl: FormControl;
    layoutControl: FormControl;
    decimalControl: FormControl;

    gSubscriptions: Subscription;
    formInitialized = false;
    stackOrderOptions: Array<any> = [
        {
            label: 'Metric',
            value: 'metric'
        },
        {
            label: 'AVG',
            value: 'avg'
        },
        {
            label: 'MIN',
            value: 'min'
        },
        {
            label: 'MAX',
            value: 'max'
        },
        {
            label: 'SUM',
            value: 'sum'
        },
        {
            label: 'FIRST',
            value: 'first'
        },
        {
            label: 'LAST',
            value: 'last'
        }
    ];

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
    }
    ngOnChanges( changes: SimpleChanges ) {
        let enableStackOrderCntrl = false;

        if ( !changes.widget ) {
            return;
        }
        // all others - LineChart, BarChart, DonutChart
        this.widget.queries.forEach((query, index) => {
            if (this.widget.settings.component_type === 'LinechartWidgetComponent') {
                for ( let i = 0; i < query.metrics.length; i++ ) {
                    const type = query.metrics[i].settings.visual.type;
                    if ( type === 'area' || type === 'bar' ) {
                        enableStackOrderCntrl = true;
                    }
                }
            }
        });

        if ( this.widget.settings.component_type === 'TableWidgetComponent' ) {
            if ( !this.formInitialized ){
                this.gForms = this.fb.group({
                    layout: new FormControl(this.widget.settings.visual.layout || 'time:metric'),
                    fontSize: new FormControl(this.widget.settings.visual.fontSize || 12),
                    padding: new FormControl(this.widget.settings.visual.padding || 5),
                    decimals: new FormControl(this.widget.settings.visual.decimals || 'auto')
                });
                this.formInitialized = true;
                this.gSubscriptions = this.gForms.valueChanges
                                            // delay is required since we convert the min & max values to the respective unit size
                                            .pipe(debounceTime(500))
                                            .subscribe(function(data) {
                                                this.widgetChange.emit( {action: 'SetVisualization', payload: { data: data }} );
                                            }.bind(this));
            }
        } else if (this.widget.settings.component_type !== 'LinechartWidgetComponent') {
            const displayControlDefault = (this.widget.settings.component_type === 'DonutWidgetComponent') ? 'doughnut' : 'vertical';
            this.displayControl = new FormControl(this.widget.settings.visual.type || displayControlDefault);
        } else {
            if ( !this.stackOrderControl ) {
                this.stackOrderControl = new FormControl(this.widget.settings.visual.stackOrder || 'metric');
            }
            if ( enableStackOrderCntrl ) {
                this.stackOrderControl.enable({emitEvent: false});
            } else {
                this.stackOrderControl.disable({emitEvent: false});
            }
        }
        /*
        switch ( this.widget.settings.component_type ) {
            case 'BarchartWidgetComponent':
                this.displayControl = new FormControl(this.widget.query.settings.visual.type || 'vertical');
            break;
            case 'DonutWidgetComponent':
                this.displayControl = new FormControl(this.widget.query.settings.visual.type || 'doughnut');
            break;
        }*/

        // this.gForms.updateValueAndValidity( { emitEvent: false });
        if ( this.displayControl ) {
            this.displayControl.valueChanges.subscribe( d => {
                this.widgetChange.emit( {'action': 'ChangeVisualization', payload: { type: d }});
            });
        }

        if ( this.stackOrderControl ) {
            this.stackOrderControl.valueChanges.subscribe( d => {
                this.widgetChange.emit( {'action': 'SetStackOrder', payload: { orderBy: d }});
            });
        }
    }

    /*
    selectColor(color, gIndex, index ) {
        this.gForms.controls[gIndex]['controls'][index]['controls'].color.setValue(color.hex);
    }

    // for stacked barcharts
    selectStackColor(color, index ) {
        this.gForms.controls['stacks']['controls'][index]['controls'].color.setValue(color.hex);
    }
    */

    setVisualConditions(conditions) {
        this.widgetChange.emit( {'action': 'SetVisualConditions', payload: { data: conditions}});
    }

    setUnit( value ) {
        this.gForms['controls']['unit'].setValue(value);
    }

    changeLayout(layout) {
        console.log("layout=", layout);
        this.gForms['controls']['layout'].setValue(layout);
    }
}
