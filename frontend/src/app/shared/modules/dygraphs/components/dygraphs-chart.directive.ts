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
    OnInit, OnChanges, OnDestroy, Directive,
    Input, Output, EventEmitter, ElementRef, SimpleChanges, Renderer2, HostListener
} from '@angular/core';
import { IDygraphOptions } from '../IDygraphOptions';
import Dygraph from 'dygraphs/src-es5/dygraph.js';
import DygraphInteraction from '../../../dygraphs/misc/dygraph-interaction-model';
import { UnitConverterService } from '../../../../core/services/unit-converter.service';
import ThresholdsPlugin from '../../../dygraph-threshold-plugin/src/index';
import * as moment from 'moment';
import * as d3 from 'd3';
import { TooltipDataService } from '../../universal-data-tooltip/services/tooltip-data.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[dygraphsChart]'
})
export class DygraphsChartDirective implements OnInit, OnChanges, OnDestroy {

    @Input() data: any;
    @Input() options: IDygraphOptions;
    @Input() chartType: string;
    @Input() size: any;
    @Input() eventBuckets: any[];
    @Input() showEvents: boolean;
    @Input() multigraph: boolean;
    @Input() timeseriesLegend: any = {};
    @Input() widgetId: any;
    @Output() zoomed = new EventEmitter;
    @Output() dateWindow = new EventEmitter<any>();
    @Output() currentTickEvent = new EventEmitter<any>();
    @Output() lastTimeseriesHighlighted = new EventEmitter<any>();

    private startTime = 0; // for icon placement
    private _g: any;
    private gDimension: any;
    public dataLoading: boolean;
    private lastSeriesHighlighted: number = -1;
    public labelsDiv: any;
    public firstTickHighlight = false;

    private legendMouseoverTimeout: any;

