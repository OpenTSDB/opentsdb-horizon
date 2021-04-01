import { Component, OnInit, HostBinding, Input, ViewChild, ElementRef, OnDestroy,  AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ElementQueries, ResizeSensor } from 'css-element-queries';
import { MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { environment } from '../../../../../../environments/environment';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bignumber-widget',
    templateUrl: './bignumber-widget.component.html',
    styleUrls: []
})

export class BignumberWidgetComponent implements OnInit, OnDestroy, AfterViewInit {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.bignumber-widget') private _componentClass = true;

    /** Inputs */
    @Input() widget: any;
    @Input() mode = 'view'; // view/explore/edit
    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;

    Object = Object;
    // tslint:disable:no-inferrable-types
    // tslint:disable:prefer-const
    private listenSub: Subscription;
    private isDataLoaded: boolean = false;

    data: any; // cache all the metrics that we get from tsdb
    selectedMetric: any; // used for macros
    tags: any; // to display tags of currently selected metric
    bigNumber: any = {};
    changeValue: number;
    changePct: number;
    readonly changeThreshold: number = 0.01; // hard coding this for now, needs to be configurable
    aggregators: string[] = [];
    aggregatorValues: any[] = [];
    widgetWidth: number;
    widgetHeight: number;
    noDataText: string = 'No Data';
    backgroundColor: string;
    textColor: string;

    // Auto-scaling
    fontSizePercent: number = 100;  // initial value of how much to scale
    readonly contentFillPercent: number = 0.8; // how much % content should take up widget
    readonly contentFillPercentWithNoCaption: number = 0.8; // how much % content should take up widget

    // NOTE: FONT settings have been coded here for text size calculation purposes.
    //      CHANGE ME if CSS style changes. Yes, we know this is sub-optimal.
    //      Please submit a PR if you find a better solution.
    readonly defaultFont: string = 'Ubuntu';
    readonly defaultFontSize: number = 14;
    readonly captionFontSizeMultiplier: number = 1.2;
    readonly mediumFontSizeMultiplier: number = 2;
    readonly largeFontSizeMultiplier: number = 3;
    readonly defaultFontWeight: number = 400;
    readonly defaultBigNumberFontWeight: number = 600;
    readonly defaultCaptionFontWeight: number = 500;
    readonly heightOfLargeFont: number = 47;
    readonly heightOfSmallFont: number = 15;
    readonly heightOfMarginAboveCaption: number = 5;

    readonly maxCaptionLength: number = 36;
    readonly maxLabelLength: number = 10; // postfix, prefix, unit

    isCustomZoomed = false;
    needRequery = false;
    nQueryDataLoading = 0;
    error: any;
    errorDialog: MatDialogRef < ErrorDialogComponent > | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef < DebugDialogComponent > | null;
    storeQuery: any;
    shadowInitialized: boolean = false;

    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    resizeSensor: any;
    isEditContainerResized = false;
    widgetContainerElHeight = 60;

    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;
    visibleSections: any = { 'queries' : true, 'time': false, 'visuals': false };
    formErrors: any = {};
    meta: any = {};

    @ViewChild('myCanvas') myCanvas: ElementRef;
    public context: CanvasRenderingContext2D;

    constructor(
        private interCom: IntercomService,
        public dialog: MatDialog,
        public util: UtilsService,
        public UN: UnitConverterService,
        private cdRef: ChangeDetectorRef,
        private elRef: ElementRef,
        private dateUtil: DateUtilsService
        ) { }

