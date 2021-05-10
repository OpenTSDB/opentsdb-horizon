import { OnInit, OnChanges, OnDestroy, Directive,
    Input, Output, EventEmitter, ElementRef, SimpleChanges } from '@angular/core';
import 'chart.js';
import customTooltip from '../../../chart.js/tooltip/custom-tooltip';
import * as thresholdPlugin from '../../../chartjs-threshold-plugin/src/index';
import { UnitConverterService } from '../../../../core/services/unit-converter.service';
import { TooltipDataService } from '../../universal-data-tooltip/services/tooltip-data.service';
import { ConsoleService } from '../../../../core/services/console.service';

Chart.defaults.global.defaultFontColor = '#000000';
// Chart.defaults.global.defaultFontFamily = 'Monaco, monospace';
// Chart.defaults.global.defaultFontSize = 14;


@Directive({
  selector: '[chartjs]'
})
export class ChartjsDirective implements OnInit, OnChanges, OnDestroy  {
    @Input() data: any;
    @Input() options: any;
    @Input() chartType: string;

    /**
     * holds chart instance
     */
    chart: any;
    max : number = 0;

    /**
     * default chart options
     */
    defaultOptions: any = {
        layout: {
            padding: 5
        },
        animation: {
            duration: 0,
        },
        responsive: true,
        legend: {
            display: false
        },
        responsiveAnimationDuration: 0,
        maintainAspectRatio: false
    };

    /**
     * colors
     */
    colors: any = [ '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c',
                    '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5',
                    '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f',
                    '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5',
                    '#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939',
                    '#8ca252', '#b5cf6b', '#cedb9c', '#bd9e39', '#e7ba52',
                    '#e7cb94', '#ad494a', '#d6616b', '#e7969c', '#7b4173',
                    '#a55194', '#ce6dbd', '#de9ed6'];
    /**
     * temp. var holds colors
     */
    _meta: any = {};

    constructor(
        private element: ElementRef,
        private uConverter: UnitConverterService,
        private ttDataSvc: TooltipDataService
    ) {
        const self = this;
        // OLD ONE
        const tooltipFormatter = function(item, data) {
            const axis = self.chartType.indexOf('horizontal') >= 0 ? 'x' : 'y';
            const datasetIndex = item.datasetIndex;
            const index = item.index;
            const tags = data.datasets[datasetIndex].tooltipData[index];
            let taghtml = '';
            for (const k in tags ) {
                taghtml += '<p>' + k + ': ' +  tags[k] + '</p>';
            }
            if ( self.options.scales && self.options.scales[ axis + 'Axes' ][0].ticks.format ) {
                const tickFormat = self.options.scales[axis + 'Axes'][0].ticks.format;
                const unit = tickFormat.unit;
                const dunit = self.uConverter.getNormalizedUnit(item[axis + 'Label'], self.options.scales[axis + 'Axes'][0].ticks.format);
                return 'Value: ' + self.uConverter.convert(item[axis + 'Label'], unit, dunit ,{ unit: unit, precision: tickFormat.precision } ) + taghtml;
            } else {
                const dunit = self.uConverter.getNormalizedUnit(data['datasets'][0]['data'][item['index']], self.options.scales[axis + 'Axes'][0].ticks.format);
                return 'Value: ' +  self.uConverter.convert(data['datasets'][0]['data'][item['index']],'',dunit, { unit: '', precision: '' }) + taghtml;
            }
        };

        // NEW ONE
        const tooltipFormatter2 = function(item, data) {
            const axis = self.chartType.indexOf('horizontal') >= 0 ? 'x' : 'y';
            const datasetIndex = item.datasetIndex;
            const index = item.index;
            const tags = data.datasets[datasetIndex].tooltipData[index];
            let ctags = [];
            for (const k in tags ) {
                ctags.push({key: k, value: tags[k]});
            }
            let cvalue: any;
            let unit: any;
            let dunit: any;
            let value: any;
            let color: any = data.datasets[datasetIndex].backgroundColor[index];
            let label: any = (item.label) ? item.label : tags.metric;
            if ( self.options.scales && self.options.scales[ axis + 'Axes' ][0].ticks.format ) {
                const tickFormat = self.options.scales[axis + 'Axes'][0].ticks.format;
                value = item[axis + 'Label'];
                unit = tickFormat.unit;
                dunit = self.uConverter.getNormalizedUnit(
                    value,
                    self.options.scales[axis + 'Axes'][0].ticks.format
                );
                cvalue = self.uConverter.convert(
                    value,
                    unit,
                    dunit,
                    { unit: unit, precision: tickFormat.precision }
                );
            } else {
                value = data['datasets'][0]['data'][item['index']];
                dunit = self.uConverter.getNormalizedUnit(
                    value,
                    self.options.scales[axis + 'Axes'][0].ticks.format
                );
                cvalue = self.uConverter.convert(
                    value,
                    '',
                    dunit,
                    { unit: '', precision: '' }
                );
            }

            /*self.logger.log('TT FORMATTER', {
                item, data, axis, unit, dunit
            });*/

            //
            return {
                tags: ctags,
                value: value,
                valueFormatted: cvalue,
                color: color,
                label: label
            };
        };

        this.defaultOptions.tooltips = {
                                        enabled: false,
                                        position: 'nearest',
                                        /*custom: customTooltip,
                                        callbacks: {
                                            title: function() {},
                                            label : tooltipFormatter
                                        }*/
                                        custom: (ttModel) => {
                                            if (!ttModel.body) {
                                                self.ttDataSvc._ttDataPut(false);
                                            } else {
                                                const data = ttModel.body[0].lines[0];
                                                const position = {x: ttModel.caretX, y: ttModel.caretY};
                                                // self.logger.ng('TTDATA', {data, position});
                                                self.ttDataSvc._ttDataPut({data, position});
                                            }
                                        },
                                        callbacks: {
                                            title: function() {},
                                            label : tooltipFormatter2
                                        }
                                    } ;
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if ( changes ) {
            const self = this;
            const tickFormatter = function(value) {
                if ( this.options.ticks && this.options.ticks.format ) {
                    const unit = this.options.ticks.format.unit;
                    const dunit = self.uConverter.getNormalizedUnit(value, this.options.ticks.format );
                    return self.uConverter.convert(value, unit, dunit, { unit: unit, precision: this.options.ticks.format.precision } );
                } else {
                    return value;
                }
            };

            if ( this.options.scales ) {
                Object.keys(this.options.scales).forEach( k => {
                    this.options.scales[k].forEach( axis => {
                        if ( axis.ticks ) {
                            if ( axis.ticks.format ) {
                                axis.ticks.callback = tickFormatter;
                            } else {
                                delete axis.ticks.callback;
                            }
                        }
                    });
                });
            }
            if ( this.chart && ( changes.chartType || changes.data  || changes.options ) ) {
                this.chart.destroy();
                const ctx = this.element.nativeElement.getContext('2d');
                this.updateDatasets(this.data);
                this.chart = new Chart(ctx, {
                    type: this.chartType,
                    plugins: [ thresholdPlugin ],
                    options: Object.assign(this.defaultOptions, this.options),
                    data: {
                        labels: this.options.labels,
                        datasets: this.data
                    }
                });
            }
            if ( !this.chart && this.data ) {
                const ctx = this.element.nativeElement.getContext('2d');
                this.updateDatasets(this.data);
                this.chart = new Chart(ctx, {
                    type: this.chartType,
                    plugins: [ thresholdPlugin ],
                    options: Object.assign(this.defaultOptions, this.options),
                    data: {
                        labels: this.options.labels,
                        datasets: this.data
                    }
                });
            }
        }
    }