    constructor(
        private element: ElementRef,
        private uConverter: UnitConverterService,
        private ttDataSvc: TooltipDataService
    ) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {

        // NOTE:
        // If changing to custom row/column after splitting metric by tag, it would cause the dygraph option.plugins error
        // the options.plugins originally has one item that is a function
        // but after the change to custom, the options.plugins item changes to null, set it to empty array
        if (this.options.plugins && this.options.plugins.length === 1 && this.options.plugins[0] === null) {
            this.options.plugins = [];
        }

        // by default the labelsDiv is an empty object as defined any in interface
        // enforce to init labelsDiv if not there
        if (!(this.options.labelsDiv && Object.keys(this.options.labelsDiv).length > 0)) {
            let parent = this.element.nativeElement.closest('.widget-output');
            if (!parent) {
                // no widget-output (probably not a dashboard widget)
                // so lets check for graph-output in alerts
                parent = this.element.nativeElement.closest('.graph-output');
            }

            // still create an element, but not in document, because dygraph legend plugin still looks for it
            // TODO: create a custom dygraph legend/label plugin that will eliminate the need for this
            const fakeLabelsDiv = document.createElement('div');
            fakeLabelsDiv.classList.add('dygraph-legend');
            this.options.labelsDiv = fakeLabelsDiv;
        }

        /* part of coming pr change*/
        if (!this.options.hasOwnProperty('hideOverlayOnMouseOut')) {
            this.options.hideOverlayOnMouseOut = false;
        }

        const self = this;
        const mouseover = function (e, x, points, row, seriesName) {
            // TODO: check if this can be removed
            if (!self.firstTickHighlight) {
                self.firstTickHighlight = true;
            }

            this.lastSeriesHighlighted = seriesName;

            //***************************************
            //**  COMMON VARIABLES                  *
            //***************************************
            const options = this.user_attrs_;
            const series = options.series;

            //***************************************
            //**  BELOW IS FOR TOOLTIP STUFF        *
            //***************************************
            const plotArea = this.layout_.getPlotArea();
            const graphDiv = this.graphDiv;
            const graphDivCoords = graphDiv.getBoundingClientRect();
            const offsetCheck = {
                xMin: graphDivCoords.left + plotArea.x,
                xMax: graphDivCoords.right,
                yMin: graphDivCoords.top,
                yMax: graphDivCoords.top + plotArea.h
            };

            // highlighted series
            const highlightSeries = this.getHighlightSeries();

            // series config for the current point
            const pvSeries = series[seriesName];
            // series options for the current point
            const pvSeriesOpts = this.getPropertiesForSeries(seriesName);

            // check is highlight/mousemovement is within plotted area
            if (
                (e.x > offsetCheck.xMin && e.x < offsetCheck.xMax) &&
                (e.y > offsetCheck.yMin && e.y < offsetCheck.yMax) &&
                (pvSeriesOpts.visible || highlightSeries === seriesName)
            ) {

                // find index in points that matches series
                const pvIdx = points.findIndex(item => item.name === seriesName + '');
                // get point values
                const pv = points[pvIdx];

                const axis = pvSeries.axis;
                const format = options.axes[axis].tickFormat;
                const precision = format.precision ? format.precision : 2;
                const dunit = self.uConverter.getNormalizedUnit(pv.yval, format);

                const label = pvSeries.label;
                const tags = pvSeries.tags;

                let ttData: any = {
                    multigraph: self.multigraph
                };

                ttData.timestamp = pv.xval;
                ttData.timestampFormatted =
                    options.labelsUTC ?
                        moment(pv.xval).utc().format('YYYY/MM/DD HH:mm') :
                        moment(pv.xval).format('YYYY/MM/DD HH:mm');

                ttData.color = pvSeries.color;
                ttData.value = pv.yval;
                if (isNaN(pv.yval)) {
                    // don't format a NaN value
                    ttData.valueFormatted = pv.yval;
                } else {
                    ttData.valueFormatted = self.uConverter.convert(pv.yval, format.unit, dunit, { unit: format.unit, precision: precision });
                }
                const tempLabel = (tags.metric !== label) ? label : tags.metric;
                ttData.metric = tempLabel.indexOf(tags.metric) > -1 ? tags.metric : tempLabel;
                // ttData.metric = (tags.metric !== label) ? label : tags.metric;
                ttData.tags = [];

                for (const k in tags) {
                    if (k !== 'metric') {
                        ttData.tags.push({key: k, value: tags[k]});
                    }
                }

                self.ttDataSvc._ttDataPut({data: ttData, position: {x: e.x, y: e.y, plotArea}});

            } else {
                self.ttDataSvc._ttDataPut(false);
            }

            //***************************************
            //**  BELOW IS FOR ISLAND LEGEND STUFF  *
            //***************************************

            if (self.timeseriesLegend.open && self.timeseriesLegend.trackMouse) {
                if (this.legendMouseoverTimeout) {
                    clearTimeout(this.legendMouseoverTimeout);
                }

                this.legendMouseoverTimeout = setTimeout(() => {

                    // raw data row index
                    // need this because we want to populate the non-visible lines (if any)
                    // because 'points' only contains the visible points, but we still want data for rest of dataset
                    const rawRefIndex = this.rawData_.findIndex((d: any[]) => d[0] === x);

                    // format tick data output
                    const tickDataOutput = {
                        timestamp: x,
                        when: options.labelsUTC ? moment(x).utc().format('YYYY/MM/DD HH:mm') : moment(x).format('YYYY/MM/DD HH:mm'),
                        series: []
                    };

                    // format series data for timeSeriesLegend
                    for (let i = 0; i < Object.keys(series).length; i++) {
                        const seriesIndex = i + 1;
                        const seriesData = series[seriesIndex];
                        const data: any = {
                            series: {...seriesData}
                        };
                        // point data
                        const pointIndex = points.findIndex((p: any) => p.name === seriesIndex.toString());
                        // point exists, so lets use it
                        if (pointIndex !== -1) {
                            data.data = {...points[pointIndex]};
                        } else {
                            // this must be hidden line, so pull data from rawData
                            const rawPointData = this.rawData_[rawRefIndex][seriesIndex];
                            data.data = {yval: rawPointData};
                        }
                        // format the value
                        const axis = series[seriesIndex].axis;
                        const format = options.axes[axis].tickFormat;
                        const precision = format.precision ? format.precision : 2;
                        const dunit = self.uConverter.getNormalizedUnit(data.data.yval, format);
                        if (isNaN(data.data.yval)) {
                            // don't format a NaN value
                            data.formattedValue = data.data.yval;
                        } else {
                            data.formattedValue = self.uConverter.convert(data.data.yval, format.unit, dunit, { unit: format.unit, precision: precision });
                        }
                        tickDataOutput.series.push(data);
                    }

                    self.currentTickEvent.emit({
                        action: 'tickDataChange',
                        tickData: tickDataOutput
                    });

                }, 100);
            }

        };

        const clickCallback = function(e, x, points) {

            // check if tsLegend is configured
            if (Object.keys(self.timeseriesLegend).length > 0) {

                const options = this.user_attrs_;
                const series = options.series;

                // raw data row index
                // need this because we want to populate the non-visible lines (if any)
                // because 'points' only contains the visible points, but we still want data for rest of dataset
                const rawRefIndex = this.rawData_.findIndex((d: any[]) => d[0] === x);

                // format tick data output
                const tickDataOutput = {
                    timestamp: x,
                    when: options.labelsUTC ? moment(x).utc().format('YYYY/MM/DD HH:mm') : moment(x).format('YYYY/MM/DD HH:mm'),
                    series: []
                };

                // format series data for timeSeriesLegend
                for (let i = 0; i < Object.keys(series).length; i++) {
                    const seriesIndex = i + 1;
                    const seriesData = series[seriesIndex];
                    const data: any = {
                        series: {...seriesData}
                    };
                    // point data
                    const pointIndex = points.findIndex((p: any) => p.name === seriesIndex.toString());
                    // point exists, so lets use it
                    if (pointIndex !== -1) {
                        data.data = {...points[pointIndex]};
                    } else {
                        // this must be hidden line, so pull data from rawData
                        const rawPointData = this.rawData_[rawRefIndex][seriesIndex];
                        data.data = {yval: rawPointData};
                    }
                    // format the value
                    const axis = series[seriesIndex].axis;
                    const format = options.axes[axis].tickFormat;
                    const precision = format.precision ? format.precision : 2;
                    const dunit = self.uConverter.getNormalizedUnit(data.data.yval, format);
                    if (isNaN(data.data.yval)) {
                        // don't format a NaN value
                        data.formattedValue = data.data.yval;
                    } else {
                        data.formattedValue = self.uConverter.convert(data.data.yval, format.unit, dunit, { unit: format.unit, precision: precision });
                    }
                    tickDataOutput.series.push(data);
                }

                if (!self.timeseriesLegend.open) {
                    self.currentTickEvent.emit({
                        action: 'openLegend',
                        tickData: tickDataOutput
                    });
                } else {
                    self.currentTickEvent.emit({
                        action: 'tickDataChange',
                        tickData: tickDataOutput,
                        trackMouse: {
                            checked: false
                        }
                    });
                }
            }

            // emit last time series that was highlighted
            self.lastTimeseriesHighlighted.emit({ timeSeries: this.lastSeriesHighlighted });

        };

        // needed to capture start and end times
        const drawCallback = (dygraph: any) => {
            if (dygraph && dygraph.dateWindow_) {
                this.dateWindow.emit({ startTime: dygraph.dateWindow_[0], endTime: dygraph.dateWindow_[1] });
                this.startTime = dygraph.dateWindow_[0];
            } else if (dygraph && dygraph.rawData_) { // TODO: change - what if we do not have latest data?
                this.dateWindow.emit({ startTime: dygraph.rawData_[0][0], endTime: dygraph.rawData_[dygraph.rawData_.length - 1][0] });
                this.startTime = dygraph.rawData_[0][0];
            }
        };

        const underlayCallback = (canvas, area, g) => {
            if (this.eventBuckets && this.showEvents) {
                for (const bucket of this.eventBuckets) {
                    let coords;
                    if (this.startTime === bucket.startTime) { // first icon on chart placed at end time of bucket
                        coords = g.toDomCoords(bucket.endTime, 0);
                    } else { // all others placed start + width (so last icon not off the chart)
                        coords = g.toDomCoords(bucket.startTime + bucket.width, 0);
                    }

                    // splitX and splitY are the coordinates on the canvas
                    const splitX = coords[0];

                    // The drawing area doesn't start at (0, 0), it starts at (area.x, area.y).
                    // That's why we subtract them from splitX and splitY. This gives us the
                    // actual distance from the upper-left hand corder of the graph itself.
                    // var leftSideWidth = splitX - area.x;
                    // var topHeight = splitY - area.y;

                    canvas.fillStyle = '#44BCB7';
                    canvas.fillRect(splitX - 1, area.y, 2, this.size.height);
                }
            }
        };

        const tickFormatter = function (value, gran, opts) {
            const format = opts('tickFormat');
            const dunit = self.uConverter.getNormalizedUnit(value, format);
            return self.uConverter.convert(value, format.unit, dunit, format);
        };

        const valueFormatter = function (value, opts) {
            const format = opts('tickFormat');
            const precision = format.precision ? format.precision : 2;
            const dunit = self.uConverter.getNormalizedUnit(value, format);
            return self.uConverter.convert(value, format.unit, dunit, { unit: format.unit, precision: precision });
        };

        // heatmap legend
        const setHeatmapLegend = function (event, g, x, bucket) {

            /* NEW */
            let ttData: any = {
                multigraph: (self.multigraph === undefined) ? false : self.multigraph
            };

            const plotArea = g.layout_.getPlotArea();

            const options = g.user_attrs_;
            const tooltipData = options.series[bucket] && options.series[bucket][x] ? options.series[bucket][x] : [];
            const format = options.axes.y.tickFormat;
            const precision = format.precision ? format.precision : 2;

            const yScale = d3.scaleQuantize()
                .domain(options.axes.y.valueRange)
                .range(Array.from(Array(options.heatmap.buckets), (x, index) => (index + 1)));
            const range: any = yScale.invertExtent(bucket);

            ttData.timestamp = x;
            // tslint:disable:max-line-length
            ttData.timestampFormatted = options.labelsUTC ? moment(x).utc().format('YYYY/MM/DD HH:mm') : moment(x).format('YYYY/MM/DD HH:mm');

            const percentage = self.uConverter.convert((tooltipData.length / options.heatmap.nseries) * 100, '', '', { unit: '', precision: precision });
            ttData.affectedSeries = percentage + '% of Series, ' + tooltipData.length + ' of ' + options.heatmap.nseries;
            ttData.bucketRange = [range[0], range[1]];
            // tslint:disable:max-line-length
            ttData.color = !Array.isArray(options.heatmap.color) ? options.heatmap.color : options.heatmap.colorValueMap[tooltipData.length];
            ttData.percentage = percentage; // use this to calculate opacity of heatmap color;

            ttData.bucketValues = [];
            const n = tooltipData.length < 5 ? tooltipData.length : 5;
            for (let i = 0; i < n; i++) {
                const dunit = self.uConverter.getNormalizedUnit(tooltipData[i].v, format);
                const val = self.uConverter.convert(tooltipData[i].v, format.unit, dunit, { unit: format.unit, precision: precision });

                let tagData: any = {label: tooltipData[i].label, value: val, tags: tooltipData[i].tags };
                ttData.bucketValues.push(tagData);
            }

            // send to tooltip data service
            self.ttDataSvc._ttDataPut({data: ttData, position: {x: event.x, y: event.y, plotArea}});
        };

        if (!changes) {
            return;
        } else {
            let needsResize = changes.size ? true : false;
            if (this.options.axes) {
                for (const k of Object.keys(this.options.axes)) {
                    const axis = this.options.axes[k];
                    // handles the no. of axis labels
                    if ( k === 'y' || k === 'y2' ) {
                        axis.pixelsPerLabel = this.size.height <= 250 ? 6 * Math.ceil(this.size.height / 50) : 50;
                    }
                    if (axis.tickFormat) {
                        axis.axisLabelFormatter = tickFormatter;
                        axis.valueFormatter = valueFormatter;
                    } else {
                        delete axis.axisLabelFormatter;
                        delete axis.valueFormatter;
                    }
                }
            }
            // if new data
            if (( changes.data && changes.data.currentValue || changes.options && changes.options.currentValue) ) {
                this.options.plugins = [ThresholdsPlugin];

                if (this.chartType === 'line') {

                    // for tooltip && island legend
                    this.options.highlightCallback = mouseover;

                    this.options.showLabelsOnHighlight = false;
                    this.options.zoomCallback = function (minDate, maxDate, yRanges) {
                        const n = self.data.ts.length;
                        // we only handle xzoom
                        if (!yRanges && n > 0 ) {
                            const actualStart = new Date(self.data.ts[0][0]).getTime() / 1000;
                            const actualEnd = new Date(self.data.ts[n - 1][0]).getTime() / 1000;
                            // tslint:disable-next-line:max-line-length
                            self.zoomed.emit({ axis: 'x', start: minDate / 1000, end: maxDate / 1000, isZoomed: true, actualStart: actualStart, actualEnd: actualEnd });
                        } else if ( yRanges ) {
                            self.zoomed.emit( { axis: 'y', y: yRanges[0], y2: yRanges[1] });
                        }
                    };
                    this.options.drawCallback = drawCallback;
                    this.options.underlayCallback = underlayCallback;

                    this.options.interactionModel = DygraphInteraction.defaultModel;
                    this.options.interactionModel.dblclick = function (e, g, context) {
                        if (g.user_attrs_.isCustomZoomed) {
                            self.zoomed.emit({ axis: 'x', start: null, end: null, isZoomed: false });
                        } else if (self._g.isZoomed()) { // zooming out (double click)
                            self.zoomed.emit( { axis: 'y', y: null, y2: null });
                            g.axes_.forEach((axis, i) => {
                                const axisKey = i === 0 ? 'y' : 'y2';
                                if (axis.valueRange) {
                                    axis.valueRange = g.user_attrs_.axes[axisKey].valueRange;
                                }
                            });
                            g.drawGraph_();
                        }
                    };

                    if (this.timeseriesLegend) {
                        // detect double click and NOT open the island
                        let clickCount = 0;
                        const handleSingleDoubleClick = function(e, x, points) {
                          if (clickCount === 0) {
                            setTimeout(() => {
                              if (clickCount > 1) {
                                // double click
                              } else {
                                // single click
                                clickCallback.call(this, e, x, points);
                              }
                              clickCount = 0;
                            }, 400); // 400 ms click delay
                          }
                          clickCount += 1;
                        };

                        this.options.clickCallback = handleSingleDoubleClick;

                    }
                } else if (this.chartType === 'heatmap') {
                    this.options.interactionModel = {
                        'mousedown': function (event, g, context) {
                            const xlabels = g.user_attrs_.heatmap.x;
                            if (!xlabels || !xlabels.length) {
                                return;
                            }
                            const plotArea = g.layout_.getPlotArea();
                            const height = plotArea.h / g.user_attrs_.heatmap.buckets;
                            const width = g.layout_.points.length > 1 ? g.layout_.points[0][1].canvasx - g.layout_.points[0][0].canvasx : 0;

                            const xdiff = xlabels[1] - xlabels[0];
                            const xdiffd2 = xdiff / 2;
                            const graphPos = Dygraph.findPos(g.graphDiv);
                            const cx = Dygraph.pageX(event) - graphPos.x;
                            let xv = g.toDataXCoord(Dygraph.pageX(event) - graphPos.x);
                            const d = xv % xdiff;
                            xv = d > xdiffd2 ? xv + (xdiff - d) : xv - d;
                            const cx2 = g.toDomXCoord(xv);

                            const cy = Dygraph.pageY(event) - graphPos.y;

                            if (cx >= plotArea.x && cy <= plotArea.h) {
                                const bucket = g.user_attrs_.heatmap.buckets - (cy - cy % height) / height;
                                const ts = g.toDataXCoord(cx2);
                                const hasData = g.user_attrs_.series[bucket] && g.user_attrs_.series[bucket][ts];

                                if (!self.timeseriesLegend.open) {
                                    self.currentTickEvent.emit({
                                        action: 'openLegend',
                                        tickData: { options: self.options, x: ts, bucket: bucket, data: hasData  }
                                    });
                                } else {
                                    self.currentTickEvent.emit({
                                        action: 'tickDataChange',
                                        tickData: { options: self.options, x: ts, bucket: bucket, data: hasData },
                                    });
                                }

                                const x = cx2 - width / 2;
                                const y = cy - cy % height;


                                g._prevBucketHighlightBucket = { x: x, y: y, w: width, h: height, bucket: bucket };
                            }
                        },
                        'mousemove': function (event, g, context) {
                            const xlabels = g.user_attrs_.heatmap.x;
                            if (!xlabels || !xlabels.length) {
                                return;
                            }
                            const ctx = g.canvas_ctx_;
                            const plotArea = g.layout_.getPlotArea();
                            const height = plotArea.h / g.user_attrs_.heatmap.buckets;
                            const width = g.layout_.points.length > 1 ? g.layout_.points[0][1].canvasx - g.layout_.points[0][0].canvasx : 0;
                            const _prev = g._prevBucketHighlightBucket;
                            const labelsDiv = g.user_attrs_.labelsDiv;

                            const xdiff = xlabels[1] - xlabels[0];
                            const xdiffd2 = xdiff / 2;
                            const graphPos = Dygraph.findPos(g.graphDiv);
                            const cx = Dygraph.pageX(event) - graphPos.x;
                            let xv = g.toDataXCoord(Dygraph.pageX(event) - graphPos.x);
                            const d = xv % xdiff;
                            xv = d > xdiffd2 ? xv + (xdiff - d) : xv - d;
                            const cx2 = g.toDomXCoord(xv);

                            const cy = Dygraph.pageY(event) - graphPos.y;

                            if ( _prev ) {
                                g.clearSelection();
                            }

                            if (cx >= plotArea.x && cy <= plotArea.h) {
                                const bucket = g.user_attrs_.heatmap.buckets - (cy - cy % height) / height;
                                const ts = g.toDataXCoord(cx2);
                                const hasData = g.user_attrs_.series[bucket] && g.user_attrs_.series[bucket][ts];

                                if (labelsDiv) {
                                    labelsDiv.style.display = 'none';
                                }

                                if (hasData) {
                                    setHeatmapLegend(event, g, ts, bucket); // set legend formatter
                                } else {
                                    self.ttDataSvc._ttDataPut(false); // tell tooltip no data
                                }

                                const x = cx2 - width / 2;
                                const y = cy - cy % height;
                                if ( !_prev || _prev.x !== x || _prev.bucket !== bucket ) {
                                    self.currentTickEvent.emit({
                                        action: 'tickDataChange',
                                        tickData: { options: self.options, x: ts, bucket: bucket, data: hasData },
                                    });
                                }
                                // tslint:disable:max-line-length
                                ctx.fillStyle = Array.isArray(g.user_attrs_.heatmap.color) || !hasData ? '#dddddd' : g.user_attrs_.heatmap.color;
                                ctx.fillRect(x, y, width, height);
                                ctx.strokeStyle = 'red';
                                ctx.strokeWidth = 1;
                                ctx.rect(x, 0, width, plotArea.h);
                                ctx.stroke();
                                g._prevBucketHighlightBucket = { x: x, y: y, w: width, h: height, bucket: bucket };
                            } else {
                                self.ttDataSvc._ttDataPut(false); // tell tooltip no data
                                if (labelsDiv) {
                                    labelsDiv.style.display = 'none';
                                }
                            }
                        }
                    };
                }

                if ( this._g ) {
                    this._g.destroy();
                } else {
                    needsResize = false;
                }
                this.options.width = this.size.width;
                this.options.height = this.size.height;
                this._g = new Dygraph(this.element.nativeElement, this.data.ts, this.options);
                window.removeEventListener('mouseout', this._g.mouseOutHandler_, false);
                setTimeout(() => {
                    if ( this.data.ts && this.data.ts.length && this.options.isIslandLegendOpen ) {
                        const ts = this._g.rawData_[0][0];
                            if ( this.chartType === 'line') {
                                clickCallback.call(this._g, {}, ts, []);
                            } else if ( ts ) {
                                this.currentTickEvent.emit({
                                    action: 'openLegend',
                                    tickData: { options: this.options, x: ts, bucket: 1, data: this._g.user_attrs_.series[1] && this._g.user_attrs_.series[1][ts]  }
                                });
                            }
                    }
                });

                if ( this.options.initZoom ) {
                    const opts: any = { axes: {} };
                    if ( this.options.initZoom.y ) {
                        opts.axes.y = this.options.initZoom.y;
                    }
                    if ( this.options.initZoom.y2 ) {
                        opts.axes.y2 = this.options.initZoom.y2;
                    }
                    this._g.updateOptions(opts);
                }
            } else if (this._g && ( changes.eventBuckets || changes.showEvents ) ) {
                this._g.updateOptions(this.options);
            }

            if ( this._g && needsResize ) {
                this._g.updateOptions(this.options, true);
                const nsize = this.size;
                this._g.resize(nsize.width, nsize.height);
            }
        }
    }

