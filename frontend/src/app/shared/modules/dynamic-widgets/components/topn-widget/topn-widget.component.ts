import { Component, OnInit, HostBinding, Input,
    OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { Subscription, BehaviorSubject} from 'rxjs';
import { ElementQueries, ResizeSensor } from 'css-element-queries';
import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition} from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { debounceTime } from 'rxjs/operators';
import { AppConfigService } from '../../../../../core/services/config.service';

@Component({
  selector: 'app-topn-widget',
  templateUrl: './topn-widget.component.html',
  styleUrls: ['./topn-widget.component.scss']
})

export class TopnWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.topnchart-widget') private _componentClass = true;

    @Input() widget: any;
    @Input() mode = 'view'; // view/explore/edit

    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;
    @ViewChild('container') private container: ElementRef;

    Object = Object;
    private listenSub: Subscription;
    // tslint:disable-next-line:no-inferrable-types
    private isDataLoaded: boolean = false;
    // tslint:disable-next-line:no-inferrable-types

    options: any  = {
        direction: 'horizontal',
        data: [],
        format: { unit: '', precision: 2 , precisionStrict: true}
    };
    width = '100%';
    height = '100%';
    size: any = { width: 0, height: 0 };
    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    widgetOutputElHeight = 60;
    isEditContainerResized = false;
    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;
    legendWidth = 0;
    nQueryDataLoading = 0;
    meta: any = {};
    error: any;
    errorDialog: MatDialogRef < ErrorDialogComponent > | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef < DebugDialogComponent > | null;
    storeQuery: any;
    needRequery = false;
    visibleSections: any = { 'queries' : true, 'time': false, 'visuals': false };
    formErrors: any = {};
    resizeSensor: any;

    constructor(
        private interCom: IntercomService,
        private dataTransformer: DatatranformerService,
        public dialog: MatDialog,
        private util: UtilsService,
        private cdRef: ChangeDetectorRef,
        private elRef: ElementRef,
        private dateUtil: DateUtilsService,
        private appConfig: AppConfigService
    ) { }

    ngOnInit() {
        this.visibleSections.queries = this.mode === 'edit' ? true : false;
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

        // subscribe to event stream
        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            let overrideTime;
            switch ( message.action ) {
                case 'TimeChanged':
                    overrideTime = this.widget.settings.time.overrideTime;
                    if ( !overrideTime ) {
                        this.refreshData();
                    }
                    break;
                case 'reQueryData':
                    if ( !message.id || message.id === this.widget.id ) {
                        this.refreshData();
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
                                this.refreshData();
                            }
                        // tslint:disable-next-line: max-line-length
                        } else if ( (message.payload.date.isZoomed && !overrideTime && !message.payload.overrideOnly) || (this.options.isCustomZoomed && !message.payload.date.isZoomed) ) {
                            this.options.isCustomZoomed = message.payload.date.isZoomed;
                            this.refreshData();
                        }
                        // unset the zoom time
                        if ( !message.payload.date.isZoomed ) {
                            delete this.widget.settings.time.zoomTime;
                        }
                    }
                    break;
                case 'SnapshotMeta':
                    this.meta = message.payload;
                    break;
                case 'ResizeAllWidgets':
                    if(this.resizeSensor) {
                        this.resizeSensor.detach();
                    }
                    this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                        this.newSize$.next(1);
                    });
                    break;
            }
            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'updatedWidgetGroup':
                        this.nQueryDataLoading--;
                        if ( !this.isDataLoaded ) {
                            this.isDataLoaded = true;
                            this.options.data = [];
                        }
                        if ( message.payload.error ) {
                            this.error = message.payload.error;
                        } else {
                            this.error = null;
                        }
                        if (this.appConfig.getConfig().debugLevel.toUpperCase() === 'TRACE' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'DEBUG' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'INFO') {
                                this.debugData = message.payload.rawdata.log; // debug log
                        }
                        this.setOptions();
                        this.options = this.dataTransformer.yamasToD3Bar(this.options, this.widget, message.payload.rawdata);
                        this.cdRef.detectChanges();
                        break;
                    case 'getUpdatedWidgetConfig':
                        this.widget = message.payload.widget;
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
                            const newSize = {
                                width: this.widgetOutputElement.nativeElement.clientWidth,
                                height: this.widgetOutputElement.nativeElement.clientHeight
                            }
                            this.newSize$.next(newSize);
                        });
                        break;
                }
            }
        });

        // first time when displaying chart
        if (!this.widget.settings.sorting) {
            this.widget.settings.sorting = { limit: 10, order: 'top' };
        }

        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(() => this.refreshData(this.mode !== 'view' ? false : true), 0);
    }

    ngAfterViewInit() {
        // this event will happend on resize the #widgetoutput element,
        // in  chartjs we don't need to pass the dimension to it.
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
        const nativeEl = (this.mode !== 'view') ?
            this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');
        this.resizeSensor = new ResizeSensor(nativeEl, () => {
             const newSize = {
                width: nativeEl.clientWidth,
                height: nativeEl.clientHeight
            };
            this.newSize$.next(newSize);
        });
    }

    setOptions() {
        this.options.format.unit = this.widget.settings.visual.unit;
    }
    setSize(newSize) {

        const editModifier = this.mode !== 'view' ? 0 : 20;
        const heightMod = 0.55;
        this.widgetOutputElHeight = !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement.getBoundingClientRect().height * heightMod
                                                                : newSize.height + 60;
        const nativeEl = (this.mode !== 'view') ?
            this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');
        const outputSize = nativeEl.getBoundingClientRect();
        this.size = { width: outputSize.width, height: outputSize.height - editModifier };
        this.cdRef.detectChanges();
    }

    handleEditResize(e) {
        this.isEditContainerResized = true;
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

    updateConfig(message) {
        switch ( message.action ) {
            case 'SetMetaData':
                this.util.setWidgetMetaData(this.widget, message.payload.data);
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
                this.util.setWidgetTimeConfiguration(this.widget, message.payload.data);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'SetSorting':
                this.setSorting(message.payload);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQuery':
                this.updateQuery(message.payload);
                this.widget.queries = [...this.widget.queries];
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricVisual':
                this.setVisualization(message.payload.visual);
                this.refreshData(false);
                break;
            case 'ToggleQueryMetricVisibility':
                this.toggleQueryMetricVisibility(message.id, message.payload.mid);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQueryMetric':
                this.deleteQueryMetric(message.id, message.payload.mid);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ToggleQueryVisibility':
                this.util.toggleQueryVisibility(this.widget, message.id);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'CloneQuery':
                this.cloneQuery(message.id);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQuery':
                this.deleteQuery(message.id);
                this.doRefreshData$.next(true);
                this.widget = {...this.widget};
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
            case 'ToggleInfectiousNan':
                this.util.toggleQueryInfectiousNan(this.widget, message.payload.checked);
                this.widget = {...this.widget};
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
        }
    }
    updateQuery( payload ) {
        const query = payload.query;
        let qindex = query.id ? this.widget.queries.findIndex(q => q.id === query.id ) : -1;
        if ( qindex !== -1 ) {
            this.widget.queries[qindex] = query;
        }
        let hasVisibleMetric = false;
        for (let i = 0; i < this.widget.queries.length; i++ ) {
            for (let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                if ( this.widget.queries[i].metrics[j].settings.visual.visible ) {
                    hasVisibleMetric = true;
                    break;
                }
            }
            if ( hasVisibleMetric ) {
                break;
            }
        }

        // default metric visibility is false. so make first metric visible
        // find query with metrics in it
        qindex = this.widget.queries.findIndex(d => d.metrics.length > 0);
        if ( qindex !== -1 && hasVisibleMetric === false ) {
            this.widget.queries[qindex].metrics[0].settings.visual.visible = true;
        }
    }

    setVisualization( visual) {
        this.widget.settings.visual = {...this.widget.settings.visual, ...visual}
    }

    setVisualConditions( vConditions ) {
        this.widget.settings.visual.conditions = vConditions;
    }

    setSorting(sConfig) {
        this.widget.settings.sorting = { order: sConfig.order, limit: sConfig.limit };
    }

    refreshData(reload = true) {
        this.isDataLoaded = false;
        if ( reload ) {
            this.requestData();
        } else {
            this.requestCachedData();
        }
    }

    toggleQueryMetricVisibility(qid, mid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        for (let i = 0; i < this.widget.queries.length; i++ ) {
            for (let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                this.widget.queries[i].metrics[j].settings.visual.visible = false;
            }
        }
        this.widget.queries[qindex].metrics[mindex].settings.visual.visible = true;
    }

    deleteQueryMetric(qid, mid) {
        let qindex = this.widget.queries.findIndex(d => d.id === qid);
        if (this.widget.queries[qindex]) {
            const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
            const delMetricVisibility = this.widget.queries[qindex].metrics[mindex].settings.visual.visible;
            this.widget.queries[qindex].metrics.splice(mindex, 1);

            // find query with metrics in it
            qindex = this.widget.queries.findIndex(d => d.metrics.length > 0);
            if ( qindex !== -1 && delMetricVisibility ) {
                this.widget.queries[qindex].metrics[0].settings.visual.visible = true;
            }
        }
    }

    cloneQuery(qid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        if ( qindex !== -1 ) {
            const query = this.util.getQueryClone(this.widget.queries, qindex);
            query.metrics.map(d => { d.settings.visual.visible = false; } );
            this.widget.queries.splice(qindex + 1, 0, query);
        }
    }

    deleteQuery(qid) {
        let qindex = this.widget.queries.findIndex(d => d.id === qid);
        const hasSelectedMetric = this.widget.queries[qindex].metrics.findIndex( d => d.settings.visual.visible );
        this.widget.queries.splice(qindex, 1);

        qindex = this.widget.queries.findIndex(d => d.metrics.length > 0 );
        if ( qindex !== -1 && hasSelectedMetric !== -1  ) {
            this.widget.queries[qindex].metrics[0].settings.visual.visible = true;
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
        this.interCom.requestSend(<IMessage>{
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

    ngOnDestroy() {
        this.newSizeSub.unsubscribe();
        this.listenSub.unsubscribe();
        this.doRefreshDataSub.unsubscribe();
    }
}

