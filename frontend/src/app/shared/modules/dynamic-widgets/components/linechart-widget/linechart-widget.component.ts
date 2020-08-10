import {
    Component, OnInit, HostBinding, Input, EventEmitter,
    OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, AfterViewChecked, ViewChildren, QueryList, Output
} from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { MultigraphService } from '../../../../../core/services/multigraph.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
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
import { TooltipDataService } from '../../../universal-data-tooltip/services/tooltip-data.service';
//import { UniversalDataTooltipService } from '../../../universal-data-tooltip/services/universal-data-tooltip.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'linechart-widget',
    templateUrl: './linechart-widget.component.html',
    styleUrls: []
})
export class LinechartWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.linechart-widget') private _componentClass = true;

    private _editMode: boolean = false;
    @Input()
    get editMode(): boolean {
        return this._editMode;
    }
    set editMode(value: boolean) {
        this._editMode = value;
    }
    @Input() widget: WidgetModel;
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
        gridLineColor: '#ccc'
    };
    data: any = { ts: [[0]] };
    size: any = { width: 120, height: 60};
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

    // MULTIGRAPH
    // TODO: These multigraph values need to be retrieved from widget settings
    multigraphEnabled = false;
    multigraphMode = 'grid'; // grid || freeflow
    fakeLoopData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // eventually remove this
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
    previewEventsCount = 100;
    eventsCount = 10000;
    eventsLoading: boolean = false;
    axisLabelsWidth = 55;
    // tslint:disable-next-line: max-line-length
    visibleSections: any = { 'queries' : true, 'time': false, 'axes': false, 'legend': false, 'multigraph': false, 'events': false };
    formErrors: any = {};
    eventsError = '';

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
        private themeService: ThemeService
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

            switch (message.action) {
                case 'TimeChanged':
                    this.options.isCustomZoomed = false;
                    this.refreshData();
                    break;
                case 'reQueryData':
                    this.refreshData();
                    break;
                case 'TimezoneChanged':
                    this.setTimezone(message.payload.zone);
                    this.options = { ...this.options };
                    this.cdRef.markForCheck();
                    break;
                case 'ZoomDateRange':
                    this.options.isCustomZoomed = message.payload.date.isZoomed;
                    this.refreshData();
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
                        this.cdRef.markForCheck();
                    }
                    break;
            }

            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'InfoIslandClosed':
                        this.updatedShowEventStream(false);
                        break;
                    case 'tsLegendRequestWidgetSettings':
                        const multiConf = this.multiService.buildMultiConf(this.widget.settings.multigraph);
                        const multigraphEnabled = (multiConf.x || multiConf.y) ? true : false;
                        let tsLegendOptions;
                        if (multigraphEnabled && message.payload.multigraph) {
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
                        this.iiService.updatePositionStrategy(tsOriginOverlayRef, 'connected');
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
                            const multiConf = this.multiService.buildMultiConf(this.widget.settings.multigraph);
                            this.multigraphEnabled = (multiConf.x || multiConf.y) ? true : false;
                            if (this.multigraphEnabled) {
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
                                const results = this.multiService.fillMultiTagValues(this.widget, multiConf, rawdata);
                                const maxGraphs = 60;
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
                                    // this.multiLimitMessage = 'Display first ' + numOfRows * maxCols + ' of ' + rowKeys.length * colKeys.length;
                                    // emit message to display on widget header
                                    // this.widgetOut.emit({
                                    //    message: this.multiLimitMessage
                                    // });
                                } else {
                                    limitGraphs = this.utilService.deepClone(results);
                                }
                                // we need to convert to dygraph for these multigraph
                                for (const ykey in limitGraphs) {
                                    if (limitGraphs.hasOwnProperty(ykey)) {
                                        for (const xkey in limitGraphs[ykey]) {
                                            if (limitGraphs[ykey].hasOwnProperty(xkey)) {
                                                limitGraphs[ykey][xkey].ts = [[0]];
                                                const options = this.utilService.deepClone(this.options);
                                                // preserve previous series and visibility so we can remap in data transformer
                                                if (this.graphData.hasOwnProperty(ykey)) {
                                                    if (this.graphData[ykey].hasOwnProperty(xkey)) {
                                                        const prevOptions = this.utilService.deepClone(this.graphData[ykey][xkey].options);
                                                        // console.log('PREVIOUS OPTIONS', prevOptions);
                                                        options.series = prevOptions.series;
                                                        options.visibility = prevOptions.visibility;
                                                        options.visibilityHash[prevOptions.hash] = prevOptions.visbilityHash;
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
                                this.data = { ...this.data };
                                graphs['y'] = {};
                                graphs['y']['x'] = this.data;
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
                            if (!this.multigraphEnabled) {
                                this.refreshLegendSource();
                            }
                            // delay required. sometimes, edit to viewmode the chartcontainer width is not available
                            setTimeout(() => {
                                this.setSize(true);
                                if (!this.multigraphEnabled) {
                                    this.legendDataSource.sort = this.sort;
                                }
                                // this is for initial load before scroll event on widget
                                this.applyMultiLazyLoad();
                            });

                        }
                        break;
                    case 'getUpdatedWidgetConfig':
                        // console.log("getUpdatedWidgetConfig", message);
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
                }
            }
        }));

        this.setDefaultEvents();
        this.getEvents();

        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(() => this.refreshData(this.editMode ? false : true), 0);

        // Timing issue? trying to move to afterViewInit
        this.setOptions();
    }

    ngAfterViewInit() {

        // since we don't compute any size here just trigger the observal
        ElementQueries.listen();
        ElementQueries.init();
        // true is just a dummy value to trigger
        const dummyFlag = 1;
        this.newSize$ = new BehaviorSubject(dummyFlag);
        this.newSizeSub = this.newSize$.subscribe(flag => {
            this.setSize();
        });
        const resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
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
        this.options = {...this.options, labels: ['x']};
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
            case 'UpdateQuery':
                this.utilService.updateQuery(this.widget, message.payload);
                this.widget.queries = [...this.widget.queries];
                this.widget = {...this.widget};
                this.setOptions();
                this.needRequery = true;
                this.doRefreshData$.next(true);
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
    setSize(cdCheck: boolean = true) {
        // if edit mode, use the widgetOutputEl. If in dashboard mode, go up out of the component,
        // and read the size of the first element above the componentHostEl
        const nativeEl = (this.editMode) ?
            this.widgetOutputElement.nativeElement.parentElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

        const newSize = nativeEl.getBoundingClientRect();
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

        if (this.editMode) {
            let titleSize = { width: 0, height: 0 };
            if (this.widgetTitle) {
                titleSize = this.widgetTitle.nativeElement.getBoundingClientRect();
            }
            padding = 15; // 8px top and bottom
            nHeight = newSize.height - heightOffset - titleSize.height - (padding * 2);

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

        if (this.multigraphEnabled && this.widget.settings.multigraph) {
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
        }
        // Canvas Width resize
        this.eventsWidth = nWidth - (this.axisEnabled(this.options.series).size * this.axisLabelsWidth);

        // after size it set, tell Angular to check changes
        if (cdCheck) {
            this.cdRef.detectChanges();
        }
    }

    axisEnabled(series) {
        const axis = new Set();
        for (const [key, value] of Object.entries(series)) {
            axis.add(series[key].axis);
        }
        return axis;
    }

    setTimezone(timezone) {
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
            if ( !isNaN(parseFloat(config.max)) ) {
                axis.valueRange[1] = config.max;
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
        const isMetricMultiGraph = this.multigraphEnabled && multiGraphConf && multiGraphConf.chart[0].displayAs !== 'g' ? true : false;
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
        if (this.widget.settings.visual.showEvents && !this.multigraphEnabled) {
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
        // console.log("options", this.options.visibility)
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
    }

    handleZoom(zConfig) {
        // console.log('ZOOM ZOOM', zConfig);
        const n = this.data.ts.length;
        if ( zConfig.isZoomed && n > 0 ) {
            const startTime = new Date(this.data.ts[0][0]).getTime() / 1000;
            const endTime = new Date(this.data.ts[n - 1][0]).getTime() / 1000;
            zConfig.start = Math.floor(zConfig.start) <= startTime ? -1 : Math.floor(zConfig.start);
            zConfig.end = Math.ceil(zConfig.end) >= endTime ? -1 : Math.floor(zConfig.end);
        }
        // zoom.start===-1 or zoom.end=== -1, the start or end times will be calculated from the datepicker start or end time
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'SetZoomDateRange',
            payload: zConfig
        });
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
            this.cdRef.detectChanges();
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
        const cloneWidget = JSON.parse(JSON.stringify(this.widget));
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: this.needRequery }
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
        // this.logger.event('TIMESERIES TICK LISTENER', {yKey, xKey, multigraph: this.multigraphEnabled, widget: this.widget, event});
        let multigraph: any = false;
        if (this.multigraphEnabled) {
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
            if ( !this.editMode ) {
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
                this.iiService.openIsland(this.widgetOutputElement.nativeElement, componentOrTemplateRef, widgetOptions);
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

    private isIn(pBounding:any, cCord: any) {
        return cCord.x > pBounding.left &&
                cCord.x < pBounding.right &&
                cCord.y > pBounding.top &&
                cCord.y < pBounding.bottom;
    }

    /* ON DESTROY */
    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.newSizeSub.unsubscribe();
        this.doRefreshDataSub.unsubscribe();
    }

}