    /**
     * sets the background color, border color, border width, etc..
     * @param Array datasets - chartjs datasets
     */
    updateDatasets(datasets) {

        this._meta = {
            colors: this.colors.concat()
        };
        this.max = datasets[0] && datasets[0].data ? Math.max(...datasets[0].data) : 0;
        const multiColor = (this.chartType === 'bar' || this.chartType === 'doughnut') && datasets.length === 1 ? true : false;
        datasets.forEach((dataset, i) => {
            this.setColor(dataset, multiColor ? dataset.data.length : 1 );
        });

    }

    setColor( dataset, n ) {
            const colors = dataset.backgroundColor || this.getColors(n);
            dataset.backgroundColor = colors;//this.getAlpha(colors.concat([]), 0.5);
            dataset.borderWidth = 1;
            dataset.borderColor = colors;
    }


    getColor() {
        const color = this._meta.colors.shift() || this.getRandomColor(null);
        return color;
    }

    getColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++ ) {
            colors.push(this.getColor());
        }
        return colors;
    }

    getAlpha(colors , alpha ) {
        if ( Array.isArray (colors) ) {
            for ( let i = 0; i < colors.length; i++ ) {
                colors[i] = Chart.helpers.color( colors[i] ).alpha(alpha).rgbString();
            }
        } else {
            colors = Chart.helpers.color( colors ).alpha(alpha).rgbString();
        }
        return colors;
    }

    getRandomColor(color) {
        let hue = this.getRandomInt(0, 360);

        if ( color ) {
            const num = parseInt(color, 16);
            const r = ( ( num >> 16 ) & 255 ) / 255;
            const g = ( ( num >> 8 ) & 255 ) / 255;
            const b = ( num & 255 ) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const diff = max - min;

                hue =   min === max ? 0 : r === max ?  (((60 * (g - b)) / diff) + 360) % 360
                                : g === max ?      ((60 * (b - r)) / diff) + 120
                                :  ((60 * (r - g)) / diff) + 240;

        }
        return 'hsl(' + hue + ',' + this.getRandomInt(0, 100) + '%,' + this.getRandomInt(0, 90) + '%)';
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    ngOnDestroy() {

    }

}