    /* Commenting out for now
        will be part of next PR that will improve tooltip movement*/
    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: any) {
        // reset tick highlight
        this.firstTickHighlight = false;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: any) {

        // NOTE: This will go away once we hook into new tooltip system

        if (this.firstTickHighlight && this.labelsDiv) {
            const tooltip = this.labelsDiv;
            let parent = tooltip.closest('.widget-output');
            let widgetScrollContainer;
            if (parent) {
                widgetScrollContainer = parent.querySelector('.multigraph-output');
            } else {
                // no widget-output (probably not a dashboard widget)
                // so lets check for graph-output in alerts
                parent = tooltip.closest('.graph-output');
                widgetScrollContainer = parent;
            }

            // widget output element
            let wrapperEl;
            if (this.multigraph) {
                wrapperEl = event.target.closest('.graph-cell');
            } else {
                wrapperEl = widgetScrollContainer;
            }

            // canvas dimensions
            const wrapperSize = wrapperEl.getBoundingClientRect();

            // window dimensions
            const winSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // tooltip dimensions
            const tooltipSize = {
                width: tooltip.clientWidth,
                height: tooltip.clientHeight
            };

            // parent dimensions
            const parentSize = parent.getBoundingClientRect();

            // adjusted coordinates
            let coords: any = {
                left: event.clientX - parentSize.left,
                top: event.clientY - parentSize.top
            };

            // offsets
            let xOffset = 0;
            let yOffset = 0;
            const offsetAmount = 10;

            // detect window right edge proximity
            if ((winSize.width - event.x) < (tooltipSize.width + (offsetAmount * 2))) {
                // left
                xOffset = - (tooltipSize.width + offsetAmount);
            } else {
                // right
                xOffset = offsetAmount;
            }

            // detect window bottom edge proximity
            if ((winSize.height - event.y) < (tooltipSize.height + (offsetAmount * 2))) {
                // above
                yOffset = - (tooltipSize.height + offsetAmount);
            } else {
                // below
                yOffset = offsetAmount;
            }
            tooltip.style.display = 'block';
            tooltip.style.left = (coords.left + xOffset) + 'px';
            tooltip.style.top = (coords.top + yOffset) + 'px';
        }

    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: any) {
        //this.labelsDiv.style.display = 'none';
        this.firstTickHighlight = false;
        if (this._g) {
            this._g.clearSelection();
        }
    }

    ngOnDestroy() {

    }
}
