import { Component, OnInit, OnChanges, AfterViewInit, ChangeDetectorRef,
    SimpleChanges, HostBinding, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { ElementQueries, ResizeSensor } from 'css-element-queries';
import { Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { WidgetModel, Axis } from '../../../../../dashboard/state/widgets.state';
import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition} from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-barchart-widget',
  templateUrl: './barchart-widget.component.html',
  styleUrls: ['./barchart-widget.component.scss'],
})
export class BarchartWidgetComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.barchart-widget') private _componentClass = true;

    @Input() editMode: boolean;
    @Input() widget: any;

    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;

    private listenSub: Subscription;
    // tslint:disable-next-line:no-inferrable-types
    private isDataLoaded: boolean = false;
    // tslint:disable-next-line:no-inferrable-types
    isStackedGraph: boolean = false;
    // properties to pass to  chartjs chart directive

    type = 'bar';
    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;
    type$: BehaviorSubject<string>;
    typeSub: Subscription;

    categoryAxis: any = {
        type: 'category',
        ticks: {
            autoSkip: true
        }
    };

    valueAxis: any = {
        ticks: {
            beginAtZero: true,
            precision: 0
        },
        type: 'linear'
    };

    options: any  = {
        scales: {
            yAxes : [],
            xAxes : []
        },
        // not part of chartjs config. this config will be used for bar, doughnut and pie charts
        labels : [ ],
        // contains stack series details like label, color, datasetIndex
        stackSeries : {},
        legend: {
            display: false,
            position: 'right'
        }
    };
    data: any = [ ];
    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    width = '100%';
    height = '100%';
    nQueryDataLoading = 0;
    error: any;
    errorDialog: MatDialogRef < ErrorDialogComponent > | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef < DebugDialogComponent > | null;
    storeQuery: any;
    needRequery = false;
    isDestroying = false;
    visibleSections: any = { 'queries' : true, 'time': false, 'axes': false, 'visuals': false, 'sorting': false };

    constructor(
        private interCom: IntercomService,
        private dataTransformer: DatatranformerService,
        public dialog: MatDialog,
        private util: UtilsService,
        private unit: UnitConverterService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.doRefreshData$ = new BehaviorSubject(false);

        this.doRefreshDataSub = this.doRefreshData$
            .pipe(
                debounceTime(1000)
            )
            .subscribe(trigger => {
                if (trigger) {
                    this.refreshData();
                }
            });

        this.type$ = new BehaviorSubject(this.widget.settings.visual.type || 'vertical');
        this.options.legend.display = this.isStackedGraph ? true : false;

        this.typeSub = this.type$.subscribe( type => {

            this.widget.settings.visual.type = type;
            this.options.scales.yAxes[0] = type === 'vertical' ? this. valueAxis : this.categoryAxis;
            this.options.scales.xAxes[0] = type === 'vertical' ? this.categoryAxis : this.valueAxis;
            this.type = type === 'vertical' ? 'bar' : 'horizontalBar';
            // add to change gridline color
            this.options.scales.xAxes[0].gridLines = { color: '#eeeeee' };
            this.options.scales.yAxes[0].gridLines = { color: '#eeeeee' };
        });
        // subscribe to event stream
        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            switch( message.action ) {
                case 'TimeChanged':
                case 'reQueryData':
                case 'ZoomDateRange':
                    this.refreshData();
                    break;
            }
            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'updatedWidgetGroup':
                        this.nQueryDataLoading--;
                        if ( !this.isDataLoaded ) {
                            this.options.labels = [];
                            this.data = [];
                            this.isDataLoaded = true;
                        }
                        if ( message.payload.error ) {
                            this.error = message.payload.error;
                        }
                        if (environment.debugLevel.toUpperCase() === 'TRACE' ||
                            environment.debugLevel.toUpperCase() == 'DEBUG' ||
                            environment.debugLevel.toUpperCase() == 'INFO') {
                                this.debugData = message.payload.rawdata.log; // debug log
                        }
                        this.data = this.dataTransformer
                            .yamasToChartJS(this.type, this.options, this.widget, this.data, message.payload.rawdata, this.isStackedGraph);
                        this.detectChanges();
                        break;
                    case 'getUpdatedWidgetConfig':
                        this.widget = message.payload.widget;
                        this.setOptions();
                        this.refreshData(message.payload.needRefresh);
                        break;
                    case 'WidgetQueryLoading':
                        this.nQueryDataLoading = 1;
                        this.storeQuery = message.payload.storeQuery;
                        this.cdRef.detectChanges();
                        break;
                    case 'ResetUseDBFilter':
                        this.widget.settings.useDBFilter = true;
                        this.cdRef.detectChanges();
                        break;
                }
            }
        });

        // first time when displaying chart
        if (!this.widget.settings.sorting) {
            this.widget.settings.sorting = { limit: 25, order: 'top' };
        }

        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(()=>{
            this.refreshData(this.editMode ? false : true);
            this.setOptions();
        });
    }

    ngOnChanges(changes: SimpleChanges) {

    }

    ngAfterViewInit() {
        // this event will happend on resize the #widgetoutput element,
        // in bar chart we don't need to pass the dimension to it.
        // Dimension will be picked up by parent node which is #container
        ElementQueries.listen();
        ElementQueries.init();
        const initSize = {
            width: this.widgetOutputElement.nativeElement.clientWidth,
            height: this.widgetOutputElement.nativeElement.clientHeight
        };
        this.newSize$ = new BehaviorSubject(initSize);

        this.newSizeSub = this.newSize$.pipe(
            debounceTime(100)
        ).subscribe(size => {
            this.setSize(size);
        });
        const resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () =>{
             const newSize = {
                width: this.widgetOutputElement.nativeElement.clientWidth,
                height: this.widgetOutputElement.nativeElement.clientHeight
            };
            this.newSize$.next(newSize);
        });
    }

    setTitle(title) {
        this.widget.settings.title = title;
    }

    requestData() {
        if (!this.isDataLoaded) {
            this.nQueryDataLoading = 1;
            this.error = null;
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'getQueryData',
                payload: this.widget
            });
            this.detectChanges();
        }
    }

    requestCachedData() {
        this.nQueryDataLoading = 1;
        this.error = null;
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'getWidgetCachedData',
            payload: this.widget
        });
    }

    updateConfig(message) {
        switch ( message.action ) {
            case 'SetMetaData':
                this.util.setWidgetMetaData(this.widget, message.payload.data);
                break;
            case 'SetTimeConfiguration':
                this.util.setWidgetTimeConfiguration(this.widget, message.payload.data);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'SetVisualization':
                this.setBarVisualization( message.payload.gIndex, message.payload.data );
                break;
            case 'SetAxes' :
                this.widget.settings.axes = { ...this.widget.settings.axes, ...message.payload.data };
                this.setAxisOption();
                this.options = { ...this.options };
                break;
            case 'SetSorting':
                this.setSorting(message.payload);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ChangeVisualization':
                this.type$.next(message.payload.type);
                break;
            case 'UpdateQuery':
                this.util.updateQuery(this.widget, message.payload);
                this.widget.queries = [...this.widget.queries];
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricVisual':
                this.util.updateQueryMetricVisual(this.widget, message.id, message.payload.mid, message.payload.visual);
                this.refreshData(false);
                break;
            case 'ToggleQueryMetricVisibility':
                this.util.toggleQueryMetricVisibility(this.widget, message.id, message.payload.mid);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQueryMetric':
                this.util.deleteQueryMetric(this.widget, message.id, message.payload.mid);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ToggleQueryVisibility':
                this.util.toggleQueryVisibility(this.widget, message.id);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'CloneQuery':
                this.util.cloneQuery(this.widget, message.id);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQuery':
                this.util.deleteQuery(this.widget, message.id);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ToggleDBFilterUsage':
                this.widget.settings.useDBFilter = message.payload.apply;
                this.refreshData();
                this.needRequery = message.payload.reQuery;
                break;
            case 'SummarizerChange':
                this.refreshData();
                break;
        }
    }

    // for first time and call.
    setSize(newSize) {
        // if edit mode, use the widgetOutputEl. If in dashboard mode, go up out of the component,
        // and read the size of the first element above the componentHostEl
        const nativeEl = (this.editMode) ?
            this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

        const outputSize = nativeEl.getBoundingClientRect();
        if (this.editMode) {
            this.width = '100%';
            this.height = '100%';
        } else {
            this.width = (outputSize.width - 30) + 'px';
            this.height = (outputSize.height - 3) + 'px';
        }
        this.detectChanges();
    }

    detectChanges() {
        if ( ! this.isDestroying ) {
            this.cdRef.detectChanges();
        }
    }

    refreshData(reload = true) {
        this.isDataLoaded = false;
        if ( reload ) {
            this.requestData();
        } else {
            this.requestCachedData();
        }
    }

    setAxisOption() {
        const axis = this.valueAxis;
        const config = this.widget.settings.axes && this.widget.settings.axes.y1 ?
                            this.widget.settings.axes.y1 : <Axis>{};
        axis.type = !config.scale || config.scale === 'linear' ? 'linear' : 'logarithmic';
        axis.ticks = { beginAtZero: true };
        if ( !isNaN( config.min ) && config.min ) {
            axis.ticks.min =  config.min;
        }
        if ( !isNaN( config.max ) && config.max ) {
            axis.ticks.max = config.max;
        }
        const label = config.label ? config.label.trim() : '';
        const decimals = !config.decimals || config.decimals.toString().trim() === 'auto' ? 'auto' : config.decimals;
        axis.scaleLabel = label ? { labelString: label, display: true } : {};
        axis.ticks.format = { unit: config.unit, precision: decimals, unitDisplay: config.unit ? true : false };
    }

    setBarVisualization( gIndex, configs ) {
        configs.forEach( (config, i) => {
            this.widget.queries[gIndex].metrics[i].settings.visual = { ...this.widget.queries[gIndex].metrics[i].settings.visual, ...config };
        });
        this.refreshData(false);
    }

    setOptions() {
        this.type$.next(this.widget.settings.visual.type);
        this.setAxisOption();
        this.options = {...this.options};
    }

    setSorting(sConfig) {
        this.widget.settings.sorting = { order: sConfig.order, limit: sConfig.limit };
    }

    toggleConfigSection(section) {
        this.visibleSections[section] = !this.visibleSections[section];
    }

    changeWidgetType(type) {
        const wConfig = this.util.deepClone(this.widget);
        wConfig.id = wConfig.id.replace('__EDIT__', '');
         this.interCom.requestSend({
             action: 'changeWidgetType',
             id: wConfig.id,
             payload: { wConfig: wConfig, newType: type }
         });
     }

    showError() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        const offsetHeight = 60;
        dialogConf.width = '50%';
        dialogConf.minWidth = '500px';
        dialogConf.height = '200px';
        dialogConf.backdropClass = 'error-dialog-backdrop';
        dialogConf.panelClass = 'error-dialog-panel';
        dialogConf.data = this.error;

        this.errorDialog = this.dialog.open(ErrorDialogComponent, dialogConf);
        this.errorDialog.afterClosed().subscribe((dialog_out: any) => {
        });
    }

    showDebug() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        const offsetHeight = 60;
        dialogConf.width = '75%';
        dialogConf.minWidth = '500px';
        dialogConf.height = '75%';
        dialogConf.minHeight = '200px';
        dialogConf.backdropClass = 'error-dialog-backdrop'; // re-use for now
        dialogConf.panelClass = 'error-dialog-panel';
         dialogConf.data = {
          log: this.debugData,
          query: this.storeQuery 
        };
        
        // re-use?
        this.debugDialog = this.dialog.open(DebugDialogComponent, dialogConf);
        this.debugDialog.afterClosed().subscribe((dialog_out: any) => {
        });
    }

    closeViewEditMode() {
        this.interCom.requestSend(<IMessage>{
            action: 'closeViewEditMode',
            id: this.widget.id,
            payload: 'dashboard',
        });
    }

    applyConfig() {
        const cloneWidget = this.util.deepClone(this.widget);
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: this.needRequery }
        });

        this.closeViewEditMode();
    }

    ngOnDestroy() {
        this.isDestroying = true;
        if (this.listenSub) {
            this.listenSub.unsubscribe();
        }
        this.typeSub.unsubscribe();
        this.doRefreshDataSub.unsubscribe();
    }
}