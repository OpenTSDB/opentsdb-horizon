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
    Component, OnInit, HostBinding, ChangeDetectorRef,
    Input, OnDestroy, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';

import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ElementQueries, ResizeSensor } from 'css-element-queries';
import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition } from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { debounceTime } from 'rxjs/operators';
import { AppConfigService } from '../../../../../core/services/config.service';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'donut-widget',
    templateUrl: './donut-widget.component.html',
    styleUrls: ['./donut-widget.component.scss']
})

export class DonutWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.donutchart-widget') private _componentClass = true;

    @Input() widget: any;
    @Input() mode = 'view'; // view/explore/edit

    @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;
    @ViewChild('container') private container: ElementRef;
    @ViewChild('chartLegend') private chartLegend: ElementRef;

    Object = Object;
    private listenSub: Subscription;
    private isDataLoaded = false;
    type$: BehaviorSubject<string>;
    typeSub: Subscription;

    doRefreshData$: BehaviorSubject<boolean>;
    doRefreshDataSub: Subscription;

    options: any = {
        type: 'doughnut',
        legend: {
            display: true,
            position: 'right',
        },
        data: []
    };
    width = '100%';
    height = '100%';
    size: any = { width: 0, height: 0, legendWidth: 0 };
    newSize$: BehaviorSubject<any>;
    newSizeSub: Subscription;
    widgetOutputElHeight = 60;
    isEditContainerResized = false;
    legendWidth = 0;
    nQueryDataLoading = 0;
    error: any;
    errorDialog: MatDialogRef<ErrorDialogComponent> | null;
    debugData: any; // debug data from the data source.
    debugDialog: MatDialogRef<DebugDialogComponent> | null;
    storeQuery: any;
    needRequery = false;
    visibleSections: any = { 'queries': true, 'time': false, 'visuals': false, 'legend': false };
    formErrors: any = {};
    meta: any = {};
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

        this.type$ = new BehaviorSubject(this.widget.settings.visual.type || 'doughnut');
        this.typeSub = this.type$.subscribe(type => {
            this.widget.settings.visual.type = type;
            this.options.type = type === 'doughnut' ? 'doughnut' : 'pie';
        });

        // subscribe to event stream
        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            let overrideTime;
            switch (message.action) {
                case 'TimeChanged':
                    overrideTime = this.widget.settings.time.overrideTime;
                    if (!overrideTime) {
                        this.refreshData();
                    }
                    break;
                case 'reQueryData':
                    if (!message.id || message.id === this.widget.id) {
                        this.refreshData();
                    }
                    break;
                case 'ZoomDateRange':
                    if (!message.id || message.id === this.widget.id) {
                        overrideTime = this.widget.settings.time.overrideTime;
                        if (message.payload.date.isZoomed && overrideTime) {
                            const oStartUnix = this.dateUtil.timeToMoment(overrideTime.start, message.payload.date.zone).unix();
                            const oEndUnix = this.dateUtil.timeToMoment(overrideTime.end, message.payload.date.zone).unix();
                            if (oStartUnix <= message.payload.date.start && oEndUnix >= message.payload.date.end) {
                                this.options.isCustomZoomed = message.payload.date.isZoomed;
                                this.widget.settings.time.zoomTime = message.payload.date;
                                this.refreshData();
                            }
                            // tslint:disable-next-line: max-line-length
                        } else if ((message.payload.date.isZoomed && !overrideTime && !message.payload.overrideOnly) || (this.options.isCustomZoomed && !message.payload.date.isZoomed)) {
                            this.options.isCustomZoomed = message.payload.date.isZoomed;
                            this.refreshData();
                        }
                        // unset the zoom time
                        if (!message.payload.date.isZoomed) {
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
                        if (!this.isDataLoaded) {
                            this.isDataLoaded = true;
                            this.options.data = [];
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
                        this.options = this.dataTransformer.openTSDBToD3Donut(this.options, this.widget, message.payload.rawdata);
                        this.cdRef.detectChanges();
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
                    case 'widgetDragDropEnd':
                        if (this.resizeSensor) {
                            this.resizeSensor.detach();
                        }
                        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                            const newSize = {
                                width: this.widgetOutputElement.nativeElement.clientWidth,
                                height: this.widgetOutputElement.nativeElement.clientHeight
                            };
                            this.newSize$.next(newSize);
                        });
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
        setTimeout(() => {
            this.refreshData(this.mode !== 'view' ? false : true);
            this.setOptions();
        });
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

        this.newSizeSub = this.newSize$.subscribe(size => {
            setTimeout(() => this.setSize(size), 0);
        });
        this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
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

    setSize(newSize) {
        const maxRadius = Math.min(newSize.width, newSize.height);
        let legendWidth = newSize.width - maxRadius;
        // min legend width=100 if total width > 200
        if (legendWidth < 100 && newSize.width > 200) {
            legendWidth = 100;
            newSize.width = newSize.width - legendWidth;
        }

        const heightMod = 0.55;
        // tslint:disable-next-line:max-line-length
        this.widgetOutputElHeight = !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement.getBoundingClientRect().height * heightMod
            : newSize.height + 60;


        this.size = { ...newSize, legendWidth: legendWidth };
        this.cdRef.detectChanges();
    }

    handleEditResize(e) {
        this.isEditContainerResized = true;
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
        switch (message.action) {
            case 'SetMetaData':
                this.util.setWidgetMetaData(this.widget, message.payload.data);
                break;
            case 'SetTimeError':
                if (message.payload.error) {
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
            case 'SetLegend':
                this.widget.settings.legend = message.payload.data;
                this.setLegendOption();
                this.options = { ...this.options };
                break;
            case 'ChangeVisualization':
                this.type$.next(message.payload.type);
                this.options = { ...this.options };
                break;
            case 'SetVisualization':
                this.setVisualization(message.payload.gIndex, message.payload.data);
                this.refreshData(false);
                break;
            case 'SetSorting':
                this.setSorting(message.payload);
                this.doRefreshData$.next(true);
                this.needRequery = true;
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
            case 'SummarizerChange':
                this.refreshData();
                break;
            case 'ToggleInfectiousNan':
                this.util.toggleQueryInfectiousNan(this.widget, message.payload.checked);
                this.widget = { ...this.widget };
                this.doRefreshData$.next(true);
                this.needRequery = true;
                break;
        }
    }

    updateQuery(payload) {
        const query = payload.query;
        const qindex = query.id ? this.widget.queries.findIndex(q => q.id === query.id) : -1;
        if (qindex !== -1) {
            this.widget.queries[qindex] = query;
        }
    }

    setVisualization(qIndex, mconfigs) {
        mconfigs.forEach((config, i) => {
            // tslint:disable-next-line:max-line-length
            this.widget.queries[qIndex].metrics[i].settings.visual = { ...this.widget.queries[qIndex].metrics[i].settings.visual, ...config };
        });
    }

    setOptions() {
        this.type$.next(this.widget.settings.visual.type);
        this.setLegendOption();
    }

    setLegendOption() {
        this.options.legend = { ...this.widget.settings.legend };
        this.options.legendDiv = this.chartLegend.nativeElement;
    }

    setSorting(sConfig) {
        this.widget.settings.sorting = { order: sConfig.order, limit: sConfig.limit };
    }

    refreshData(reload = true) {
        this.isDataLoaded = false;
        if (reload) {
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
            $element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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
        const cloneWidget = this.util.deepClone(this.widget);
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
        this.typeSub.unsubscribe();
        this.doRefreshDataSub.unsubscribe();
    }
}
