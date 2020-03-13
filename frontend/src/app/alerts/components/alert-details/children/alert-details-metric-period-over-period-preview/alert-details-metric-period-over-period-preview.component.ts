// tslint:disable:max-line-length
import { Component, OnInit, Input, HostBinding, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import * as deepEqual from 'fast-deep-equal';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { Subscription } from 'rxjs';
import { InfoIslandService } from '../../../../../shared/modules/info-island/services/info-island.service';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'alert-details-metric-period-over-period-preview',
  templateUrl: './alert-details-metric-period-over-period-preview.component.html',
  styleUrls: []
})
export class AlertDetailsMetricPeriodOverPeriodPreviewComponent implements OnInit, OnChanges, OnDestroy {
  @HostBinding('class.period-over-period-preview') private _hostClass = true;
  @ViewChild('queryPreview') queryPreview: ElementRef;

  constructor(
    private interCom: IntercomService,
    private infoIslandService: InfoIslandService,
    private cdRef: ChangeDetectorRef,
  ) { }

  @Input('chartData')
  set chartData(value: any) {
    this._chartData = value;
    this.observedIndex = -1;
    if (this.options && this.options.series) {
      this.observedOptions = {...this.getObservedOptions()};
      this.observedData = {... this.getObservedData()};
    }
  }
  get chartData(): any {
    return this._chartData;
  }

  @Input('nQueryDataLoading')
  set nQueryDataLoading(value: any) {
    this._nQueryDataLoading = value;
  }

  get nQueryDataLoading(): any {
    return this._nQueryDataLoading;
  }

  @Input() size;
  @Input() options;

  @Input('thresholdConfig')
  set thresholdConfig(value: any) {
    this._thresholdConfig = value;
    if (this.observedIndex >= 0 && this.thresholdConfig && this.thresholdConfig.periodOverPeriod && this.thresholdData) {
      this.thresholdData = this.getThresholdData(this.chartData.ts, this.observedIndex);
    }
  }

  get thresholdConfig(): any {
    return this._thresholdConfig;
  }

  _chartData: any = {};
  _thresholdConfig: any = {};
  _nQueryDataLoading: number = 0;
  thresholdData: any = {};
  observedData: any = {};
  observedOptions: any = {};
  thresholdOptions: any = {};
  observedIndex = -1;
  observedIndexToChartIndex = {};

  // zoom out data
  chartDataZoomedOut: any = {};
  thresholdDataZoomedOut: any = {};

  // Island Legend
  private subscription: Subscription = new Subscription();
  id = 'EventAlert';
  tsLegendOptions: any = {
    open: false,
    trackMouse: true,
    showLogscaleToggle: false
  };

