import {
  Component, OnInit, HostBinding, Input,
  OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, AfterViewInit
} from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { DatatranformerService } from '../../../../../core/services/datatranformer.service';
import { UtilsService } from '../../../../../core/services/utils.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';
import { Subscription } from 'rxjs';
import { WidgetModel, Axis } from '../../../../../dashboard/state/widgets.state';
import { IDygraphOptions } from '../../../dygraphs/IDygraphOptions';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../sharedcomponents/components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from '../../../sharedcomponents/components/debug-dialog/debug-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { ElementQueries, ResizeSensor} from 'css-element-queries';
import { debounceTime } from 'rxjs/operators';
import { heatmapPlotter } from '../../../../dygraphs/plotters';
import { environment } from '../../../../../../environments/environment';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'heatmap-widget',
  templateUrl: './heatmap-widget.component.html',
  styleUrls: ['./heatmap-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HeatmapWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.widget-panel-content') private _hostClass = true;
  @HostBinding('class.heatmap-widget') private _componentClass = true;

  @Input() editMode: boolean;
  @Input() widget: WidgetModel;

  @ViewChild('widgetOutputContainer') private widgetOutputContainer: ElementRef;
  @ViewChild('widgetTitle') private widgetTitle: ElementRef;
  @ViewChild('widgetoutput') private widgetOutputElement: ElementRef;
  @ViewChild('graphLegend') private dygraphLegend: ElementRef;
  @ViewChild('dygraph') private dygraph: ElementRef;

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

  constructor(
      private cdRef: ChangeDetectorRef,
      private interCom: IntercomService,
      public dialog: MatDialog,
      private dataTransformer: DatatranformerService,
      private util: UtilsService,
      private elRef: ElementRef,
      private unit: UnitConverterService
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
      // subscribe to event stream
      this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
          switch (message.action) {
              case 'TimeChanged':
              case 'reQueryData':
              case 'ZoomDateRange':
                  this.refreshData();
                  break;
              case 'TimezoneChanged':
                  this.setTimezone(message.payload.zone);
                  this.options = { ...this.options };
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
                          this.data.ts = this.dataTransformer.yamasToHeatmap(this.widget, this.options, this.data.ts, rawdata);
                          this.data = { ...this.data };
                          if (environment.debugLevel.toUpperCase() === 'TRACE' ||
                            environment.debugLevel.toUpperCase() == 'DEBUG' ||
                            environment.debugLevel.toUpperCase() == 'INFO') {
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
              }
          }
      });
      // when the widget first loaded in dashboard, we request to get data
      // when in edit mode first time, we request to get cached raw data.
      setTimeout(() => this.refreshData(this.editMode ? false : true), 0);
      this.setOptions();
  }

  ngAfterViewInit() {
      ElementQueries.listen();
      ElementQueries.init();
      const initSize = {
          width: this.widgetOutputElement.nativeElement.clientWidth,
          height: this.widgetOutputElement.nativeElement.clientHeight
      };
      this.newSize$ = new BehaviorSubject(initSize);

      this.newSizeSub = this.newSize$.subscribe(size => {
          this.setSize();
          // this.newSize = size;
      });
      const resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
           const newSize = {
              width: this.widgetOutputElement.nativeElement.clientWidth,
              height: this.widgetOutputElement.nativeElement.clientHeight
          };
          this.newSize$.next(newSize);
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
       const nativeEl = (this.editMode) ?
          this.widgetOutputElement.nativeElement.parentElement : this.widgetOutputElement.nativeElement.closest('.mat-card-content');

       const newSize = nativeEl.getBoundingClientRect();
      // let newSize = outputSize;
      let nWidth, nHeight, padding;


      const widthOffset = 0;
      const heightOffset = 0;


      if (this.editMode) {
          let titleSize = {width: 0, height: 0};
          if (this.widgetTitle) {
              titleSize = this.widgetTitle.nativeElement.getBoundingClientRect();
          }
          padding = 8; // 8px top and bottom
          nHeight = newSize.height - heightOffset - titleSize.height - (padding * 2);
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
    // console.log('TIMESERIES TICK LISTENER', { widget: this.widget, event});

    if (this.editMode === true) {
        return;
    }

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

        // this goes to widgetLoader
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'InfoIslandOpen',
            payload: payload
        });
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

  ngOnDestroy() {
      this.listenSub.unsubscribe();
      this.newSizeSub.unsubscribe();
      this.doRefreshDataSub.unsubscribe();
  }

}

