/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    Component, OnInit, HostBinding, Input,
    OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit
} from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { Subscription } from 'rxjs';
import { WidgetModel, Axis } from '../../../../../dashboard/state/widgets.state';
import { MatDialog, MatDialogConfig, MatDialogRef, MatPaginator } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { debounceTime} from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { AppConfigService } from '../../../../../core/services/config.service';



import { ElementQueries, ResizeSensor } from 'css-element-queries';

@Component({
    //tslint:disable-next-line:component-selector
    selector: 'table-widget',
    templateUrl: './table-widget.component.html',
    styleUrls: []
})

export class TableWidgetComponent implements OnInit, AfterViewInit, OnDestroy{

    @HostBinding('class.widget-panel-content') private _hostClass = true; 
    @HostBinding('class.table-widget') private _componentClass = true; 

    @Input() mode = 'view'; // view/explore/edit
    @Input() widget: WidgetModel;
    @Input() readonly = true;

    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;
    @ViewChild(MatSort) sort: MatSort;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('dataTable', {read: MatTable}) dataTable: MatTable<any>;

    //global vars
    Object = Object;
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([{}]); 
    displayedColumns;
    displayedColumnsIds = [];

    private listenSub: Subscription;
    isDataLoaded = false;

    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;

    options: any = {
        displayColumns : [],
        timezome : 'local'
    };
    data = [];
    size: any = { width: 120, height: 60};
    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    nQueryDataLoading: number;
    error: any;
    needRequery = false;
    isDestroying = false;
    visibleSections: any = { 'queries' : true, 'time': false, 'visuals': false };
    resizeSensor: any;
    isEditContainerResized = false;
    width: any = '100%';
    height: any = '100%';
    widgetOutputElHeight = 60;
    errorDialog: MatDialogRef < ErrorDialogComponent > | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef < DebugDialogComponent > | null;
    storeQuery: any;
    meta: any = {};
    formErrors: any = {};

    constructor(
        private cdRef: ChangeDetectorRef,
        private interCom: IntercomService,
        public dialog: MatDialog,
        private dataTransformer: DatatranformerService,
        private util: UtilsService,
        private elRef: ElementRef,
        private unit: UnitConverterService,
        private dateUtil: DateUtilsService,
        private appConfig: AppConfigService
    ) { }