    ngOnInit() {
        this.visibleSections.queries = this.mode === 'edit' ? true : false;
        this.disableAnyRemainingGroupBys();
        this.setDefaultVisualization();

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

        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            let overrideTime;
            if ( message.action === 'TimeChanged' ) {
                overrideTime = this.widget.settings.time.overrideTime;
                if ( !overrideTime ) {
                    this.refreshData();
                }
            } else if ( message.action === 'reQueryData' &&  ( !message.id || message.id === this.widget.id ) ) {
                this.refreshData();
            } else if ( message.action === 'ZoomDateRange' &&  ( !message.id || message.id === this.widget.id ) ) {
                overrideTime = this.widget.settings.time.overrideTime;
                if ( message.payload.date.isZoomed && overrideTime ) {
                    const oStartUnix = this.dateUtil.timeToMoment(overrideTime.start, message.payload.date.zone).unix();
                    const oEndUnix = this.dateUtil.timeToMoment(overrideTime.end, message.payload.date.zone).unix();
                    if ( oStartUnix <= message.payload.date.start && oEndUnix >= message.payload.date.end ) {
                        this.isCustomZoomed = message.payload.date.isZoomed;
                        this.widget.settings.time.zoomTime = message.payload.date;
                        this.refreshData();
                    }
                // tslint:disable-next-line: max-line-length
                } else if ( (message.payload.date.isZoomed && !overrideTime && !message.payload.overrideOnly) || (this.isCustomZoomed && !message.payload.date.isZoomed) ) {
                    this.isCustomZoomed = message.payload.date.isZoomed;
                    this.refreshData();
                }
                // unset the zoom time
                if ( !message.payload.date.isZoomed ) {
                    delete this.widget.settings.time.zoomTime;
                }
            } else if ( message.action === 'SnapshotMeta' ) {
                    this.meta = message.payload;
            } else if (message.action === 'ResizeAllWidgets') {

                if(this.resizeSensor) {
                    this.resizeSensor.detach();
                }
                this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                    this.newSize$.next(1);
                });

            }
            if (message && (message.id === this.widget.id)) { // 2. Get and set the metric
                switch (message.action) {
                    case 'updatedWidgetGroup':
                        this.nQueryDataLoading--;
                        this.isDataLoaded = true;

                        if (message.payload && message.payload.error) {
                            this.error = message.payload.error;
                        } else {
                            this.error = null;
                            if (message.payload && message.payload.rawdata) {
                                if (environment.debugLevel.toUpperCase() === 'TRACE' ||
                                    environment.debugLevel.toUpperCase() == 'DEBUG' ||
                                    environment.debugLevel.toUpperCase() == 'INFO') {
                                    this.debugData = message.payload.rawdata.log; // debug log
                                }
                                this.data = message.payload.rawdata.results || [];
                                this.setBigNumber();
                            } else { // no data, so get some
                                this.refreshData();
                            }
                        }
                        this.cdRef.detectChanges();
                        break;
                    case 'getUpdatedWidgetConfig':
                        this.widget = message.payload.widget;
                        this.setBigNumber();
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
                    case 'widgetDragDropEnd':
                        if (this.resizeSensor) {
                            this.resizeSensor.detach();
                        }
                        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                            this.newSize$.next(1);
                        });
                        break;
                }
            }
        });
        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(() => this.refreshData(this.mode !== 'view' ? false : true), 0);
    }
  ngAfterViewInit() {
    this.setSize();
    this.setBigNumber();
        // this event will happend on resize the #widgetoutput element,
        // in bar chart we don't need to pass the dimension to it.
        // Dimension will be picked up by parent node which is #container
        ElementQueries.listen();
        ElementQueries.init();
        const dummyFlag = 1;
        this.newSize$ = new BehaviorSubject(1);

        this.newSizeSub = this.newSize$.pipe(
            debounceTime(0)
        ).subscribe(size => {
            this.setSize();
        });

        // tslint:disable-next-line:no-unused-expression
        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
            this.newSize$.next(dummyFlag);
        });
    }
    // for first time and call.
    setSize() {
        // if edit mode, use the widgetOutputEl. If in dashboard mode, go up out of the component,
        // and read the size of the first element above the componentHostEl
        // tslint:disable-next-line:max-line-length
        const nativeEl = (this.mode !== 'view') ? ( !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement
                                                : this.widgetOutputElement.nativeElement) : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

        const outputSize = nativeEl.getBoundingClientRect();
        const heightMod = 0.55;
        this.widgetWidth = outputSize.width;
        // tslint:disable-next-line:max-line-length
        this.widgetHeight = this.mode !== 'view' && !this.isEditContainerResized && this.widget.queries[0].metrics.length ? outputSize.height * heightMod - 60 : outputSize.height;
        if (this.data) {
            this.determineFontSizePercent(this.widgetWidth, this.widgetHeight);
        }
        this.cdRef.detectChanges();
    }

    handleEditResize(e) {
        this.isEditContainerResized = true;
    }

    getVisibleMetricId() {
        // tslint:disable-next-line:forin
        for (let i in this.widget.queries) {
            for (let j in this.widget.queries[i].metrics) {
                if (this.widget.queries[i].metrics[j].settings.visual.visible) {
                    return this.widget.queries[i].metrics[j].id;
                }
            }
        }
    }

    setTitle(title) {
        this.widget.settings.title = title;
    }

    setBigNumber() {
        if (!this.getVisibleMetricId()) {
            this.enableFirstMetricVisibility();
        }
        let metricId = this.getVisibleMetricId();
        let metricData = this.util.getSummmarizerDataWithId(metricId, this.widget.queries, this.data);

        if (metricData && metricData.NumericSummaryType) {
            const responseAggregators = metricData.NumericSummaryType.aggregations;
            const key = Object.keys(metricData.NumericSummaryType.data[0])[0];
            const responseAggregatorValues = metricData.NumericSummaryType.data[0][key];
            let summarizer = this.util.getSummarizerForMetric(metricId, this.widget.queries);
            this.aggregatorValues = [responseAggregatorValues[responseAggregators.indexOf(summarizer)]];
            // tslint:disable:max-line-length
            this.bigNumber = this.UN.getNoramilizedValue(this.aggregatorValues[0], {unit: this.widget.settings.visual.unit, precision: this.widget.settings.visual.precision});

            // SET LOCAL VARIABLES
            // lastValue = responseAggregatorValues[responseAggregators.indexOf('first')];
            // currentValue = responseAggregatorValues[responseAggregators.indexOf('last')];
            // this.changeValue = currentValue - lastValue;
            // this.changePct = (this.changeValue / lastValue) * 100;

            this.selectedMetric = metricData;

            // get array of 'tags'
            if (metricData['tags']) {
                this.tags = this.util.transformTagMapToArray(metricData['tags']);
            } else {
                this.tags = null;
            }
            this.cdRef.detectChanges();

        } else {
            this.selectedMetric = {};
            this.selectedMetric.metric = '';
            this.bigNumber = {};
            this.changeValue = 0;
            this.changePct = 0;
            this.aggregators = [];
            this.aggregatorValues = [];
            this.tags = null;
        }
        this.determineFontSizePercent(this.widgetWidth, this.widgetHeight);
        this.determineTextAndBackgroundColors();
    }

    determineTextAndBackgroundColors() {
        /*
        let qindex = -1, mindex = -1;
        for (let i = 0; i < this.widget.queries.length; i++ ) {
            for (let j = 0; j < this.widget.queries[i].metrics.length; j++) {
                if (this.widget.queries[i].metrics[j].settings.visual.visible) {
                    qindex = i;
                    mindex = j;
                }
            }
        }
        */
        const visual = this.widget.settings.visual;
        this.textColor = !visual.color || visual.color === 'auto' ? this.widget.settings.visual.textColor : visual.color;
        this.backgroundColor = !visual.backgroundColor || visual.backgroundColor === 'auto' ? this.widget.settings.visual.backgroundColor : visual.backgroundColor;
        if (this.util.isNumber(this.aggregatorValues[0]) && this.widget.settings.visual.conditions) {
            let rawValue = this.aggregatorValues[0];
            for (let condition of this.widget.settings.visual.conditions) {
                if (this.util.isNumber(condition.value) && this.conditionApplies(rawValue, condition)) {
                    this.backgroundColor = condition.color;
                }
            }
        }
    }

    conditionApplies(rawValue, condition): boolean {
        let applicable = false;
        if (condition.operator.toLowerCase() === 'gt') {
            applicable = rawValue > condition.value;
        } else if (condition.operator.toLowerCase() === 'ge') {
            applicable = rawValue >= condition.value;
        } else if (condition.operator.toLowerCase() === 'lt') {
            applicable = rawValue < condition.value;
        } else if (condition.operator.toLowerCase() === 'le') {
            applicable = rawValue <= condition.value;
        }
        return applicable;
    }

    // Auto Scaling
    determineWidthOfBigNumber(): number {

        let bigNumberWithOtherLabelsWidth: number = 0;
        let captionLabelWidth: number = 0;
        // tslint:disable:max-line-length
        let prefixWidth = this.getWidthOfText(this.shortenString(this.widget.settings.visual.prefix, this.maxLabelLength), this.widget.settings.visual.prefixSize);
        let unitWidth = this.getWidthOfText(this.shortenString(this.bigNumber.unit, this.maxLabelLength), this.widget.settings.visual.unitSize);

        let bigNumberWidth;

        if (this.util.isNumber(this.bigNumber.num)) {
            bigNumberWidth = this.getWidthOfText(' ' + this.bigNumber.num + this.bigNumber.postfix + ' ', 'l', this.defaultBigNumberFontWeight);
        } else {
            bigNumberWidth = this.getWidthOfText(' ' + this.noDataText + ' ', 'l', this.defaultBigNumberFontWeight);
        }

        let changeIndicatorWidth = 0;
        /*
        if (this.widget.settings.visual.changedIndicatorEnabled) {
            if (this.changePct >= this.changeThreshold) {
                changeIndicatorWidth = this.getWidthOfText( '↑ ' + this.bigNumToChangeIndicatorValue(this.UN.getBigNumber(this.changeValue, this.widget.settings.visual.unit, this.widget.settings.visual.precision)));
            } else if (this.changePct <= -1 * this.changeThreshold) {
                changeIndicatorWidth = this.getWidthOfText( '↓ ' + this.bigNumToChangeIndicatorValue(this.UN.getBigNumber(this.changeValue, this.widget.settings.visual.unit, this.widget.settings.visual.precision)));
            } else {
                changeIndicatorWidth = this.getWidthOfText('↔');
            }
        }
        */

        let tmpBigNumberWithOtherLabelsWidth: number = prefixWidth + unitWidth + bigNumberWidth + changeIndicatorWidth;
        let tmpCaptionWidth = this.getWidthOfText(this.shortenString(this.widget.settings.visual.caption, this.maxCaptionLength), 'c', this.defaultCaptionFontWeight);

        // assign if largest width
        if (tmpBigNumberWithOtherLabelsWidth >  bigNumberWithOtherLabelsWidth) {
            bigNumberWithOtherLabelsWidth = tmpBigNumberWithOtherLabelsWidth;
        }

        if (tmpCaptionWidth > captionLabelWidth ) {
            captionLabelWidth = tmpCaptionWidth;
        }

        return Math.max(bigNumberWithOtherLabelsWidth, captionLabelWidth);
    }


    determineHeightofBigNumber(): number {
        return this.widget.settings.visual['caption'].trim() ?
            this.heightOfLargeFont + this.heightOfSmallFont + this.heightOfMarginAboveCaption :
            this.heightOfLargeFont;
    }

    determineFontSizePercent(width: number, height: number) {

        if (this.mode !== 'view') {
            this.fontSizePercent = 100;
            return;
        }

        let fillPercent: number = this.widget.settings.visual['caption'] ? this.contentFillPercent : this.contentFillPercentWithNoCaption;

        let maxWidth: number = width * fillPercent;
        let maxHeight: number = height * fillPercent;
        let contentHeight: number = this.determineHeightofBigNumber();
        let contentWidth: number = this.determineWidthOfBigNumber();

        let percentWidth = (maxWidth / contentWidth) * 100;
        let percentHeight = (maxHeight / contentHeight) * 100;
        let fontSizePercent: number = Math.min(percentHeight, percentWidth);

        this.fontSizePercent = fontSizePercent + 0.1 * Math.random(); // random so we always redraw
        this.cdRef.detectChanges();
    }

    getWidthOfText(text: string, size?: string, weight?: number): number {
        if (!text ||  text.trim() === '') {
            return 0;
        }

        let fontsize: number = this.defaultFontSize;
        if (size && size.toLowerCase() === 'm') {
            fontsize = this.mediumFontSizeMultiplier * fontsize;
        } else if (size && size.toLowerCase() === 'l') {
            fontsize = this.largeFontSizeMultiplier * fontsize;
        } else if (size && size.toLowerCase() === 'c') {
            fontsize = this.captionFontSizeMultiplier * fontsize;
        }

        let fontWeight: number = this.defaultFontWeight;
        if (weight) {
            fontWeight = weight;
        }

        this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
        let fullFont: string = fontWeight + ' ' + fontsize + 'px ' + this.defaultFont;
        this.context.font = fullFont;

        // return this.context.measureText(text.toUpperCase()).width;
        return this.context.measureText(text).width;
    }

   requestData() {
        if (!this.isDataLoaded) {
            this.nQueryDataLoading = this.widget.queries.length ? 1 : 0;
            this.error = null;
            this.interCom.requestSend({
                id: this.widget.id,
                action: 'getQueryData',
                payload: this.widget
            });
            this.cdRef.detectChanges();
        }
    }

    requestCachedData() {
        this.nQueryDataLoading = this.widget.queries.length ? 1 : 0;
        this.error = null;
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'getWidgetCachedData',
            payload: this.widget
        });
    }

    bigNumToChangeIndicatorValue(bigNum: any): string {
        if (bigNum.changeIndicatorHasUnit) {
            return bigNum.num + bigNum.unit;
        } else {
            return bigNum.num;
        }
    }

    // we have this method so that a caption or other labels will not make the big number really small
    shortenString(str: string, maxChars: number): string {
        if ( str && str.length > maxChars) {
            return str.substr(0, maxChars) + '...';
        }
        return str;
    }

    updateConfig(message) {
        switch ( message.action ) {
            case 'SetTimeError':
                if ( message.payload.error ) {
                    this.formErrors.time = true;
                } else {
                    delete this.formErrors.time;
                }
                break;
            case 'SetTimeConfiguration':
                delete this.formErrors.time;
                this.util.setWidgetTimeConfiguration(this.widget, message.payload.data);
                this.needRequery = true;
                this.refreshData();
                break;
            case 'SetMetaData':
                this.util.setWidgetMetaData(this.widget, message.payload.data);
                break;
            case 'SetVisualization':
                this.setVisualization(message.payload.data);
                this.refreshData(false);
                break;
            case 'SetSelectedQuery':
                this.setSelectedQuery(message.payload.data);
                break;
            case 'UpdateQuery':
                this.util.updateQuery(this.widget, message.payload);
                this.widget.queries = [...this.widget.queries];
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricVisual':
                this.widget.settings.visual = { ...this.widget.settings.visual, ...message.payload.visual};
                this.determineTextAndBackgroundColors();
                this.refreshData(false);
                break;
            case 'ToggleQueryMetricVisibility':
                this.toggleQueryMetricVisibility(message.id, message.payload.mid);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.needRequery = true;
                break;
            case 'SummarizerChange':
                this.setBigNumber();
                break;
            case 'CloneQuery':
                this.cloneQuery(message.id);
                this.widget = this.util.deepClone(this.widget);
                this.refreshData();
                this.needRequery = true;
                break;
            case 'DeleteQueryMetric':
                this.deleteQueryMetric(message.id, message.payload.mid);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQuery':
                this.util.deleteQuery(this.widget, message.id);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.widget = {...this.widget};
                this.refreshData();
                this.needRequery = true;
                break;
            case 'ToggleDBFilterUsage':
                this.widget.settings.useDBFilter = message.payload.apply;
                this.refreshData();
                this.needRequery = message.payload.reQuery;
                break;
            case 'ToggleInfectiousNan':
                this.util.toggleQueryInfectiousNan(this.widget, message.payload.checked);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
        }
    }

    setVisualization( vconfigs ) {
        this.widget.settings.visual = { ...vconfigs};
        this.determineTextAndBackgroundColors();
    }

    setSelectedQuery(queryID: string) {
        this.refreshData();
        this.setBigNumber();
    }

    refreshData(reload = true) {
        this.isDataLoaded = false;
        if ( reload ) {
            this.requestData();
        } else {
            this.requestCachedData();
        }
    }

    toggleConfigSection(section) {
        this.visibleSections[section] = !this.visibleSections[section];
    }

    scrollToElement($element): void {
        setTimeout(() => {
            $element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
        });
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
        this.interCom.requestSend({
            action: 'closeViewEditMode',
            id: this.widget.id,
            payload: 'dashboard'
        });
    }

    applyConfig() {
        const cloneWidget = { ...this.widget };
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: this.needRequery }
        });
        this.closeViewEditMode();
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

    setDefaultVisualization() {
        this.widget.settings.visual.prefix = this.widget.settings.visual.prefix || '';
        this.widget.settings.visual.unit = this.widget.settings.visual.unit || '';
        this.widget.settings.visual.prefixAlignment = this.widget.settings.visual.prefixAlignment || 'middle';
        this.widget.settings.visual.unitAlignment = this.widget.settings.visual.unitAlignment || 'middle';
        this.widget.settings.visual.prefixSize = this.widget.settings.visual.prefixSize || 'm';
        this.widget.settings.visual.unitSize = this.widget.settings.visual.unitSize || 'm';

        this.widget.settings.visual.caption = this.widget.settings.visual.caption || '';
        this.widget.settings.visual.precision = this.widget.settings.visual.precision || 2;
        this.widget.settings.visual.backgroundColor = this.widget.settings.visual.backgroundColor || '#0B5ED2';
        this.widget.settings.visual.textColor = this.widget.settings.visual.textColor || '#FFFFFF';
        this.widget.settings.visual.color = this.widget.settings.visual.color || '#FFFFFF';
        this.widget.settings.visual.sparkLineEnabled = this.widget.settings.visual.sparkLineEnabled || false;
        this.widget.settings.visual.changedIndicatorEnabled = this.widget.settings.visual.changedIndicatorEnabled || false;

        this.textColor = this.widget.settings.visual.textColor;
        this.backgroundColor = this.widget.settings.visual.backgroundColor;
    }

    disableAnyRemainingGroupBys() {
        // this is in-case anyone previously set group-by for big number
        if (this.widget && this.widget.queries[0] && this.widget.queries[0].metrics) {
            for (let metric of this.widget.queries[0].metrics) {
                if (metric.groupByTags && metric.groupByTags.length) {
                    metric.groupByTags = [];
                }
            }
        }
    }

    toggleQueryMetricVisibility(qid, mid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);

        for (let query of this.widget.queries) {
            for (let metric of query.metrics) {
                metric.settings.visual.visible = false;
            }
        }

        this.widget.queries[qindex].metrics[mindex].settings.visual.visible = true;
        this.refreshData();
        this.setBigNumber();
    }

    enableFirstMetricVisibility() {
        if (this.widget.queries.length && this.widget.queries[0].metrics.length) {
            this.widget.queries[0].metrics[0].settings.visual.visible = true;
        }
    }

    cloneQuery(qid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        if ( qindex !== -1 ) {
            const query = this.util.getQueryClone(this.widget.queries, qindex);
            for (let metric of query.metrics) {
                metric.settings.visual.visible = false;
            }
            this.widget.queries.splice(qindex + 1, 0, query);
        }
    }

    deleteQueryMetric(qid, mid) {
        // toggle the individual query
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        if (this.widget.queries[qindex]) {
            const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
            const resetVisbility = this.widget.queries[qindex].metrics[mindex].settings.visual.visible;
            this.widget.queries[qindex].metrics.splice(mindex, 1);
            // only reindex visibility if there are metrics AND deleted metric is visible metric
            if (resetVisbility && this.widget.queries[qindex].metrics.length !== 0) {
                this.widget.queries[qindex].metrics[0].settings.visual.visible = true;
            }
        }
    }

    ngOnDestroy() {
        this.newSizeSub.unsubscribe();
        if (this.listenSub) {
            this.listenSub.unsubscribe();
        }
        this.doRefreshDataSub.unsubscribe();
    }

}

interface IBigNumberVisual {
    queryID: string;
    comparedTo?: number;

    prefix?: string;
    prefixSize?: string;
    prefixAlignment?: string;

    unit: string;
    unitSize: string;
    unitAlignment: string;

    caption?: string;

    precision: number;

    textColor: string;
    backgroundColor: string;

    sparkLineEnabled: boolean;
    changedIndicatorEnabled?: boolean;
}