  ngOnInit() {
      this.subscription.add(this.interCom.responseGet().subscribe((message: IMessage) => {
        // console.log('===>>> WIDGET LOADER INTERCOM <<<===', message);
        if (message.action && message.id === this.id) {
          switch (message.action) {
            case 'tsLegendToggleSeries':
              this.tsLegendToggleChartSeries(message.payload.batch, message.payload.visible, message.payload.multigraph);
              break;
            case 'InfoIslandClosed':
              this.tsLegendOptions.open = false;
              break;
            default:
              break;
          }
        }
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nQueryDataLoading && changes.nQueryDataLoading.currentValue) { // loading data
      this.observedIndex = -1;
      this.infoIslandService.closeIsland();
    } else if (changes.chartData && changes.nQueryDataLoading && changes.nQueryDataLoading.currentValue === 0) { // new data
        this.chartDataZoomedOut = {};
        this.thresholdDataZoomedOut = {};
        this.infoIslandService.closeIsland();
      } else if (changes.chartData) { // toggled different metric
        this.infoIslandService.closeIsland();
      }

    this.reloadPreview();
  }

  extractZoomedTimeseries(zConfig, data) {
    const n = data.ts.length;
    const startTime = new Date(data.ts[0][0]).getTime() / 1000;
    const endTime = new Date(data.ts[n - 1][0]).getTime() / 1000;
    zConfig.start = Math.floor(zConfig.start) <= startTime ? -1 : Math.floor(zConfig.start);
    zConfig.end = Math.ceil(zConfig.end) >= endTime ? -1 : Math.floor(zConfig.end);

    // extract out in-range timeseries
    const zoomedTS = [];
    for (const ts of data.ts) {
      if (ts[0].getTime() / 1000 > zConfig.start && ts[0].getTime() / 1000 < zConfig.end) {
        zoomedTS.push(ts);
      }
    }

    return {ts: zoomedTS};
  }

   isChartDataZoomedOutEmpty() {
    return Object.entries(this.chartDataZoomedOut).length === 0;
  }

  isThresholdDataZoomedOutEmpty() {
    return Object.entries(this.thresholdDataZoomedOut).length === 0;
  }

  handleZoomQuery(zConfig) {
    const n = this.chartData.ts.length;
    if (zConfig.isZoomed && n > 0) {  // zoomed in
      // cache zoomed-out data
      if (this.isChartDataZoomedOutEmpty()) {
        this.chartDataZoomedOut = {...this.chartData};
      }
      // get zoome-in data
      this.chartData = this.extractZoomedTimeseries(zConfig, this.chartData);
    } else if (!this.isChartDataZoomedOutEmpty()) {  // zoomed out
      this.chartData = {...this.chartDataZoomedOut};
      this.chartDataZoomedOut = {};
    }
  }

  handleZoomThreshold(zConfig) {
    const n = this.thresholdData.ts.length;
    if (zConfig.isZoomed && n > 0) {  // zoomed in
      // cache zoomed-out data
      if (this.isChartDataZoomedOutEmpty()) {
        this.thresholdDataZoomedOut = {...this.thresholdData};
      }
      // get zoome-in data
      this.thresholdData = this.extractZoomedTimeseries(zConfig, this.thresholdData);
    } else if (!this.isThresholdDataZoomedOutEmpty()) {  // zoomed out
      this.thresholdData = {...this.thresholdDataZoomedOut};
      this.thresholdDataZoomedOut = {};
    }
  }

  reloadPreview() {
    // if chartData has only 1 line and prediction, select it
    if (this.chartData && this.chartData.ts && this.chartData.ts[0] && this.chartData.ts[0].length === 3 && this.nQueryDataLoading === 0) {
      this.timeSeriesClicked({timeSeries: '1'});
    } else if (this.observedIndex !== -1) {
      this.timeSeriesClicked({timeSeries: this.observedIndex.toString()});
    }
  }

  timeSeriesClicked(e) {
    this.observedIndex = parseInt(e.timeSeries, 10);

    if (this.observedIndex !== -1) {
      this.thresholdOptions = {...this.options};
      this.thresholdOptions.labels = ['x', '1', '2', '3', '4', '5', '6'];
      this.thresholdOptions.thresholds = [];
      this.thresholdOptions.visibility = ['true', 'true', 'true', 'true', 'true', 'true', 'true'];
      this.thresholdOptions.series = this.getThresholdSeriesOptions(this.options.series[this.observedIndexToChartIndex[this.observedIndex]]);

      if (this.isChartDataZoomedOutEmpty()) {
        this.thresholdData = this.getThresholdData(this.chartData.ts, this.observedIndex);
      } else {
        this.thresholdData = this.getThresholdData(this.chartDataZoomedOut.ts, this.observedIndex);
      }
    }
  }

  getThresholdSeriesOptions(selectedTimeSeriesOption) {
    const series = {};
    const baseOption = {...selectedTimeSeriesOption};

    series[1] = {...selectedTimeSeriesOption};
    series[2] = this.setLabelAndColor(baseOption, 'Expected Value', '#000000');
    series[3] = this.setLabelAndColor(baseOption, 'Upper Bad Threshold', '#ff0000', 'dashed');
    series[4] = this.setLabelAndColor(baseOption, 'Upper Warning Threshold', '#ffa500', 'dashed');
    series[5] = this.setLabelAndColor(baseOption, 'Lower Warning Threshold', '#ffa500', 'dashed');
    series[6] = this.setLabelAndColor(baseOption, 'Lower Bad Threshold', '#ff0000', 'dashed');
    return series;
  }

  setLabelAndColor(option, label: string, color: string, style: string = '') {
    const optionCopy = {...option};

    if (style === 'light') {
      optionCopy.strokePattern = [1, 3];
    }
    if (style === 'dashed') {
      optionCopy.strokePattern = [4, 4];
    }
    if (style === 'dotted') {
      optionCopy.strokePattern = [2, 3];
    }

    optionCopy.tags = {metric: label};
    optionCopy.label = label;
    optionCopy.metric = label;
    optionCopy.hash = label;
    optionCopy.color = color;
    return optionCopy;
  }

  getObservedOptions() {
    this.observedIndexToChartIndex = {};
    const observedOptions = JSON.parse(JSON.stringify(this.options));
    const visibilityHash = {};
    const visibility = [];
    const labels = ['x'];
    const series = {};
    const originalSeries = this.options.series;
    const _series = Object.keys(originalSeries);

    let index = 1;
    for (const serie of _series) {
      if (!originalSeries[serie].metric.endsWith('prediction') && originalSeries[serie].tags['_anomalyModel'] !== 'OlympicScoring') {
        visibilityHash[originalSeries[serie].hash] = true;
        visibility.push(true);
        labels.push(String(index));
        series[String(index)] = this.options.series[serie];
        this.observedIndexToChartIndex[index] = parseInt(serie, 10);
        index++;
      }
    }

    observedOptions.visibility = visibility;
    observedOptions.visibilityHash = visibilityHash;
    observedOptions.labels = labels;
    observedOptions.series = series;

    return observedOptions;
  }

  getObservedData() {
    const originalSeries = this.options.series;
    const _series = Object.keys(originalSeries);
    const indexesToInclude = [];
    indexesToInclude.push('0');

    let index = 1;
    // find indexes of observed data
    for (const serie of _series) {
      if (!originalSeries[serie].metric.endsWith('prediction') && originalSeries[serie].tags['_anomalyModel'] !== 'OlympicScoring') {
        indexesToInclude.push(String(index));
      }
      index++;
    }

    const data = [];
    for (const timePoints of this.chartData.ts) {
      const timePointsArray = [];
      for (const i in timePoints) {
        if (indexesToInclude.includes(String(i))) {
          timePointsArray.push(timePoints[i]);
        }
      }
      data.push(timePointsArray);
    }
    return {ts: data};
  }

  getThresholdData(allTimeSeries, timeSeriesIndex: number) {
    const data = [];
    if (this.thresholdConfig && this.thresholdConfig.periodOverPeriod) {
      const selectedTimeseries: any[] = this.getTimeSeriesFromIndex(allTimeSeries, this.observedIndexToChartIndex[timeSeriesIndex]);
      const expectedTimeSeries: any[] = this.getExpectedTimeSeries(allTimeSeries, this.observedIndexToChartIndex[timeSeriesIndex], this.options);
      const upperBadTimeSeries: any[] = this.getThresholdTimeSeries(expectedTimeSeries, parseFloat(this.thresholdConfig.periodOverPeriod.badUpperThreshold), this.thresholdConfig.periodOverPeriod.upperThresholdType, 'above');
      const upperWarningTimeSeries: any[] = this.getThresholdTimeSeries(expectedTimeSeries, parseFloat(this.thresholdConfig.periodOverPeriod.warnUpperThreshold), this.thresholdConfig.periodOverPeriod.upperThresholdType, 'above');
      const lowerWarningTimeSeries: any[] = this.getThresholdTimeSeries(expectedTimeSeries, parseFloat(this.thresholdConfig.periodOverPeriod.warnLowerThreshold), this.thresholdConfig.periodOverPeriod.lowerThresholdType, 'below');
      const lowerBadTimeSeries: any[] = this.getThresholdTimeSeries(expectedTimeSeries, parseFloat(this.thresholdConfig.periodOverPeriod.badLowerThreshold), this.thresholdConfig.periodOverPeriod.lowerThresholdType, 'below');

      let index = 0;
      for (const timePoints of allTimeSeries) {
        const timePointsArray = [];
        // add time, selected ts, expected ts, and threshold ts
        timePointsArray.push(timePoints[0]);
        timePointsArray.push(selectedTimeseries[index]);
        timePointsArray.push(expectedTimeSeries[index]);
        timePointsArray.push(upperBadTimeSeries[index]);
        timePointsArray.push(upperWarningTimeSeries[index]);
        timePointsArray.push(lowerWarningTimeSeries[index]);
        timePointsArray.push(lowerBadTimeSeries[index]);

        data.push(timePointsArray);
        index++;
      }
    }
    return {ts: data};
  }

  getTimeSeriesFromIndex(timeseries, timeseriesIndex: number) {
    const extractedTimeSeries: any[] = [];
    for (const timePoints of timeseries) {
      extractedTimeSeries.push(timePoints[timeseriesIndex]);
    }
    return extractedTimeSeries;
  }

  getExpectedTimeSeries(allTimeSeries, timeseriesIndex: number, options) {
    // get metric name from index
    let metricName = '';
    let metricTags = {};
    const _series = Object.keys(options.series);
    for (const serie of _series) {
      if (parseInt(serie, 10) === timeseriesIndex) {
        metricName = options.series[serie].metric;
        metricTags = {... options.series[serie].tags};
        metricTags['metric'] = metricName + '.prediction';
        metricTags['_anomalyModel'] = 'OlympicScoring';
        break;
      }
    }

    // get index of prediction metric name
    let predictedIndex = -1;
    for (const serie of _series) {
      if (deepEqual(options.series[serie].tags, metricTags) && parseInt(serie, 10) !== timeseriesIndex) {
        predictedIndex = parseInt(serie, 10);
        break;
      }
    }

    // expressions have different naming convention
    if (predictedIndex === -1) {
      metricTags['metric'] = metricName;
      for (const serie of _series) {
        if (deepEqual(options.series[serie].tags, metricTags) && parseInt(serie, 10) !== timeseriesIndex) {
          predictedIndex = parseInt(serie, 10);
          break;
        }
      }
    }

    return this.getTimeSeriesFromIndex(allTimeSeries, predictedIndex);
  }

  getThresholdTimeSeries(timeseries: number[], thresholdValue: number, thresholdType: string, thresholdDirection: string): number[] {
    const thresholdTimeSeries: any[] = [];
    for (const dataPoint of timeseries) {
      if (thresholdType === 'value' && thresholdDirection === 'above') {
        thresholdTimeSeries.push(dataPoint + thresholdValue);
      } else if (thresholdType === 'value' && thresholdDirection === 'below') {
        thresholdTimeSeries.push(dataPoint - thresholdValue);
      } else if (thresholdType === 'percent' && thresholdDirection === 'above') {
        thresholdTimeSeries.push( dataPoint * (1 + thresholdValue / 100));
      } else if (thresholdType === 'percent' && thresholdDirection === 'below') {
        thresholdTimeSeries.push( dataPoint * (1 - thresholdValue / 100));
      } else {
        thresholdTimeSeries.push(NaN);
      }
    }
    return thresholdTimeSeries;
  }

  timeseriesTickListener(yIndex: number, xIndex: number, yKey: any, xKey: any, event: any) {
    if (event.action === 'openLegend' && !this.tsLegendOptions.open) {
      this.tsLegendOptions.open = true;
      // open the infoIsland with TimeseriesLegend
      const payload: any = {
          portalDef: {
              type: 'component',
              name: 'TimeseriesLegendComponent'
          },
          data: {
              options: this.observedOptions,
              queries: {},
              settings: {},
              tsTickData: event.tickData,
              showLogscaleToggle: false
          },
          options: {
              title: 'Timeseries Legend',
              height: 250,
              positionStrategy: 'connected',
              outerWrap: '.alerts-container-component',
              originId: this.id,
          }
      };

      const dataToInject = {
        widget: {},
        originId: this.id,
        data: payload.data
      };

      const portalDef = payload.portalDef;
      let componentOrTemplateRef;
      const overlayOriginRef = this.queryPreview.nativeElement;
      const compRef = (portalDef.name) ? this.infoIslandService.getComponentToLoad(portalDef.name) : portalDef.reference;
      componentOrTemplateRef = new ComponentPortal(compRef, null, this.infoIslandService.createInjector(dataToInject));

      this.infoIslandService.openIsland(
        overlayOriginRef,
        componentOrTemplateRef,
        payload.options
      );

    } else if (event.action === 'openLegend' && !this.tsLegendOptions.open || event.action === 'tickDataChange') {

      const payload: any = {
        tickData: event.tickData
      };
      if (event.trackMouse) {
          payload.trackMouse = event.trackMouse;
      }
      this.interCom.requestSend({
          id: this.id,
          action: 'tsTickDataChange',
          payload: payload
      });
    }
  }

  tsLegendToggleChartSeries(batch: number[], visible: boolean, multigraph: any = false) {
    // update visibility on batch items
    for (let i = 0; i < batch.length; i += 1) {
        const srcIndex = batch[i];
        this.setSeriesVisibilityConfig(srcIndex, visible);
    }
    this.cdRef.detectChanges();
    // interCom updated options
    this.interCom.requestSend({
        action: 'tsLegendWidgetOptionsUpdate',
        id: this.id,
        payload: { options: this.observedOptions}
    });
  }

  setSeriesVisibilityConfig(index: number, visibility: boolean) {
    const options = this.observedOptions;
    this.observedOptions.visibility[index] = visibility;
    this.observedOptions.visibilityHash[options.series[index + 1].hash] = options.visibility[index];
    this.observedOptions = {... this.observedOptions};
  }

  ngOnDestroy() {
    this.infoIslandService.closeIsland();
  }
}
