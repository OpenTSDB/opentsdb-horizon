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
  OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, AfterViewInit
} from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { InfoIslandService } from '../../../info-island/services/info-island.service';
import { Subscription } from 'rxjs';
import { WidgetModel, Axis } from '../../../../../dashboard/state/widgets.state';
import { IDygraphOptions } from '../../../dygraphs/IDygraphOptions';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { ElementQueries, ResizeSensor} from 'css-element-queries';
import { debounceTime } from 'rxjs/operators';
import { heatmapPlotter } from '../../../../dygraphs/plotters';
import { AppConfigService } from '../../../../../core/services/config.service';
import { ComponentPortal } from '@angular/cdk/portal';
@Component({
// tslint:disable-next-line: component-selector
  selector: 'heatmap-widget',
  templateUrl: './heatmap-widget.component.html',
  styleUrls: ['./heatmap-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatmapWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.widget-panel-content') private _hostClass = true;
  @HostBinding('class.heatmap-widget') private _componentClass = true;

  @Input() widget: WidgetModel;
  @Input() mode = 'view'; // view/explore/edit
  @Input() readonly = true;

  @ViewChild('widgetOutputContainer', { static: true }) private widgetOutputContainer: ElementRef;
  @ViewChild('widgetTitle') private widgetTitle: ElementRef;
  @ViewChild('widgetoutput', { static: true }) private widgetOutputElement: ElementRef;
  @ViewChild('graphLegend', { static: true }) private dygraphLegend: ElementRef;
  @ViewChild('dygraph', { static: true }) private dygraph: ElementRef;

  Object = Object;
  private listenSub: Subscription;
  private isDataLoaded = false;
  private isStackedGraph = false;
  chartType = 'line';

  options: IDygraphOptions = {
      labels: ['x'],
      labelsUTC: false,
      labelsKMB: true,
      connectSeparatedPoints: false,
      drawPoints: false,
      //  labelsDivWidth: 0,
      legend: 'follow',
      logscale: false,
      digitsAfterDecimal: 2,
      stackedGraph: this.isStackedGraph,
      strokeWidth: 0,
      strokeBorderWidth: this.isStackedGraph ? 0 : 0,
      highlightSeriesBackgroundAlpha: 1,
      highlightCircleSize: 0,
      highlightSeriesOpts: {
          strokeWidth: 0,
          highlightCircleSize: 0
      },
      xlabel: '',
      ylabel: '',
      y2label: '',
      axisLineWidth: 0,
      axisLineColor: '#fff',
      axes: {
          x: {},
          y: {
              valueRange: [0, 30],
              tickFormat: {},
          }
      },
      drawGrid: true,
      series: {},
      gridLineColor: '#ccc',
      plotter: heatmapPlotter,
      isIslandLegendOpen: false,
      pointSize: 0,
      heatmap: {
          buckets: 30,
          nseries: 0,
          x: []
      },
      xAxisHeight: 12
  };
  data: any = { ts: [[0]] };
  size: any = { width: 120, height: 75};
  tsLegendOptions: any = {
    open: false,
    trackMouse: false
  };
  newSize$: BehaviorSubject<any>;
  newSizeSub: Subscription;
  widgetOutputElSize: any;
  widgetOutputElHeight = 60;
  isEditContainerResized = false;
  doRefreshData$: BehaviorSubject<boolean>;
  doRefreshDataSub: Subscription;
  nQueryDataLoading: number;
  error: any;
  errorDialog: MatDialogRef < ErrorDialogComponent > | null;
  debugData: any; // debug data from the data source.
  debugDialog: MatDialogRef < DebugDialogComponent > | null;
  storeQuery: any;
  needRequery = false;
  visibleSections: any = { 'queries' : true, 'time': false, 'visuals': false };
  formErrors: any = {};
  meta: any = {};
  resizeSensor: any;

  constructor(
      private cdRef: ChangeDetectorRef,
      private interCom: IntercomService,
      public dialog: MatDialog,
      private dataTransformer: DatatranformerService,
      private util: UtilsService,
      private elRef: ElementRef,
      private iiService: InfoIslandService,
      private unit: UnitConverterService,
      private dateUtil: DateUtilsService,
      private appConfig: AppConfigService
  ) { }

  ngOnInit() {
    this.visibleSections.queries = this.mode === 'edit' ? true : false;
    // this.options.isIslandLegendOpen = this.mode === 'explore' || this.mode === 'view';
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
              case 'TimezoneChanged':
                if ( !message.id || message.id === this.widget.id ) {
                  this.setTimezone(message.payload.zone);
                  this.options = { ...this.options };
                  this.cdRef.detectChanges();
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
                          this.resetChart();
                      }
                      if (message.payload.error) {
                          this.error = message.payload.error;
                          this.cdRef.markForCheck();
                      } else {
                          this.error = null;
                          const rawdata = message.payload.rawdata;
                          this.setTimezone(message.payload.timezone);
                          this.data.ts = this.dataTransformer.openTSDBToHeatmap(this.widget, this.options, this.data.ts, rawdata);
                          this.data = { ...this.data };
                          if (this.appConfig.getConfig().debugLevel.toUpperCase() === 'TRACE' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'DEBUG' ||
                            this.appConfig.getConfig().debugLevel.toUpperCase() == 'INFO') {
                                this.debugData = rawdata.log; // debug log
                            }
                          setTimeout(() => this.setSize());
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
      this.setOptions();
  }

  ngAfterViewInit() {
      ElementQueries.listen();
      ElementQueries.init();
      const dummyFlag = 1;
      this.newSize$ = new BehaviorSubject(dummyFlag);

      this.newSizeSub = this.newSize$.subscribe(flag => {
        setTimeout(() => this.setSize(), 0);
      });
      this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
          this.newSize$.next(dummyFlag);
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
            this.needRequery = true; // set flag to requery if apply to dashboard
            break;
        case 'SetUnit':
            this.setUnit(message.payload.data);
            this.setAxisOption();
            this.refreshData(false);
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
            if ( message.payload.visual.unit ) {
                this.setAxisOption();
            }
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
            this.doRefreshData$.next(true);
            this.widget = {...this.widget};
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
        case 'ToggleInfectiousNan':
            this.util.toggleQueryInfectiousNan(this.widget, message.payload.checked);
            this.widget = {...this.widget};
            this.doRefreshData$.next(true);
            this.needRequery = true;
            break;
    }
  }

  setTitle(title) {
    this.widget.settings.title = title;
  }

  setTimezone(timezone) {
      this.options.labelsUTC = timezone === 'utc' ? true : false;
  }

  setTimeConfiguration(config) {
      this.widget.settings.time = {
          shiftTime: config.shiftTime,
          overrideRelativeTime: config.overrideRelativeTime,
          downsample: {
              value: config.downsample,
              aggregators: config.aggregators,
              customValue: config.downsample !== 'custom' ? '' : config.customDownsampleValue,
              customUnit: config.downsample !== 'custom' ? '' : config.customDownsampleUnit,
              minInterval: config.minInterval,
              reportingInterval: config.reportingInterval
          }
      };
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

  setVisualization( visual ) {
    this.widget.settings.visual = {...this.widget.settings.visual, ...visual};
  }

  setUnit(unit) {
    this.widget.settings.visual.unit = unit;
  }

  setMetaData(config) {
      this.widget.settings = {...this.widget.settings, ...config};
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

  setOptions() {
    this.setLegendDiv();
    this.setAxisOption();
  }

  setLegendDiv() {
    this.options.labelsDiv = this.dygraphLegend.nativeElement;
  }

  setAxisOption() {
    const decimals = 2;
    const unit = this.widget.settings.visual.unit ? this.widget.settings.visual.unit : 'auto';
    this.options.axes.y.tickFormat = { unit: unit, precision: decimals, unitDisplay: true };
  }

  resetChart() {
    this.options = {...this.options, labels: ['x']};
    this.data = { ts: [[0]] };
  }

  setSize() {
       const nativeEl = (this.mode !== 'view') ?
          this.widgetOutputElement.nativeElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');
        const heightMod = this.mode === 'edit' ? 0.6 : 0.7;
        // tslint:disable-next-line:max-line-length
        this.widgetOutputElHeight = !this.isEditContainerResized && this.widget.queries[0].metrics.length ? this.elRef.nativeElement.getBoundingClientRect().height * heightMod
          : this.widgetOutputElement.nativeElement.getBoundingClientRect().height + 60;
       const newSize = nativeEl.getBoundingClientRect();
      // let newSize = outputSize;
      let nWidth, nHeight, padding;


      const widthOffset = 0;
      const heightOffset = 0;


      if (this.mode !== 'view') {
          let titleSize = {width: 0, height: 0};
          if (this.widgetTitle) {
              titleSize = this.widgetTitle.nativeElement.getBoundingClientRect();
          }
          padding = 8; // 8px top and bottom
          nHeight = newSize.height - heightOffset - 5;
          nWidth = newSize.width - widthOffset  - (padding * 2) - 30;
      } else {
          padding = 10; // 10px on the top
          nHeight = newSize.height - heightOffset - (padding * 2);
          nWidth = newSize.width - widthOffset  - (padding * 2);
      }

      const xAxisMinHeight = 15;
      this.options.xAxisHeight = xAxisMinHeight  + (nHeight - xAxisMinHeight)  % this.options.heatmap.buckets;
      this.options.xRangePad = this.options.heatmap.x.length ? nWidth / (this.options.heatmap.x.length * 2) : 0;
      this.size = {width: nWidth, height: nHeight };
      this.cdRef.detectChanges();
  }

  handleEditResize(e) {
    this.isEditContainerResized = true;
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

  timeseriesTickListener(event: any) {

    const widgetOptions = this.options;

    if (event.action === 'openLegend') {

        // open the infoIsland with TimeseriesLegend
        const payload: any = {
            portalDef: {
                type: 'component',
                name: 'HeatmapBucketDetailComponent'
            },
            data: {
                tickData: event.tickData
            },
            options: {
                title: 'Timeseries Legend',
                height: 300,
                positionStrategy: 'connected'
            }
        };

        if ( this.mode === 'view' ) {
            // this goes to widgetLoader
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
                width: pos.width,
                // positionStrategy: 'connected',
                height: height });
        }
    }

    if (event.action === 'tickDataChange') {
        // update tickData from mouseover
        // this goes to TimeseriesLegend
        const payload: any = {
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

