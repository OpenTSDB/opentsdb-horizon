import {
    OnInit, OnChanges, OnDestroy, Directive,
    Input, Output, EventEmitter, ElementRef, SimpleChanges, Renderer2, HostListener
} from '@angular/core';
import { IDygraphOptions } from '../IDygraphOptions';
import Dygraph from 'dygraphs/src-es5/dygraph.js';
import DygraphInteraction from '../../../dygraphs/misc/dygraph-interaction-model';
import { UnitConverterService } from '../../../../core/services/unit-converter.service';
import { UtilsService } from '../../../../core/services/utils.service';
import ThresholdsPlugin from '../../../dygraph-threshold-plugin/src/index';
import * as moment from 'moment';
import * as d3 from 'd3';
import { LoggerService } from '../../../../core/services/logger.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[dygraphsChart]',

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
    /* Commenting out for now
        will be part of next PR that will improve tooltip movement*/
    public firstTickHighlight = false;

    constructor(
        private element: ElementRef,
        private utils: UtilsService,
        private uConverter: UnitConverterService,
        private logger: LoggerService
    ) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {

        // this.logger.log('SIMPLE CHANGES', {changes});

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
            const legendCheck = parent.querySelector('.dygraph-legend');
            if (legendCheck) {
                this.labelsDiv = legendCheck;
            } else {
                this.labelsDiv = document.createElement('div');
                this.labelsDiv.classList.add('dygraph-legend');
                // this.element.nativeElement.parentNode.appendChild(this.labelsDiv);
                parent.appendChild(this.labelsDiv);
            }

            this.options.labelsDiv = this.labelsDiv;
        }

        /* part of coming pr change*/
        if (!this.options.hasOwnProperty('hideOverlayOnMouseOut')) {
            this.options.hideOverlayOnMouseOut = false;
        }


        const self = this;
        const mouseover = function (e, x, points, row, seriesName) {
            this.lastSeriesHighlighted = seriesName;

            /* Commenting out for now
                will be part of next PR that will improve tooltip movement*/
            if (!self.firstTickHighlight) {
                self.firstTickHighlight = true;
            }

            if (self.timeseriesLegend.open && self.timeseriesLegend.trackMouse) {
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

                self.currentTickEvent.emit({
                    action: 'tickDataChange',
                    tickData: tickDataOutput
                });
            }

            // console.log('MOUSEOVER', e, {event, x, points, row, seriesName});

        };

        const clickCallback = function(e, x, points) {
            // console.log('GRAPH CLICK', this.lastSeriesHighlighted, {e, x, points, _g: this}, this);

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

        const legendFormatter = function (data) {
            const seriesConfig = this.user_attrs_.series;
            if (data.x == null) {
                const labelsDiv = this.user_attrs_.labelsDiv;
                if (labelsDiv) {
                    labelsDiv.style.display = 'none';
                }
                return '';
            }

            let html = '<p>' + data.xHTML + '</p>';
            if (self.chartType !== 'heatmap') {
                // console.log('%cLEGEND FORMATTER','color: white; background-color: maroon; padding 2px;', data, seriesConfig);
                data.series.forEach(function (series) {
                    if (!series.isVisible || !series.isHighlighted) {
                        return;
                    }
                    const tags = seriesConfig[series.label].tags;
                    const label = seriesConfig[series.label].label;
                    const metric = (tags.metric !== label) ? label : tags.metric;
                    html += '<p>Value: ' + series.yHTML + '</p>';
                    html += '<p>' + metric + '</p>';
                    for (const k in tags) {
                        if (k !== 'metric') {
                            html += '<p>' + k + ': ' + tags[k] + '</p>';
                        }
                    }
                });
            }
            return html;
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

        const setHeatmapLegend = function (event, g, x, bucket) {

            const labelsDiv = g.user_attrs_.labelsDiv;
            const options = g.user_attrs_;
            const tooltipData = options.series[bucket] && options.series[bucket][x] ? options.series[bucket][x] : [];
            const format = options.axes.y.tickFormat;
            const precision = format.precision ? format.precision : 2;

            const yScale = d3.scaleQuantize()
                .domain(options.axes.y.valueRange)
                .range(Array.from(Array(options.heatmap.buckets), (x, index) => (index + 1)));
            const range: any = yScale.invertExtent(bucket);
            for (let i = 0; i < 2; i++) {
                const dunit = self.uConverter.getNormalizedUnit(range[i], format);
                range[i] = self.uConverter.convert(range[i], format.unit, dunit, { unit: format.unit, precision: precision });
            }

            let html = '';
            html = options.labelsUTC ? moment(x).utc().format('YYYY/MM/DD HH:mm') : moment(x).format('YYYY/MM/DD HH:mm');
            html += '<p>' + self.uConverter.convert((tooltipData.length / options.heatmap.nseries) * 100, '', '', { unit: '', precision: precision }) + '% of Series, ' + tooltipData.length + ' of ' + options.heatmap.nseries + '</p>';
            html += '<p>Bucket Range: [' + range[0] + ', ' + range[1] + ')</b><table>';
            tooltipData.sort((a, b) => b.v - a.v);
            const n = tooltipData.length < 5 ? tooltipData.length : 5;
            for (let i = 0; i < n; i++) {
                const dunit = self.uConverter.getNormalizedUnit(tooltipData[i].v, format);
                const val = self.uConverter.convert(tooltipData[i].v, format.unit, dunit, { unit: format.unit, precision: precision });

                html += '<tr><td>' + val + '</td><td>' + tooltipData[i].label + '</td></tr>';
            }
            html += '</table>';
            labelsDiv.innerHTML = html;

            let xOffset = 0;
            let yOffset = 0;
            labelsDiv.style.display = 'block';
            const labelDivWidth = labelsDiv.clientWidth;
            const labelDivHeight = labelsDiv.clientHeight;
            if (event.clientX > (window.innerWidth - (labelDivWidth + 10))) {
                xOffset = - (labelDivWidth + 10);
            }
            if (event.clientY > (window.innerHeight - (labelDivHeight + 30))) {
                yOffset = - (labelDivHeight + 40);
            }
            labelsDiv.style.left = (event.offsetX + xOffset) + 'px';
            labelsDiv.style.top = (event.offsetY + yOffset) + 'px';
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
                    if (this.options.labelsDiv) {
                        this.options.highlightCallback = mouseover;
                    }
                    this.options.legendFormatter = legendFormatter;
                    this.options.zoomCallback = function (minDate, maxDate, yRanges) {
                        // we only handle xzoom
                        if (!yRanges) {
                            self.zoomed.emit({ start: minDate / 1000, end: maxDate / 1000, isZoomed: true });
                        }
                    };
                    this.options.drawCallback = drawCallback;
                    this.options.underlayCallback = underlayCallback;

                    this.options.interactionModel = DygraphInteraction.defaultModel;
                    this.options.interactionModel.dblclick = function (e, g, context) {
                        if (g.user_attrs_.isCustomZoomed) {
                            self.zoomed.emit({ start: null, end: null, isZoomed: false });
                        } else if (self._g.isZoomed()) { // zooming out (double click)
                            self.zoomed.emit({ start: null, end: null, isZoomed: false });
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
                        //this.options.clickCallback = clickCallback;
                        // TODO: need to detect double click and NOT open the island

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
                                if (hasData) {
                                    setHeatmapLegend(event, g, ts, bucket);
                                } else {
                                    if (labelsDiv) {
                                        labelsDiv.style.display = 'none';
                                    }
                                }

                                const x = cx2 - width / 2;
                                const y = cy - cy % height;
                                if ( !_prev || _prev.x !== x || _prev.bucket !== bucket ) {
                                    self.currentTickEvent.emit({
                                        action: 'tickDataChange',
                                        tickData: { options: self.options, x: ts, bucket: bucket, data: hasData },
                                    });
                                }

                                ctx.fillStyle = !hasData ? '#dddddd' : g.user_attrs_.heatmap.color;
                                ctx.fillRect(x, y, width, height);
                                ctx.strokeStyle = 'red';
                                ctx.strokeWidth = 1;
                                ctx.rect(x, 0, width, plotArea.h);
                                ctx.stroke();
                                g._prevBucketHighlightBucket = { x: x, y: y, w: width, h: height, bucket: bucket };
                            } else {
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

        if (this.firstTickHighlight && this.labelsDiv) {
            const tooltip = this.labelsDiv;
            tooltip.style.display = 'block';

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
                wrapperEl = parent.querySelector('.graph-cell');
            } else {
                wrapperEl = widgetScrollContainer;
            }

            // widget output el size
            const wrapperSize = wrapperEl.getBoundingClientRect();

            const coords = {
                top: (event.clientY - wrapperSize.top) - widgetScrollContainer.scrollTop,
                left: (event.clientX - wrapperSize.left) - widgetScrollContainer.scrollLeft
            };

            let xOffset = 0;
            let yOffset = 0;

            const tooltipSize = {
                width: tooltip.clientWidth,
                height: tooltip.clientHeight
            };

            let closeToRight: boolean = false;
            // if close to the right edge, put it left of the cursor
            if (coords.left > (wrapperSize.width - (tooltipSize.width - 30))) {
                xOffset = - (tooltipSize.width + 10);
                closeToRight = true;
                // check if it goes off the left edge of scrollContainer, then put back on right of cursor
                if ((((coords.left + xOffset) - widgetScrollContainer.scrollLeft) + (xOffset)) < 0) {
                    xOffset = 15;
                }
            } else {
                // just ensure it is offset from cursor
                xOffset = 15;
            }

            // if close to bottom edge, put it above the cursor
            if (coords.top > (wrapperSize.height - (tooltipSize.height - 30))) {
                yOffset = - (tooltipSize.height + 10);
                // check if it goes off the top edge of scrollContainer, then put back below cursor
                if ((((coords.top + yOffset) - widgetScrollContainer.scrollTop) + (yOffset)) < 0) {
                    yOffset = 15;
                }
                // TODO: check if goes off bottom of dashboardScrollContainer
                // i.e. scrolled down dashboard maybe half way, and hover over graph near bottom
                // tooltip might go below the scroll. Need to detect so it can adjust. figure out the math
            } else {
                // just ensure it is offset from cursor
                yOffset = 15;
            }

            // set styles
            if (closeToRight) {
                tooltip.style.right = (wrapperSize.width - coords.left) + 'px';
                tooltip.style.left = 'initial';
            } else {
                tooltip.style.left = (coords.left + xOffset) + 'px';
                tooltip.style.right = 'initial';
            }

            tooltip.style.top = (coords.top + yOffset) + 'px';

        }
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: any) {
        this.labelsDiv.style.display = 'none';
        this.firstTickHighlight = false;
        if (this._g) {
            this._g.clearSelection();
        }
    }

    ngOnDestroy() {

    }
}
