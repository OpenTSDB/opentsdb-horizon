import {
    Component, OnInit, HostBinding, Input, EventEmitter,
    OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, ViewChildren, QueryList, Output
} from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { MultigraphService } from '../../../../../core/services/multigraph.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { Subscription, Observable } from 'rxjs';
import { WidgetModel, Axis } from '../../../../../dashboard/state/widgets.state';
import { IDygraphOptions } from '../../../dygraphs/IDygraphOptions';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ElementQueries, ResizeSensor} from 'css-element-queries';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoggerService } from '../../../../../core/services/logger.service';
import { environment } from '../../../../../../environments/environment';
import { InfoIslandService } from '../../../info-island/services/info-island.service';
import { ThemeService } from '../../../../../app-shell/services/theme.service';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'linechart-widget',
    templateUrl: './linechart-widget.component.html',
    styleUrls: []
})
export class LinechartWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.linechart-widget') private _componentClass = true;

    @Input() widget: WidgetModel;
    @Input() mode = 'view'; // view/explore/edit
    @Output() widgetOut = new EventEmitter<any>();

    @ViewChild('widgetOutputContainer') private widgetOutputContainer: ElementRef;
    @ViewChild('widgetTitle') private widgetTitle: ElementRef;
    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;
    @ViewChild('graphLegend') private dygraphLegend: ElementRef;
    @ViewChild('dygraph') private dygraph: ElementRef;
    @ViewChild(MatSort) sort: MatSort;

    @ViewChild('multigraphContainer', {read: ElementRef}) multigraphContainer: ElementRef;
    @ViewChild('multigraphHeaderRow', {read: ElementRef}) multigraphHeaderRow: ElementRef;

    @ViewChildren('graphLegend', {read: ElementRef}) graphLegends: QueryList<ElementRef>;
    @ViewChildren('graphdiv', { read: ElementRef}) graphdivs: QueryList<ElementRef>;
    Object = Object;
    inViewport: any = {};
    private subscription: Subscription = new Subscription();
    isDataLoaded = false;
    private isStackedGraph = false;
    chartType = 'line';
    multiLimitMessage = '';

    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;

    options: IDygraphOptions = {
        labels: ['x'],
        labelsUTC: false,
        labelsKMB: true,
        connectSeparatedPoints: true,
        drawPoints: false,
        //  labelsDivWidth: 0,
        // legend: 'follow',
        logscale: false,
        digitsAfterDecimal: 2,
        fillAlpha: 0.55,
        stackedGraph: this.isStackedGraph,
        stackedGraphNaNFill: 'none', // default to all will reserve gap
        strokeWidth: 1,
        strokeBorderWidth: this.isStackedGraph ? 0 : 0,
        highlightSeriesBackgroundAlpha: 1,
        highlightSeriesBackgroundColor: 'rgb(255, 255, 255)',
        isZoomedIgnoreProgrammaticZoom: true,
        hideOverlayOnMouseOut: true,
        isCustomZoomed: false,
        highlightSeriesOpts: {
            strokeWidth: 2,
            highlightCircleSize: 5
        },
        xlabel: '',
        ylabel: '',
        y2label: '',
        axisLineWidth: 0,
        axisTickSize: 0,
        axisLineColor: '#fff',
        axes: {
            y: {
                valueRange: [null, null],
                tickFormat: {}
            },
            y2: {
                valueRange: [null, null],
                tickFormat: {},
                drawGrid: true,
                independentTicks: true
            }
        },
        series: {},
        visibility: [],
        visibilityHash: {},
        gridLineColor: '#ccc',
        isIslandLegendOpen: false,
        initZoom: null
    };
    data: any = { ts: [[0]] };
    size: any = { width: 120, height: 60};
    widgetOutputElHeight = 60;
    isEditContainerResized = false;
    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    legendWidth;
    legendHeight;
    nQueryDataLoading: number;
    error: any;
    errorDialog: MatDialogRef < ErrorDialogComponent > | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef < DebugDialogComponent > | null;
    storeQuery: any;
    legendDisplayColumns = [];
    needRequery = false;

    legendDataSource; // = new MatTableDataSource(this.tmpArr);

    timer = null;
    preventSingleClick: boolean;
    clickTimer: any;
    meta: any = {};

    // MULTIGRAPH
    multigraphEnabled = false; // flag from multigraph settings 'enabled'
    displayMultigraph = false; // this is can be multigraph with all 'g'
    multiConf: any = {};
    multigraphMode = 'grid'; // grid || freeflow
    multigraphColumns: string[] = [];
    freeflowBreak = 1;
    graphData: any = {}; // { y: { x: { ts: [[0]] }}};
    graphRowLabelMarginLeft: 0;

    // TIMESERIES LEGEND
    // tsHighlightData: any = {};
    // private _tsTickData: BehaviorSubject<any> = new BehaviorSubject({});

    tsLegendOptions: any = {
        open: false,
        trackMouse: false
    };

    legendFocus: any = false;

    // EVENTS
    buckets: any[] = []; // still need this, as dygraph was looking for it
    events: any[];
    showEventStream = false; // Local flag whether island open
    eventsWidth: number;
    startTime: number;
    endTime: number;
    timezone: string = 'local';
    previewEventsCount = 100;
    eventsCount = 10000;
    eventsLoading: boolean = false;
    axisLabelsWidth = 55;
    // tslint:disable-next-line: max-line-length
    visibleSections: any = { 'queries' : true, 'time': false, 'axes': false, 'legend': false, 'multigraph': false, 'events': false };
    formErrors: any = {};
    eventsError = '';
    resizeSensor: any;
    currentGraphSize: any;

    // behaviors that get passed to island legend
    private _buckets: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _timeRange: BehaviorSubject<any> = new BehaviorSubject({});
    private _timezone: BehaviorSubject<any> = new BehaviorSubject('');
    private _expandedBucketIndex: BehaviorSubject<number> = new BehaviorSubject(-1);

    constructor(
        private cdRef: ChangeDetectorRef,
        private interCom: IntercomService,
        public dialog: MatDialog,
        private dataTransformer: DatatranformerService,
        private utilService: UtilsService,
        private elRef: ElementRef,
        private unit: UnitConverterService,
        private logger: LoggerService,
        private multiService: MultigraphService,
        private iiService: InfoIslandService,
        private themeService: ThemeService,
        private dateUtil: DateUtilsService
    ) { }

    ngOnInit() {
        // act like conversion for widget with or without multigraph
        if (!this.widget.settings.multigraph) {
            this.multigraphEnabled = false;
            //if (!this.widget.settings.multigraph.enabled) {
            //     this.widget.settings.multigraph.enabled = false;
            // }
        } else if (this.widget.settings.multigraph && !this.widget.settings.multigraph.hasOwnProperty('enabled')) {
            this.multigraphEnabled = true;
            this.widget.settings.multigraph.enabled = true;
        } else if (this.widget.settings.multigraph && this.widget.settings.multigraph.hasOwnProperty('enabled')) {
            this.multigraphEnabled = this.widget.settings.multigraph.enabled;
        }
        this.multiConf = this.multiService.buildMultiConf(this.widget.settings.multigraph);
        this.displayMultigraph = (this.multiConf.x || this.multiConf.y) ? true : false;
        this.visibleSections.queries = this.mode === 'edit' ? true : false;
        this.options.isIslandLegendOpen = this.mode === 'explore' || this.mode === 'snap';
        this.widget.settings.chartOptions = this.widget.settings.chartOptions || {};
        this.doRefreshData$ = new BehaviorSubject(false);
        this.doRefreshDataSub = this.doRefreshData$
            .pipe(
                debounceTime(1000)
            )
            .subscribe(trigger => {
                if (trigger) {
                    this.resetYZoom();
                    this.refreshData();
                }
            });

        this.subscription.add(this.themeService.getThemeType().subscribe( themeType => {
            this.logger.log('THEME TYPE', { themeType });

            this.options = {...this.options,
                highlightSeriesBackgroundColor: (themeType === 'light') ? 'rgb(255,255,255)' : 'rgb(60,75,90)'
            };
            this.cdRef.markForCheck();
        }));

        // subscribe to event stream
        this.subscription.add(this._buckets.pipe().subscribe( buckets => {
            this.buckets = buckets;
        }));

        this.subscription.add(this.interCom.responseGet().subscribe((message: IMessage) => {
            let overrideTime;
            switch (message.action) {
                case 'TimeChanged':
                    this.options.isCustomZoomed = false;
                    overrideTime = this.widget.settings.time.overrideTime;
                    if ( !overrideTime ) {
                        this.resetYZoom();
                        this.refreshData();
                    }
                    break;
                case 'reQueryData':
                    if ( !message.id || message.id === this.widget.id ) {
                        this.resetYZoom();
                        this.refreshData();
                    }
                    break;
                case 'TimezoneChanged':
                    if ( !message.id || message.id === this.widget.id ) {
                        this.setTimezone(message.payload.zone);
                        this.options = { ...this.options };
                        this.cdRef.markForCheck();
                    }
                    break;
                case 'ZoomDateRange':
                    if ( !message.id || message.id === this.widget.id ) {
                        overrideTime = this.widget.settings.time.overrideTime;
                        if ( message.payload.date.isZoomed && overrideTime ) {
                            const oStartUnix = this.dateUtil.timeToMoment(overrideTime.start, message.payload.date.zone).unix();
                            const oEndUnix = this.dateUtil.timeToMoment(overrideTime.end, message.payload.date.zone).unix();
                            if ( oStartUnix <= message.payload.date.start && oEndUnix >= message.payload.date.end ) {
                                this.options.isCustomZoomed = message.payload.date.isZoomed;
                                this.widget.settings.time.zoomTime = message.payload.date;
                                this.resetYZoom();
                                this.refreshData();
                            }
                        // tslint:disable-next-line: max-line-length
                        } else if ( (message.payload.date.isZoomed && !overrideTime && !message.payload.overrideOnly) || (this.options.isCustomZoomed && !message.payload.date.isZoomed) ) {
                            this.options.isCustomZoomed = message.payload.date.isZoomed;
                            this.resetYZoom();
                            this.refreshData();
                        }
                        // unset the zoom time
                        if ( !message.payload.date.isZoomed ) {
                            delete this.widget.settings.time.zoomTime;
                        }
                    }
                    break;
                case 'tsLegendOptionsChange':
                    this.tsLegendOptions = message.payload;
                    if (!this.tsLegendOptions.open) {
                        this.legendFocus = false;
                    }
                    break;
                case 'tsLegendFocusChange':
                    if (message.id === this.widget.id) {
                        this.legendFocus = message.payload;
                    } else {
                        this.legendFocus = false;
                        // this.cdRef.markForCheck();
                    }
                    break;
                case 'SnapshotMeta':
                    this.meta = message.payload;
                    break;
            }

            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'InfoIslandClosed':
                        this.options.isIslandLegendOpen = false;
                        this.updatedShowEventStream(false);
                        break;
                    case 'tsLegendRequestWidgetSettings':
                        this.multiConf = this.multiService.buildMultiConf(this.widget.settings.multigraph);
                        this.displayMultigraph = (this.multiConf.x || this.multiConf.y) ? true : false;
                        let tsLegendOptions;
                        if (this.displayMultigraph && message.payload.multigraph) {
                            tsLegendOptions = this.graphData[message.payload.multigraph.y][message.payload.multigraph.x].options;
                        } else {
                            tsLegendOptions = this.options;
                        }
                        this.interCom.requestSend({
                            id: this.widget.id,
                            action: 'tsLegendWidgetSettingsResponse',
                            payload: {
                                settings: this.widget.settings,
                                options: tsLegendOptions
                            }
                        });
                        break;
                    case 'tsLegendLogscaleChange':
                        const axes = {...this.widget.settings.axes};
                        axes.y1.enabled = message.payload.y1;
                        axes.y1.scale = (message.payload.y1 === true) ? 'logscale' : 'linear';

                        axes.y2.enabled = message.payload.y2;
                        axes.y2.scale = (message.payload.y2 === true) ? 'logscale' : 'linear';

                        this.updateConfig({
                            action: 'SetAxes',
                            payload: {
                                data: axes
                            }
                        });
                        break;
                    case 'tsLegendToggleSeries':
                        this.tsLegendToggleChartSeries(message.payload.batch, message.payload.visible, message.payload.multigraph);
                        break;
                    case 'tsLegendRequestUpdatedOverlayOrigin':
                        let tsOriginOverlayRef: any;
                        if (message.payload.multigraph) {
                            tsOriginOverlayRef = (this.multigraphContainer.nativeElement).querySelector('.graph-cell-' + message.payload.multigraph.yIndex + '-' + message.payload.multigraph.xIndex);
                        } else {
                            tsOriginOverlayRef = this.elRef.nativeElement.closest('.widget-loader');
                        }
                        if ( this.mode === 'view' ) {
                            this.iiService.updatePositionStrategy(tsOriginOverlayRef, 'connected');
                        }
                        break;
                    case 'UpdateExpandedBucketIndex':
                        this._expandedBucketIndex.next(message.payload.index);
                        break;
                    case 'updatedWidgetGroup':
                        this.nQueryDataLoading--;
                        if (!this.isDataLoaded) {
                            this.isDataLoaded = true;
                            this.resetChart();
                        }
                        if (message.payload.error) {
                            this.error = message.payload.error;
                            this.cdRef.markForCheck();
                        } else {
                            this.error = null;
                            const rawdata = message.payload.rawdata;
                            this.setTimezone(message.payload.timezone);
                            this.resetChart(); // need to reset this data

                            // render multigraph or not is here
                            let limitGraphs = {};
                            this.multiConf = this.multiService.buildMultiConf(this.widget.settings.multigraph);
                            this.displayMultigraph = (this.multiConf.x || this.multiConf.y) ? true : false;
                            // this.multigraphEnabled = this.widget.settings.multigraph.enabled;
                            if (this.displayMultigraph && this.multigraphEnabled) {
                                // disable events and legend
                                if (this.widget.settings.visual && this.widget.settings.visual.showEvents) {
                                    this.updateConfig({action: 'SetShowEvents', payload: {data: {showEvents: false}}});
                                }
                                if (this.widget.settings.legend && this.widget.settings.legend.display) {
                                    const legend = this.widget.settings.legend;
                                    legend.display = false;
                                    this.updateConfig({action: 'SetLegend', payload: {data: legend}});
                                }
                                this.multigraphMode = this.widget.settings.multigraph.layout;
                                // result graphRowLabelMarginLeft since we have new data
                                this.graphRowLabelMarginLeft = 0;
                                // fill out tag values from rawdata
                                let results = this.multiService.fillMultiTagValues(this.widget, this.multiConf, rawdata);
                                results = this.multiService.removeEmptyRowsColumns(results);
                                const maxGraphs = 100;
                                const rowKeys = this.getGraphDataObjectKeys(results);
                                const colKeys = rowKeys.length ? this.getGraphDataObjectKeys(results[rowKeys[0]]) : [];
                                const maxCols = colKeys.length <= maxGraphs ? colKeys.length : maxGraphs;
                                let numOfRows = 1;
                                if (rowKeys.length * colKeys.length > maxGraphs) {
                                    if (colKeys.length < maxGraphs) {
                                        numOfRows = Math.ceil(maxGraphs / colKeys.length);
                                    }
                                    // fill up
                                    for (let i = 0; i < numOfRows; i++) {
                                        for (let j = 0; j < maxCols; j++) {
                                            if (!limitGraphs[rowKeys[i]]) {
                                                limitGraphs[rowKeys[i]] = {};
                                            }
                                            limitGraphs[rowKeys[i]][colKeys[j]] = results[rowKeys[i]][colKeys[j]];
                                        }
                                    }
                                } else {
                                    limitGraphs = this.utilService.deepClone(results);
                                }
                                let firstGraph = true;
                                // we need to convert to dygraph for these multigraph
                                for (const ykey in limitGraphs) {
                                    if (limitGraphs.hasOwnProperty(ykey)) {
                                        for (const xkey in limitGraphs[ykey]) {
                                            if (limitGraphs[ykey].hasOwnProperty(xkey)) {
                                                limitGraphs[ykey][xkey].ts = [[0]];
                                                const options = this.utilService.deepClone(this.options);
                                                options.isIslandLegendOpen = firstGraph && options.isIslandLegendOpen;
                                                firstGraph = false;
                                                // preserve previous series and visibility so we can remap in data transformer
                                                // this might not need anymore since it rarely hit this.
                                                if (this.graphData.hasOwnProperty(ykey)) {
                                                    if (this.graphData[ykey].hasOwnProperty(xkey)) {
                                                        if (this.graphData[ykey][xkey].hasOwnProperty('options')) {
                                                            const prevOptions = this.utilService.deepClone(this.graphData[ykey][xkey].options);
                                                            // console.log('PREVIOUS OPTIONS', prevOptions);
                                                            options.series = prevOptions.series;
                                                            options.visibility = prevOptions.visibility;
                                                            options.visibilityHash[prevOptions.hash] = prevOptions.visbilityHash;
                                                        }
                                                    }
                                                }

                                                limitGraphs[ykey][xkey].ts = this.dataTransformer.yamasToDygraph(
                                                     this.widget, options, limitGraphs[ykey][xkey].ts, limitGraphs[ykey][xkey]
                                                );
                                                limitGraphs[ykey][xkey].options = options;
                                            }
                                        }
                                    }
                                }
                            } else {
                                let graphs: any = {};
                                this.data.ts = this.dataTransformer.yamasToDygraph(this.widget, this.options, this.data.ts, rawdata);
                                if ( this.widget.settings.legend.display ) {
                                    this.widget.settings.chartOptions.visbilityHash = this.options.visibilityHash;
                                }
                                this.data = { ...this.data };
                                graphs['y'] = {};
                                graphs['y']['x'] = this.data;
                                graphs['y']['x'].options = this.options;
                                limitGraphs = graphs;
                            }
                            this.setMultigraphColumns(limitGraphs);
                            this.graphData = {...limitGraphs};
                            if (environment.debugLevel.toUpperCase() === 'TRACE' ||
                                environment.debugLevel.toUpperCase() === 'DEBUG' ||
                                environment.debugLevel.toUpperCase() === 'INFO') {
                                    this.debugData = rawdata.log; // debug log
                            }
                            // console.log("graphData", this.graphData)
                            // we should not call setLegendDiv here as it's taken care in getUpdatedWidgetConfig
                            this.setLegendDiv();
                            if (!this.displayMultigraph) {
                                this.refreshLegendSource();
                            }
                            // delay required. sometimes, edit to viewmode the chartcontainer width is not available
                            // also need to update view in edit mode
                            setTimeout(() => {
                                // if ( this.mode !== 'edit'  ) {
                                    this.setSize();
                                // }
                                if (!this.displayMultigraph) {
                                    this.legendDataSource.sort = this.sort;
                                }
                                // this is for initial load before scroll event on widget
                                this.applyMultiLazyLoad();
                            });
                        }
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
                        // reset useDBFilter to true
                        this.widget.settings.useDBFilter = true;
                        this.cdRef.detectChanges();
                        break;
                    case 'updatedEvents':
                        if (message.payload.error) {
                            this.events = [];
                            this.eventsError = message.payload.error;
                        } else {
                            this.events = message.payload.events;
                            this.eventsError = '';
                        }
                        this.eventsLoading = false;
                        // this.events = message.payload.events;
                        this.cdRef.detectChanges();
                        break;
                    case 'widgetDragDropEnd':
                        if(this.resizeSensor) {
                            this.resizeSensor.detach();
                        }
                        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                            this.newSize$.next(1);
                        });
                        break;
                }
            }
        }));

        this.setDefaultEvents();
        this.getEvents();

        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(() => this.refreshData(this.mode !== 'view' ? false : true), 0);

        // Timing issue? trying to move to afterViewInit
        this.setOptions();
        if ( this.mode === 'snap' || this.mode === 'explore' ) {
            const chartOptions = this.widget.settings.chartOptions;
            // override selections
            this.options.visibilityHash = chartOptions && chartOptions.visbilityHash ? chartOptions.visbilityHash : {};
            this.options.initZoom = {y: {}, y2: {}};
            // tslint:disable-next-line: max-line-length
            this.options.initZoom.y = chartOptions.axes && chartOptions.axes.y ? {...this.options.axes.y, valueRange: chartOptions.axes.y} : null;
            // tslint:disable-next-line: max-line-length
            this.options.initZoom.y2 = chartOptions.axes && chartOptions.axes.y2 ? {...this.options.axes.y2, valueRange: chartOptions.axes.y} : null;
        }
    }

    ngAfterViewInit() {

        // since we don't compute any size here just trigger the observal
        ElementQueries.listen();
        ElementQueries.init();
        // true is just a dummy value to trigger
        const dummyFlag = 1;
        this.newSize$ = new BehaviorSubject(dummyFlag);
        this.newSizeSub = this.newSize$.subscribe(flag => {
            const _size = this.widgetOutputElement.nativeElement.getBoundingClientRect();
            if (JSON.stringify(_size) !== JSON.stringify(this.currentGraphSize)) {
                setTimeout(() => this.setSize(), 0);
            }
        });
        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
            this.newSize$.next(dummyFlag);
        });
    }
    scrollToElement($element): void {
        setTimeout(() => {
            $element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
        });
    }

    refreshLegendSource() {
        this.legendDataSource = new MatTableDataSource(this.buildLegendData());
    }

    buildLegendData() {
        const series = this.options.series;
        const table = [];
        this.legendDisplayColumns = ['color'].concat(this.widget.settings.legend.columns || []).concat(['name']);
        // tslint:disable-next-line: forin
        for (const index in series) {
            let config;
            if (series.hasOwnProperty(index)) {
                config = series[index];
            } else {continue; }
            const row = {};
            row['srcIndex'] = index;
            for (let column = 0; column < this.legendDisplayColumns.length; column++) {
                const columnName = this.legendDisplayColumns[column];
                switch (columnName) {
                    case 'color':
                        row['color'] = config.color;
                        break;
                    case 'name':
                        row[columnName] = this.getSeriesLabel(index);
                        break;
                    default:
                        row[columnName] = this.getSeriesAggregate(index, columnName, false);
                        break;
                }
            }
            table.push(row);
        }
        return table;
    }

    setOptions() {
        this.setLegendDiv();
        this.setAxesOption();
    }

    resetChart() {
        this.options = {...this.options, labels: ['x'], axes: {
            y: {
                valueRange: [null, null],
                tickFormat: {}
            },
            y2: {
                valueRange: [null, null],
                tickFormat: {},
                drawGrid: true,
                independentTicks: true
            }
        }
    };
        this.data = { ts: [[0]] };
    }

    updateConfig(message) {
        let qindex = -1;
        let mindex = -1;
        switch ( message.action ) {
            case 'SetMetaData':
                this.utilService.setWidgetMetaData(this.widget, message.payload.data);
                break;
            case 'SetTimeError':
                if ( message.payload.error ) {
                    this.formErrors.time = true;
                } else {
                    delete this.formErrors.time;
                }
                break;
            case 'SetTimeConfiguration':
                delete this.formErrors.time;
                this.utilService.setWidgetTimeConfiguration(this.widget, message.payload.data);
                this.doRefreshData$.next(true);
                this.needRequery = true; // set flag to requery if apply to dashboard
                break;
            case 'SetStackOrder':
                this.widget.settings.visual.stackOrder = message.payload.orderBy;
                this.refreshData(false);
                break;
            case 'SetAlerts':
                this.widget.settings.thresholds = message.payload.data;
                this.setAlertOption();
                this.options = { ...this.options };
                break;
            case 'SetAxes' :
                this.updateAlertValue(message.payload.data); // update the alert unit type and value
                this.widget.settings.axes = { ...this.widget.settings.axes, ...message.payload.data };
                this.setAxesOption();
                this.options = { ...this.options };
                this.refreshData(false);
                break;
            case 'SetLegend':
                this.setLegend(message.payload.data);
                this.cdRef.detectChanges();
                this.refreshLegendSource();
                this.legendDataSource.sort = this.sort;
                this.setSize();
                break;
            case 'ChangeAxisLabel':
                const payload = message.payload;
                this.widget.settings.axes[payload.axis].label = payload.label;
                break;
            case 'UpdateQuery':
                this.utilService.updateQuery(this.widget, message.payload);
                this.widget.queries = [...this.widget.queries];
                this.widget = {...this.widget};
                this.setOptions();
                this.needRequery = true;
                this.doRefreshData$.next(true);
                break;
            case 'UpdateQueryOrder':
                this.widget.queries = this.utilService.deepClone(message.payload.queries);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricOrder':
                qindex = this.widget.queries.findIndex(q => q.id === message.id );
                this.widget.queries[qindex] = message.payload.query;
                this.widget.queries = this.utilService.deepClone(this.widget.queries);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryVisual':
                qindex = this.widget.queries.findIndex(d => d.id === message.id);
                mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === message.payload.mid);
                const curtype = this.widget.queries[qindex].metrics[mindex].settings.visual.type || 'line';
                let mids = [];
                if ( message.payload.visual.axis && (curtype === 'line') ) {
                    // tslint:disable-next-line: max-line-length
                    mids = this.widget.queries[qindex].metrics.filter(d => ['area', 'bar'].includes(d.settings.visual.type)).map(d => d.id);
                }
                this.utilService.updateQueryVisual(this.widget, message.id, message.payload.mid, message.payload.visual, mids);
                if ( message.payload.visual.axis ) {
                    this.setAxesOption();
                }
                this.options = { ...this.options };
                this.utilService.createNewReference(this.widget.queries, [qindex]);
                this.widget = { ...this.widget };
                this.refreshData(false);
                this.cdRef.detectChanges();
                break;
            case 'UpdateQueryMetricVisual':
                qindex = this.widget.queries.findIndex(d => d.id === message.id);
                this.setVisualization(message.id, message.payload.mid, message.payload.visual);
                this.options = { ...this.options };
                this.utilService.createNewReference(this.widget.queries, [qindex]);
                this.widget = { ...this.widget };
                this.refreshData(false);
                this.cdRef.detectChanges();
                break;
            case 'SetShowEvents':
                this.setShowEvents(message.payload.showEvents);
                break;
            case 'SetEventQuerySearch':
                this.setEventQuerySearch(message.payload.search);
                break;
            case 'SetEventQueryNamespace':
                this.setEventQueryNamespace(message.payload.namespace);
                break;
            case 'ToggleQueryVisibility':
                this.utilService.toggleQueryVisibility(this.widget, message.id);
                this.widget.queries = this.utilService.deepClone(this.widget.queries);
                this.needRequery = true;
                this.doRefreshData$.next(true);
                break;
            case 'ToggleQueryMetricVisibility':
                this.utilService.toggleQueryMetricVisibility(this.widget, message.id, message.payload.mid);
                this.needRequery = true;
                this.doRefreshData$.next(true);
                break;
            case 'CloneQuery':
                this.utilService.cloneQuery(this.widget, message.id);
                this.widget = this.utilService.deepClone(this.widget);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQuery':
                this.utilService.deleteQuery(this.widget, message.id);
                this.setAxesOption();
                this.widget = this.utilService.deepClone(this.widget);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQueryMetric':
                this.utilService.deleteQueryMetric(this.widget, message.id, message.payload.mid);
                this.setAxesOption();
                this.widget.queries = this.utilService.deepClone(this.widget.queries);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ToggleDBFilterUsage':
                this.widget.settings.useDBFilter = message.payload.apply;
                this.refreshData();
                this.needRequery = message.payload.reQuery;
                break;
            case 'UpdateMultigraph':
                console.log('this is call tpo update mulrifre', message);
                this.widget.settings.multigraph = message.payload.changes;
                this.multigraphMode = this.widget.settings.multigraph.layout;
                // will depend on message.payload.requery to handle requery or not
                if (message.payload.requery) {
                    this.doRefreshData$.next(true);
                    this.needRequery = true;
                } else {
                    this.refreshData(false);
                }
                break;
            case 'ToggleInfectiousNan':
                this.utilService.toggleQueryInfectiousNan(this.widget, message.payload.checked);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
        }
    }

    setTitle(title) {
        this.widget.settings.title = title;
    }

    // by default it should not call change detection unless we set it
    setSize() {
        // if edit mode, use the widgetOutputEl. If in dashboard mode, go up out of the component,
        // and read the size of the first element above the componentHostEl
        const nativeEl = ( this.mode !== 'view' ) ?
            this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

        const newSize = nativeEl.getBoundingClientRect();
        const heightMod = this.mode === 'edit' ? 0.6 : 0.7;
        // tslint:disable-next-line:max-line-length
        this.widgetOutputElHeight = !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement.getBoundingClientRect().height * heightMod
                                                            : this.widgetOutputElement.nativeElement.getBoundingClientRect().height + 70;
        // let newSize = outputSize;
        let nWidth, nHeight, padding;

        const legendSettings = this.widget.settings.legend;
        const legendColumns = legendSettings.columns ? legendSettings.columns.length : 0;

        let widthOffset = 0;
        let heightOffset = 0;
        let labelLen = 0;
        for (const i in this.options.series) {
            if (this.options.series.hasOwnProperty(i)) {
                labelLen = labelLen < this.options.series[i].label.length ? this.options.series[i].label.length : labelLen;
            }
        }
        if (legendSettings.display &&
            (legendSettings.position === 'left' ||
                legendSettings.position === 'right')) {
            widthOffset = 45 + labelLen * 6.5 + 60 * legendColumns;
        }

        if (legendSettings.display &&
            (legendSettings.position === 'top' ||
                legendSettings.position === 'bottom')) {
            heightOffset = newSize.height * .25;
            heightOffset = heightOffset <= 80 ? 80 : heightOffset;
        }

        if ( this.mode !== 'view' ) {
            let titleSize = { width: 0, height: 0 };
            if (this.widgetTitle) {
                titleSize = this.widgetTitle.nativeElement.getBoundingClientRect();
            }
            padding = 15; // 8px top and bottom
            nHeight = newSize.height - heightOffset;

            if (this.widget.settings.visual.showEvents) {  // give room for events
                nHeight = nHeight - 45;
            }

            nWidth = newSize.width - widthOffset - 30;
        } else {
            padding = 10; // 10px on the top
            const paddingSides = 1;
            nHeight = newSize.height - heightOffset - (padding * 2);

            if (this.widget.settings.visual.showEvents) {  // give room for events
                nHeight = nHeight - 35;
            }

            // nWidth = newSize.width - widthOffset  - (padding * 2);
            nWidth = newSize.width - widthOffset - paddingSides;
        }

        if (this.displayMultigraph && this.widget.settings.multigraph) {
            const multigraphSettings = this.widget.settings.multigraph;

            if (this.multigraphMode === 'freeflow') {
                // tslint:disable-next-line: max-line-length
                this.freeflowBreak = (multigraphSettings.gridOptions.viewportDisplay === 'custom') ? multigraphSettings.gridOptions.custom.y : 3;
            }

            const rowKeys = this.getGraphDataObjectKeys(this.graphData);
            const rowCount = rowKeys.length;
            // find max col count
            const colKeys = this.getGraphDataObjectKeys(this.graphData[rowKeys[0]]);
            const colCount = colKeys.length;

            // 15px for column header
            const gridHeaderOffset = (this.multigraphMode === 'grid' && colKeys[0] !== 'x') ? 15 : 0;
            // 17px for row header (15px for height, and 2px margin-top)
            const rowHeaderOffset = (rowCount > 0 && rowKeys[0] !== 'y') ? 17 : 0;
            // 6px for graph cell padding (3px left/right, or 3px top/bottom);
            const paddingOffset = 6;

            let tWidth;
            let tHeight;

            // if we try to autoFit
            if (multigraphSettings.gridOptions.viewportDisplay === 'fit') {
                // calculate width and height, minus potential border widths
                // default columns and rows is 3x3
                tWidth = (((nWidth - paddingOffset) / ((colCount < 3) ? colCount : 3))) - paddingOffset;
                tHeight = (nHeight / ((rowCount < 3) ? rowCount : 3)) - (paddingOffset + rowHeaderOffset);

                // calculate grid header offset
                if (colCount > 3) {
                    tHeight = tHeight - (gridHeaderOffset / ((rowCount > 3) ? 3 : rowCount));
                }

                if (rowCount === 1 && rowKeys[0] === 'y') {
                    tHeight = tHeight - gridHeaderOffset;
                }

                if (this.multigraphMode === 'freeflow') {
                    tHeight = tHeight + gridHeaderOffset + paddingOffset;
                }
            } else {
                const customY = multigraphSettings.gridOptions.custom.y;
                let customX = multigraphSettings.gridOptions.custom.x;

                if (this.multigraphMode === 'freeflow') {
                    customX = 3;
                }

                tWidth = (((nWidth - paddingOffset) / ((colCount < customY) ? colCount : customY))) - paddingOffset;
                tHeight = (nHeight / ((rowCount < customX) ? rowCount : customX)) - (paddingOffset + rowHeaderOffset);

                // calculate grid header offset
                // tHeight = tHeight - (gridHeaderOffset / ((rowCount > customX) ? customX : rowCount));
                if (colCount > customX) {
                    tHeight = tHeight - (gridHeaderOffset / ((rowCount > customX) ? customX : rowCount));
                }

                if (rowCount === 1 && rowKeys[0] === 'y') {
                    tHeight = tHeight - gridHeaderOffset;
                }

                if (this.multigraphMode === 'freeflow') {
                    tHeight = tHeight + gridHeaderOffset + paddingOffset;
                }

            }

            // do we ned a minimum size?
            // minimum size is 200x100
            this.size = { width: ((tWidth >= 200) ? tWidth : 200), height: ((tHeight >= 100) ? tHeight : 100) };
            this.legendWidth = !widthOffset ? this.size.width + 'px' : widthOffset + 'px';
            this.legendHeight = !heightOffset ? this.size.height + 'px' : heightOffset + 'px';
        } else {

            this.legendWidth = !widthOffset ? nWidth + 'px' : widthOffset + 'px';
            this.legendHeight = !heightOffset ? nHeight + 'px' : heightOffset + 'px';

            this.size = { width: nWidth, height: nHeight };
            // this.size = { width: nWidth, height: nHeight > 250 ? nHeight : 250 }; on edit
        }
        // Canvas Width resize
        this.eventsWidth = nWidth - (this.axisEnabled(this.options.series).size * this.axisLabelsWidth);

        this.currentGraphSize = this.widgetOutputElement.nativeElement.getBoundingClientRect();

        // after size it set, tell Angular to check changes
        this.cdRef.detectChanges();
    }

    handleEditResize(e) {
        this.isEditContainerResized = true;
    }

    axisEnabled(series) {
        const axis = new Set();
        for (const [key, value] of Object.entries(series)) {
            axis.add(series[key].axis);
        }
        return axis;
    }

    setTimezone(timezone) {
        this.timezone = timezone;
        this.options.labelsUTC = timezone === 'utc' ? true : false;
        this._timezone.next(timezone);
    }

    setAxesOption() {
        const axisKeys = Object.keys(this.widget.settings.axes);
        const thresholds = this.widget.settings.thresholds || {};
        for (let i = 0; i < axisKeys.length; i++ ) {
            const config = this.widget.settings.axes[axisKeys[i]];
 //           if (Object.keys(config).length > 0) {
            const chartAxisID = axisKeys[i] === 'y1' ? 'y' : axisKeys[i] === 'y2' ? 'y2' : 'x';
            const axis = this.options.axes[chartAxisID];
            axis.valueRange = [null, null];
            if ( !isNaN( parseFloat(config.min) ) ) {
                axis.valueRange[0] =  config.min;
            }
            const max = parseFloat(config.max);
            if ( !isNaN(max) ) {
                axis.valueRange[1] = max + max * 0.0001;
            }

            if (  axisKeys[i] === 'y1' || axisKeys[i] === 'y2' ) {
                axis.logscale = config.scale === 'logscale' ? true : false;
                if ( axisKeys[i] === 'y1' ) {
                    this.options.logscale = axis.logscale;
                }
                const label = config.label ? config.label.trim() : '';
                this.options[chartAxisID + 'label'] = label;
            }

            axis.drawAxis = config.enabled || axisKeys[i] === 'y1' && typeof config.enabled === 'undefined' ? true : false;
            // move series from y2 to y1 if y2 is disabled
            if ( this.options.series &&  axisKeys[i] === 'y2' && !config.enabled) {
                for ( let k in this.options.series ) {
                    if (this.options.series[k]) {
                        this.options.series[k].axis = 'y';
                    }
                }
                const wqueries = this.widget.queries;
                for ( let m = 0; m < wqueries.length; m++ ) {
                    const wmetrics = wqueries[m].metrics;
                    for ( let n = 0; n < wmetrics.length; n++ ) {
                        // wmetrics[n].settings.visual.axis = 'y1';
                    }
                }
            }

            // change threshold axis y2=>y1
            if ( axisKeys[i] === 'y2' && !config.enabled  && Object.keys(thresholds).length ) {
                for ( const key in thresholds ) {
                    if (thresholds.hasOwnProperty(key)) {
                        thresholds[key].axis = 'y1';
                    }
                }
                // this.setAlertOption();
            }

            const decimals = !config.decimals || config.decimals.toString().trim() === 'auto' ? 'auto' : config.decimals;
            const unit = config.unit ? config.unit : 'auto';
            axis.tickFormat = { unit: unit, precision: decimals, unitDisplay: true };
            //}
        }

        // draw the axis if one series on the axis
        let y1Enabled = false, y2Enabled = false;
        const queries = this.widget.queries;
        for ( let m = 0; m < queries.length; m++ ) {
            const metrics = queries[m].metrics;
            for ( let n = 0; n < metrics.length; n++ ) {
                const vConfig = metrics[n].settings.visual;
                if ( !vConfig.axis || vConfig.axis === 'y1' ) {
                    y1Enabled = true;
                } else if ( vConfig.axis === 'y2') {
                    y2Enabled = true;
                }
            }
        }
        // y.drawaxis always to be true or it causing y2 not to be drawn
        this.options.axes.y.drawAxis = true;
        this.options.axes.y.axisLabelWidth = y1Enabled ? 50 : 0;
        this.options.ylabel = y1Enabled ? this.options.ylabel : '';
        this.options.y2label = y2Enabled ? this.options.y2label : '';
        this.options.axes.y2.axisLabelWidth = y2Enabled ? 50 : 0;
        this.widget.settings.axes.y2.enabled = y2Enabled ? true : false;
        this.widget.settings.axes.y1.enabled = y1Enabled ? true : false;
    }

    updateAlertValue(nConfig) {
        const thresholds = this.widget.settings.thresholds || {};
        for ( const k in nConfig ) {
            if (nConfig.hasOwnProperty(k)) {
                const oConfig = this.widget.settings.axes ? this.widget.settings.axes[k] : <Axis>{};
                const oUnit = this.unit.getDetails(oConfig.unit);
                const nUnit = this.unit.getDetails(nConfig[k].unit);
                for (const i in thresholds) {
                    if (thresholds[i].axis === k) {
                        thresholds[i].value = oUnit ? thresholds[i].value * oUnit.m : thresholds[i].value;
                        thresholds[i].value = nUnit ? thresholds[i].value / nUnit.m : thresholds[i].value;
                    }
                }
            }
        }
    }

    setAlertOption() {
        const thresholds = this.widget.settings.thresholds || {};
        this.options.thresholds =  [] ;
        Object.keys(thresholds).forEach( k => {
            const threshold = thresholds[k];
            if ( threshold.value !== '' ) {
                let lineType;
                switch ( threshold.lineType ) {
                    case 'solid':
                        lineType = [];
                        break;
                    case 'dashed':
                        lineType = [4, 4];
                        break;
                    case 'dotted':
                        lineType = [2, 3];
                        break;
                    case 'dot-dashed':
                        lineType = [4, 4, 2];
                        break;
                }
                const scaleId = !threshold.axis || threshold.axis !== 'y2' ? 'y' : threshold.axis;
                const axis = this.widget.settings.axes ? this.widget.settings.axes[threshold.axis] : null;
                const oUnit = axis ? this.unit.getDetails(axis.unit) : null;
                const o = {
                    value: oUnit ? threshold.value * oUnit.m : threshold.value,
                    scaleId: scaleId,
                    borderColor: threshold.lineColor,
                    borderWidth: parseInt(threshold.lineWeight, 10),
                    borderDash: lineType
                };
                this.options.thresholds.push(o);
            }
        });
    }

    setVisualization( qid, mid, visual ) {
        const qindex =  this.widget.queries.findIndex(d => d.id === qid);
        const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        const curtype = this.widget.queries[qindex].metrics[mindex].settings.visual.type || 'line';
        const multiGraphConf = this.widget.settings.multigraph;
        // TODO: fix it
        const isMetricMultiGraph = this.displayMultigraph && multiGraphConf && multiGraphConf.chart[0].displayAs !== 'g' ? true : false;
        if ( curtype === 'line' && visual.type && !isMetricMultiGraph && ['area', 'bar'].includes(visual.type) ) {
            visual.axis = this.widget.queries[qindex].metrics[mindex].settings.visual.axis || 'y1';
            visual.stacked = 'true';
            for ( let i = 0; i < this.widget.queries.length; i++ ) {
                for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                    if ( ['area', 'bar'].includes(this.widget.queries[i].metrics[j].settings.visual.type) ) {
                        visual.axis = this.widget.queries[i].metrics[j].settings.visual.axis;
                        visual.stacked = this.widget.queries[i].metrics[j].settings.visual.stacked;
                        break;
                    }
                }
            }
        }
        // tslint:disable-next-line:max-line-length
        if ( ( visual.type && ['bar', 'area'].includes(visual.type) && !isMetricMultiGraph ) || visual.stacked || (curtype !== 'line' && visual.axis ) ) {
            if ( visual.type === 'bar') {
                visual.stacked = 'true';
            }
            for ( let i = 0; i < this.widget.queries.length; i++ ) {
                for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                    if ( ['area', 'bar'].includes(this.widget.queries[i].metrics[j].settings.visual.type) ) {
                        // tslint:disable-next-line:max-line-length
                        this.widget.queries[i].metrics[j].settings.visual = {...this.widget.queries[i].metrics[j].settings.visual, ...visual};
                    }
                }
            }
        }
        this.utilService.updateQueryMetricVisual(this.widget, qid, mid, visual);

        if ( visual.axis === 'y2' ) {
            this.widget.settings.axes.y2.enabled = true;
        }
        if ( visual.axis || visual.stacked ) {
            this.setAxesOption();
        }
    }

    setLegend(config) {
        this.widget.settings.legend = config;
        this.setLegendDiv();
        this.options = {...this.options};
    }

    setLegendDiv() {
        this.options.labelsDiv = (this.dygraphLegend) ? this.dygraphLegend.nativeElement : {exists: false};
        this.legendDisplayColumns = ['color'].concat(this.widget.settings.legend.columns || []).concat(['name']);
    }

    setDefaultEvents() {
        this.widget = this.utilService.setDefaultEventsConfig(this.widget, false);
    }

    getEvents() {
        if (this.widget.settings.visual.showEvents && !this.displayMultigraph) {
            this.eventsLoading = true;
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'getEventData',
                payload: {eventQueries: this.widget.eventQueries, settings: this.widget.settings, limit: this.eventsCount}
            });
        }
    }

    setShowEvents(showEvents: boolean) {
        this.widget.settings.visual.showEvents = showEvents;
        this.widget.settings = {... this.widget.settings};
        this.setSize();
        if (showEvents) {
            this.getEvents();
        }
    }

    setEventQuerySearch(search: string) {
        // todo: set correctly
        const deepClone = JSON.parse(JSON.stringify(this.widget));
        deepClone.eventQueries[0].search = search;
        this.widget.eventQueries = [...deepClone.eventQueries];
        this.getEvents();
    }

    setEventQueryNamespace(namespace: string) {
        // todo: set correctly
        const deepClone = JSON.parse(JSON.stringify(this.widget));
        deepClone.eventQueries[0].namespace = namespace;
        this.widget.eventQueries = [... deepClone.eventQueries];
        this.getEvents();
    }

    toggleChartSeries(index: number, focusOnly) {

        this.preventSingleClick = focusOnly;
        if (!focusOnly) {
            this.clickTimer = 0;
            const delay = 250;

            this.clickTimer = setTimeout(() => {
                if (!this.preventSingleClick) {
                    // this.options.visibility[index] = !this.options.visibility[index];
                    // this.options.visibilityHash[this.options.series[index + 1].hash] = this.options.visibility[index];
                    this.setSeriesVisibilityConfig(index, !this.options.visibility[index]);
                }
                this.options = {...this.options};
                this.cdRef.markForCheck();
                this.interCom.requestSend({
                    action: 'tsLegendWidgetOptionsUpdate',
                    id: this.widget.id,
                    payload: { options: this.options}
                });
            }, delay);
        } else {
            clearTimeout(this.clickTimer);
            this.clickTimer = 0;

            let allHidden = true;
            // check if all the time-series are already hidden
            for (let i = 0; i < this.options.visibility.length; i += 1) {
                if (i === (index)) { continue; }
                allHidden = allHidden && !this.options.visibility[i];
            }
            // if all are already hidden, user probably wants to show all with a dblclick
            // else the intention is to hide all except the selected one
            const newVisibility = allHidden === true ? true : false;
            for (let i = 0; i < this.options.visibility.length; i += 1) {
                // this.options.visibility[i] = newVisibility;
                // this.options.visibilityHash[this.options.series[i + 1].hash] = this.options.visibility[i];
                this.setSeriesVisibilityConfig(i, newVisibility);
            }
            // this.options.visibility[index] = true;
            // this.options.visibilityHash[this.options.series[index + 1].hash] = this.options.visibility[index];
            this.setSeriesVisibilityConfig(index, true);
            this.options = { ...this.options };
            this.interCom.requestSend({
                action: 'tsLegendWidgetOptionsUpdate',
                id: this.widget.id,
                payload: { options: this.options}
            });
        }
    }

    // timeSeriesLegend series toggle
    tsLegendToggleChartSeries(batch: number[], visible: boolean, multigraph: any = false) {
        clearTimeout(this.clickTimer);
        this.clickTimer = 0;

        // get correct options depending on whether multigraph or not
        const options = (multigraph) ? this.graphData[multigraph.y][multigraph.x].options : this.options;

        // update visibility on batch items
        for (let i = 0; i < batch.length; i += 1) {
            const srcIndex = batch[i];
            // options.visibility[srcIndex] = visible;
            // this.options.visibilityHash[this.options.series[srcIndex + 1].hash] = this.options.visibility[srcIndex];
            this.setSeriesVisibilityConfig(srcIndex, visible, multigraph);
        }

        // update main data options depending on whether multigraph
        if (multigraph) {
            this.graphData[multigraph.y][multigraph.x].options = { ...options };
        } else {
            this.options = { ...options };
        }
        this.cdRef.markForCheck();

        // interCom updated options
        this.interCom.requestSend({
            action: 'tsLegendWidgetOptionsUpdate',
            id: this.widget.id,
            payload: { options: (multigraph) ? this.graphData[multigraph.y][multigraph.x].options : this.options}
        });
    }

    setSeriesVisibilityConfig(index: number, visibility: boolean, multigraph: any = false) {
        const options = (multigraph) ? this.graphData[multigraph.y][multigraph.x].options : this.options;
        options.visibility[index] = visibility;
        options.visibilityHash[options.series[index + 1].hash] = options.visibility[index];
        this.resetYZoom();
    }

    handleZoom(zConfig) {
        if ( zConfig.isZoomed && zConfig.axis === 'x' ) {
            zConfig.start = Math.floor(zConfig.start) <= zConfig.actualStart ? -1 : Math.floor(zConfig.start);
            zConfig.end = Math.ceil(zConfig.end) >= zConfig.actualEnd ? -1 : Math.floor(zConfig.end);
        }
        // zoom.start===-1 or zoom.end=== -1, the start or end times will be calculated from the datepicker start or end time
        if ( zConfig.axis === 'x' ) {
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'SetZoomDateRange',
                payload: zConfig
            });
            this.resetYZoom();
        } else if ( zConfig.axis === 'y' && zConfig.y ) {
            this.widget.settings.chartOptions.axes = { y: zConfig.y , y2: zConfig.y2 };
        } else {
            this.resetYZoom();
        }
    }

    resetYZoom(redraw= true) {
        if ( this.widget.settings.chartOptions.axes ) {
            delete this.widget.settings.chartOptions.axes;
            this.options.initZoom = null;
            this.options.axes.y.valueRange = [null, null];
            this.options.axes.y2.valueRange = [null, null];
            this.setAxesOption();
        }
    }

    bucketClickedAtIndex(index) {
        // this.expandedBucket = index;
        this._expandedBucketIndex.next(index);

        // NEED TO CHECK IF ISLAND IS OPEN
        if ( !this.showEventStream ) {
            // IF NOT OPEN, OPEN IT

            const islandTitle = this.widget.eventQueries[0].search ?
                                // tslint:disable-next-line:max-line-length
                                this.getEventCountInBuckets() + ' Events: ' + this.widget.eventQueries[0].namespace + ' - ' + this.widget.eventQueries[0].search :
                                this.getEventCountInBuckets() + ' Events: ' + this.widget.eventQueries[0].namespace;

            // to open info island
            const payload = {
                portalDef: {
                    type: 'component',
                    name: 'EventStreamComponent'
                },
                data: {
                    buckets$: this._buckets.asObservable(),
                    timeRange$: this._timeRange.asObservable(),
                    timezone$: this._timezone.asObservable(),
                    expandedBucketIndex$: this._expandedBucketIndex.asObservable(),
                    title: islandTitle
                },
                options: {
                    title: islandTitle
                }
            };

            this.interCom.requestSend({
                id: this.widget.id,
                action: 'InfoIslandOpen',
                payload: payload
            });

            this.updatedShowEventStream(true);
        }
    }

    receivedDateWindow(dateWindow: any) {
        this.startTime = dateWindow.startTime;
        this.endTime = dateWindow.endTime;
        this._timeRange.next({startTime: this.startTime, endTime: this.endTime });
    }

    updatedShowEventStream(showEventStream: boolean) {
        this.showEventStream = showEventStream;
    }

    newBuckets(buckets) {
        this._buckets.next(buckets);
        this._expandedBucketIndex.next(-1);
    }

    getEventCountInBuckets() {
        let count = 0;
        for (const bucket of this.buckets) {
            count = count + bucket.events.length;
        }
        return count;
    }

    getSeriesLabel(index) {
        const label = this.options.series[index].label;
        return label;
    }

    getSeriesAggregate( index, aggregate, normalizeUnit = true ) {
        const config = this.options.series[index];
        const value = config.aggregations[aggregate];
        if (!normalizeUnit) {
            return value;
        }

        if ( isNaN(value)) {
            return '-';
        }

        return this.normalizeValue(value, index);
    }

    normalizeValue(value, index) {
        if ( isNaN(value)) {
            return '-';
        }
        const config = this.options.series[index];
        const format = config.axis === 'y' ? this.options.axes.y.tickFormat : this.options.axes.y2.tickFormat;
        const dunit = this.unit.getNormalizedUnit(value, format);
        return this.unit.convert(value, format.unit, dunit, format);
    }

    requestData() {
        if (!this.isDataLoaded) {
            this.nQueryDataLoading = 1;
            this.error = null;
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'getQueryData',
                payload: this.widget,
            });
            //no need to detect anything here
            //this.cdRef.detectChanges();
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

    refreshData(reload = true) {
        this.isDataLoaded = false;
        if ( reload ) {
            this.requestData();
            this.getEvents();
        } else {
            this.requestCachedData();
            this.getEvents(); // todo: add events cache in-future
        }
    }

    toggleConfigSection(section, e) {
        this.visibleSections[section] = !this.visibleSections[section];
        e.stopPropagation();
    }

    changeWidgetType(type) {
       const wConfig = this.utilService.deepClone(this.widget);
       wConfig.id = wConfig.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'changeWidgetType',
            id: wConfig.id,
            payload: { wConfig: wConfig, newType: type }
        });
    }

    showError() {
        const parentPos = this.elRef.nativeElement.getBoundingClientRect();
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
        const parentPos = this.elRef.nativeElement.getBoundingClientRect();
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

    // request send to update state to close edit mode
    closeViewEditMode() {
        this.iiService.closeIsland();
        this.interCom.requestSend({
            action: 'closeViewEditMode',
            id: this.widget.id,
            payload: 'dashboard'
        });
    }

    // apply config from editing
    applyConfig() {
        this.closeViewEditMode();
        this.widget.settings.chartOptions = {};
        const cloneWidget = JSON.parse(JSON.stringify(this.widget));
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: this.needRequery }
        });
    }

    saveAsSnapshot() {
        const cloneWidget = JSON.parse(JSON.stringify(this.widget));
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'SaveSnapshot',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: false }
        });
    }

    // get keys from graph data object
    getGraphDataObjectKeys(obj: any): string[] {
        if (!obj || obj === undefined || obj === null) {
            return [];
        }
        const keys = Object.keys(obj);
        return keys;
    }

    // set columns based on multigraph data
    setMultigraphColumns(data) {
        const ykeys = this.getGraphDataObjectKeys(data);
        const colKeys = ykeys.length ? this.getGraphDataObjectKeys(data[ykeys[0]]) : [];
        if (colKeys.length === 1 && colKeys[0] === 'x') {
            this.multigraphColumns = [];
        } else {
            this.multigraphColumns = colKeys;
        }
    }

    // event listener to multigraph container scroll
    // used to reposition column headers
    multigraphContainerScroll(event: any) {
        // apply lazy load for graphcell
               setTimeout(() => {
                this.applyMultiLazyLoad();
            }, 300);
        if (event !== null) {
        // column header row needs to update position
        if (this.multigraphHeaderRow) {
            this.multigraphHeaderRow.nativeElement.style.marginTop = event.target.scrollTop + 'px';
        }
        // update row label marginLeft
        this.graphRowLabelMarginLeft = event.target.scrollLeft;
    }
    }

    /* TIMESERIES LEGEND */

    // event listener for dygraph to get latest tick data
    timeseriesTickListener(yIndex: number, xIndex: number, yKey: any, xKey: any, event: any) {
        // this.logger.event('TIMESERIES TICK LISTENER', {yKey, xKey, multigraph: this.displayMultigraph, widget: this.widget, event});
        let multigraph: any = null;
        if (this.displayMultigraph && this.multigraphEnabled) {
            multigraph = { yIndex, xIndex, y: yKey, x: xKey };
        }

        let widgetOptions;
        if (multigraph) {
            widgetOptions = this.graphData[yKey][xKey].options;
        } else {
            widgetOptions = this.options;
        }

        if (event.action === 'openLegend') {

            // open the infoIsland with TimeseriesLegend
            const payload: any = {
                portalDef: {
                    type: 'component',
                    name: 'TimeseriesLegendComponent'
                },
                data: {
                    multigraph: multigraph,
                    options: widgetOptions,
                    queries: this.widget.queries,
                    settings: this.widget.settings,
                    tsTickData: event.tickData
                },
                options: {
                    title: 'Timeseries Legend',
                    height: 250,
                    positionStrategy: 'connected'
                }
            };
            if (multigraph) {
                // tslint:disable-next-line: max-line-length
                payload.options.overlayRefEl = (this.multigraphContainer.nativeElement).querySelector('.graph-cell-' + yIndex + '-' + xIndex);
            }
            // this goes to widgetLoader
            if ( this.mode === 'view' ) {
                this.interCom.requestSend({
                    id: this.widget.id,
                    action: 'InfoIslandOpen',
                    payload: payload
                });
            } else {
                const dataToInject = {
                    widget: this.widget,
                    originId: this.widget.id,
                    data: payload.data
                };
                // tslint:disable-next-line: max-line-length
                const compRef = this.iiService.getComponentToLoad(payload.portalDef.name);
                const componentOrTemplateRef = new ComponentPortal(compRef, null, this.iiService.createInjector(dataToInject));
                const pos = this.elRef.nativeElement.getBoundingClientRect();
                const heightMod = this.mode === 'edit' ? 0.6 : 0.7;
                const height = pos.height * ( 1 - heightMod ) - 5;
                // tslint:disable-next-line: max-line-length
                this.iiService.openIsland(this.widgetOutputContainer.nativeElement, componentOrTemplateRef, {...widgetOptions, draggable: true,
                    originId: this.widget.id,
                    width: pos.width, positionStrategy: 'connected',
                    height: height });
            }
        }

        if (event.action === 'tickDataChange') {
            // update tickData from mouseover
            // this goes to TimeseriesLegend
            const payload: any = {
                multigraph: multigraph,
                options: widgetOptions,
                queries: this.widget.queries,
                settings: this.widget.settings,
                tickData: event.tickData
            };
            if (event.trackMouse) {
                payload.trackMouse = event.trackMouse;
            }
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'tsTickDataChange',
                payload: payload
            });
        }
    }

     applyMultiLazyLoad() {
        this.inViewport = {};
        let temp = {};
        const parentElem = this.widgetOutputElement;
        this.graphdivs.filter( elem => {
            if (this.inWidgetViewport(parentElem, elem)) {
                const [y,x] = elem.nativeElement.id.split('|');
                if (temp[y] === undefined) {
                    temp[y] = {};
                }
                temp[y][x] = true;
            }
            return false;
        });
        this.inViewport = {...temp};
        this.cdRef.detectChanges();
    }


    inWidgetViewport(pElem: ElementRef, elem: ElementRef) {
        // parent element bounding
        const pBounding = pElem.nativeElement.getBoundingClientRect();
        const graphcell = elem.nativeElement.closest('.graph-cell');
        const cBounding = graphcell.getBoundingClientRect();
        const inwvp: any = {};

        const cTopLeft = { x: cBounding.left, y: cBounding.top };
        const cTopRight = { x: cBounding.right, y: cBounding.top };
        const cBottomLeft = { x: cBounding.left, y: cBounding.bottom };
        const cBottomRight = { x: cBounding.right, y: cBounding.bottom };

        inwvp.topLeft = this.isIn(pBounding, cTopLeft);
        inwvp.topRight = this.isIn(pBounding, cTopRight);
        inwvp.bottomLeft = this.isIn(pBounding, cBottomLeft);
        inwvp.bottomRight = this.isIn(pBounding, cBottomRight);

        return inwvp.topLeft || inwvp.topRight || inwvp.bottomLeft || inwvp.bottomRight;
    };

    configSectionToggleChanged(type: string, event: any) {
        switch (type) {
            case 'events':
                this.updateConfig({
                    action: 'SetShowEvents',
                    payload: {
                        showEvents: event
                    }
                });
                break;
            case 'multigraph':
                this.multigraphEnabled = event;
                this.displayMultigraph = false; // reset mode to display 1 blank graph
                // for exisitng multigraph
                if (this.widget.settings.multigraph) {
                    this.widget.settings.multigraph.enabled = event;
                }
                this.resetChart();
                // build empty reset data.
                let graphs = {};
                graphs['y'] = {};
                graphs['y']['x'] = this.data;
                graphs['y']['x'].options = this.options;
                this.graphData = {...graphs};
                this.setMultigraphColumns(this.graphData);
                this.setSize();
                // refresh data with changes of groupby
                this.doRefreshData$.next(true);
                this.needRequery = true;            
                break;
        }
    }

    private isIn(pBounding:any, cCord: any) {
        return cCord.x > pBounding.left &&
                cCord.x < pBounding.right &&
                cCord.y > pBounding.top &&
                cCord.y < pBounding.bottom;
    }

    /* ON DESTROY */
    ngOnDestroy() {
        this.newSizeSub.unsubscribe();
        this.subscription.unsubscribe();
        this.doRefreshDataSub.unsubscribe();
    }

}