    ngOnInit() 
    {
        this.widget.settings.layout = this.widget.settings.layout || 'column';
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
            switch (message.action) {
                case 'TimeChanged':
                    overrideTime = this.widget.settings.time.overrideTime;
                    if ( !overrideTime ) {
                        this.refreshData();
                    }
                    break;
                case 'reQueryData':
                    this.refreshData();
                    break;
                case 'TimezoneChanged':
                    this.setTimezone(message.payload.zone);
                    this.refreshData(false);
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
            }

            //implement table specific changes
            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'updatedWidgetGroup':
                        this.nQueryDataLoading--;
                        if (!this.isDataLoaded) {
                            this.isDataLoaded = true;
                        }
                        if (message.payload.error) {
                            this.error = message.payload.error;
                        } else {
                            this.error = null;
                        }
                        if (this.appConfig.getConfig().debugLevel.toUpperCase() === 'TRACE' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'DEBUG' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'INFO') {
                            this.debugData = message.payload.rawdata.log; // debug log
                        }

                            this.setTimezone(message.payload.timezone);
                            const rawdata = message.payload.rawdata;
                            this.data = this.dataTransformer.openTSDBToTable(this.widget, this.options, rawdata); 
                            this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
                            this.dataSource = new MatTableDataSource(this.data);
                            this.displayedColumns = this.util.deepClone(this.options.displayColumns); 
                            this.displayedColumnsIds = [...this.displayedColumns.map(d => d.id)];
                            this.cdRef.detectChanges();
                            if ( this.sort ) {
                                this.sortData(this.sort);
                            }
                        break;
                    case 'getUpdatedWidgetConfig':
                        this.widget = message.payload.widget;
                        // this.setOptions();
                        this.refreshData(message.payload.needRefresh);
                        break;
                    case 'WidgetQueryLoading':
                        this.nQueryDataLoading = 1;
                        this.cdRef.detectChanges();
                        break;
                }
            }
        });
        // when the widget first loaded in dashboard, we request to get data
        // when in edit mode first time, we request to get cached raw data.
        setTimeout(() => this.refreshData(this.mode !== 'view' ? false : true), 100);
    }

    updateConfig(message) {
        console.log("update config", message.action, message)
        switch ( message.action ) {
            case 'SetMetaData':
                this.setMetaData(message.payload.data);
                break;
            case 'SetTimeConfiguration':
                this.setTimeConfiguration(message.payload.data);
                this.doRefreshData$.next(true);
                this.needRequery = true; // set flag to requery if apply to dashboard
                break;
            case 'SetVisualization':
                this.setVisualization( message.payload.data );
                this.widget = { ...this.widget };
                this.refreshData(false);
                // this.cdRef.detectChanges();
                break;
            case 'UpdateQuery':
                this.util.updateQuery(this.widget, message.payload);
                this.widget.queries = [...this.widget.queries];
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricVisual':
                this.util.updateQueryMetricVisual(this.widget, message.id, message.payload.mid, message.payload.visual);
                this.refreshData(false);
                break;
            case 'ToggleQueryMetricVisibility':
                this.util.toggleQueryMetricVisibility(this.widget, message.id, message.payload.mid);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQueryMetric':
                this.util.deleteQueryMetric(this.widget, message.id, message.payload.mid);
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.widget = { ...this.widget };
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
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'DeleteQuery':
                this.util.deleteQuery(this.widget, message.id);
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.widget = { ...this.widget };
                this.needRequery = true;
                break;
            case 'UpdateQueryOrder':
                this.widget.queries = this.util.deepClone(message.payload.queries);
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'UpdateQueryMetricOrder':
                const qindex = this.widget.queries.findIndex(q => q.id === message.id);
                this.widget.queries[qindex] = message.payload.query;
                this.widget.queries = this.util.deepClone(this.widget.queries);
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'ToggleDBFilterUsage':
                this.widget.settings.useDBFilter = message.payload.apply;
                this.refreshData();
                this.needRequery = message.payload.reQuery;
                break;
            case 'ToggleInfectiousNan':
                this.util.toggleQueryInfectiousNan(this.widget, message.payload.checked);
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
            case 'SummarizerChange':
                this.refreshData(false);
                break;
        }
    }

    updateQuery( payload ) {
        const query = payload.query;
        const qindex = query.id ? this.widget.queries.findIndex(q => q.id === query.id ) : -1;
        if ( qindex === -1 ) {
            query.id = this.util.generateId(6, this.util.getIDs(this.widget.queries));
            this.widget.queries.push(query);
        } else {
            this.widget.queries[qindex] = query;
        }
    }

    setVisualConditions(conditions) {
        this.widget.settings.visual.conditions = conditions;
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        ElementQueries.listen();
        ElementQueries.init();
        const dummyFlag = 1;
        this.newSize$ = new BehaviorSubject(dummyFlag);

        this.newSizeSub = this.newSize$.pipe(
            debounceTime(100)
        ).subscribe(flag => {
            this.setSize();
        });
        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
            this.newSize$.next(dummyFlag);
        });
    }

    sortingDataAccessor(data, colId)  {
        switch (colId) {
          case 'metric': 
          case 'tag':
              return data[colId];
          default: return parseFloat(data[colId+':raw']);
        }
    }

    sortData(sort) {
        this.widget.settings.visual.sortBy = sort.active;
        this.widget.settings.visual.sortDir = sort.direction;
        this.data.sort((a: any, b: any) => {
            const valueA = this.sortingDataAccessor(a, sort.active);
            const valueB = this.sortingDataAccessor(b, sort.active);
            if ( sort.active === 'metric' || sort.active === 'tag' ) {
                return (valueA < valueB ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
            } else {
                return (sort.direction === 'asc') ? valueA - valueB : valueB - valueA;
            }
        });
        this.dataTable.renderRows();
    }

    trackByIndex(index) {
        return index;
    }


    setSize() {
        // if edit mode, use the widgetOutputEl. If in dashboard mode, go up out of the component,
        // and read the size of the first element above the componentHostEl
        const nativeEl = (this.mode !== 'view') ?
            this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

        const heightMod = 0.55;
        // tslint:disable-next-line:max-line-length
        this.widgetOutputElHeight = !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement.getBoundingClientRect().height * heightMod 
                                                                : nativeEl.getBoundingClientRect().height + 10;
        const outputSize = nativeEl.getBoundingClientRect();
        if (this.mode !== 'view') {
            this.width = outputSize.width;
            this.height = this.widgetOutputElHeight - 53;
        } else {
            this.width = (outputSize.width - 30);
            this.height = (outputSize.height - 3);
        }
        this.detectChanges();
    }

    detectChanges() {
        if ( ! this.isDestroying ) {
            this.cdRef.detectChanges();
        }
    }

    handleEditResize(e) {
        this.isEditContainerResized = true;
    }

    scrollToElement($element): void {
        setTimeout(() => {
            $element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
        });
    }

    toggleConfigSection(section) {
        this.visibleSections[section] = !this.visibleSections[section];
    }

    setTimezone(timezone) {
        console.log("setTimezone", timezone);
        this.options.timezone = timezone;
    }

    setTimeConfiguration(config) {
        this.widget.settings.time = {
            shiftTime: config.shiftTime,
            overrideRelativeTime: config.overrideRelativeTime,
            downsample: {
                value: config.downsample,
                aggregators: config.aggregators,
                customValue: config.downsample !== 'custom' ? '' : config.customDownsampleValue,
                customUnit: config.downsample !== 'custom' ? '' : config.customDownsampleUnit
            }
        };
    }

    setVisualization( configs ) {
        // tslint:disable-next-line:max-line-length
        this.widget.settings.visual = { ...this.widget.settings.visual, ...configs };
    }


    setMetaData(config) {
        this.widget.settings = {...this.widget.settings, ...config};
    }

    trackByWidget(index) {
        return index;
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
                payload: this.widget,
            });
            // this.cdRef.detectChanges();
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
        } else {
            this.requestCachedData();
        }
    }

    toggleQueryVisibility(qid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        this.widget.queries[qindex].settings.visual.visible =
            !this.widget.queries[qindex].settings.visual.visible;
    }

    cloneQuery(qid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        if ( qindex !== -1 ) {
            const query = this.util.getQueryClone(this.widget.queries, qindex);
            this.widget.queries.splice(qindex + 1, 0, query);
        }
    }

    deleteQuery(qid) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        this.widget.queries.splice(qindex, 1);
    }

    toggleQueryMetricVisibility(qid, mid) {
        // toggle the individual query metric
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        this.widget.queries[qindex].metrics[mindex].settings.visual.visible =
            !this.widget.queries[qindex].metrics[mindex].settings.visual.visible;
    }

    deleteQueryMetric(qid, mid) {
        // toggle the individual query
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        this.widget.queries[qindex].metrics.splice(mindex, 1);
    }

    deleteQueryFilter(qid, findex) {
        const qindex = this.widget.queries.findIndex(d => d.id === qid);
        this.widget.queries[qindex].filters.splice(findex, 1);
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
    // request send to update state to close edit mode
    closeViewEditMode() {
        this.interCom.requestSend({
            action: 'closeViewEditMode',
            payload: 'dashboard'
        });
    }

    // apply config from editing
    applyConfig() {
        this.unsetMetricSummarizer();
        this.closeViewEditMode();
        const cloneWidget = JSON.parse(JSON.stringify(this.widget));
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, needRequery: this.needRequery }
        });
    }

    unsetMetricSummarizer() {
        if ( this.widget.settings.visual.layout !== 'metric:tags' ) {
            for (let i = 0; i < this.widget.queries.length; i++ ) {
                for (const metric of this.widget.queries[i].metrics) {
                    if (metric.summarizer) {
                        delete metric.summarizer;
                    }
                }
            }
        }
    }

    changeWidgetType(type) {
        if ( type === 'LinechartWidgetComponent' || type === 'HeatmapWidgetComponent') {
            this.unsetMetricSummarizer();
        }
        const wConfig = this.util.deepClone(this.widget);
        wConfig.id = wConfig.id.replace('__EDIT__', '');
         this.interCom.requestSend({
             action: 'changeWidgetType',
             id: wConfig.id,
             payload: { wConfig: wConfig, newType: type }
         });
    }

    changeLayout(type) {
        this.widget.settings.layout = type;
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
        this.isDestroying = true;
        this.newSizeSub.unsubscribe();
        if (this.listenSub) {
            this.listenSub.unsubscribe();
        }
        this.doRefreshDataSub.unsubscribe();
    }
}
