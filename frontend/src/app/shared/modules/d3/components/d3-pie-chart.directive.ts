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
    Directive,
    ElementRef,
    OnInit,
    OnChanges,
    Input,
    SimpleChanges,
} from '@angular/core';
import { UnitConverterService } from '../../../../core/services/unit-converter.service';

import * as d3 from 'd3';
import { TooltipDataService } from '../../universal-data-tooltip/services/tooltip-data.service';

@Directive({
    selector: '[D3PieChart]',
})
export class D3PieChartDirective implements OnInit, OnChanges {
    @Input() options;
    @Input() size: any;

    private host;
    private svg; // do we need?
    constructor(
        private element: ElementRef,
        private uConverter: UnitConverterService,
        private ttDataSvc: TooltipDataService,
    ) {}

    ngOnInit() { /* do nothing */ }

    ngOnChanges(changes: SimpleChanges) {
        if (
            (changes.options && changes.options) ||
            (changes.size && changes.size.currentValue)
        ) {
            this.createChart();
        }
    }
    createChart() {
        if (!this.size || !this.size.width || !this.options) {
            return;
        }
        const margin = { top: 5, bottom: 5, left: 5, right: 5 };
        const width = this.size.width - margin.left - margin.right,
            height = this.size.height,
            chartSize = Math.min(width, height),
            radius = Math.min(width, height) / 2;
        const donutWidth = this.options.type === 'pie' ? radius : radius * 0.5;
        const legendItemHeight = 20;
        let maxLegendItemLen = 0;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        const mousemove = function (d) {
            /* tooltip.style("left", d3.event.offsetX + 10 + "px");
            tooltip.style("top", d3.event.offsetY + 10 + "px");
            let taghtml = '';
            for (const k in d.data.tooltipData ) {
              taghtml += '<p>' + k + ': ' +  d.data.tooltipData[k] + '</p>';
            }
            tooltip.html( d.data.label + '<p>Value: ' +  d3.format('.3s')(d.data.value) + '</p>' + taghtml);
            */
            const ttData: any = {
                color: d.data.color,
                label: d.data.label,
                value: d.data.value,
                valueFormatted: d3.format('.3s')(d.data.value),
                tags: [],
            };
            for (const k in d.data.tooltipData) {
                if (d.data.tooltipData[k]) {
                    ttData.tags.push({ key: k, value: d.data.tooltipData[k] });
                }
            }
            self.ttDataSvc._ttDataPut({
                data: ttData,
                position: { x: d3.event.clientX, y: d3.event.clientY },
            });
        };
        // const mouseover = function(d) { tooltip.style("display", "inline-block");}
        const mouseover = function (d) {
            tooltip.style('display', 'none');
        };
        const mouseleave = function (d) {
            tooltip.style('display', 'none');
        };

        // Computes the angle of an arc, converting from radians to degrees.
        const angle = function (d) {
            const a = ((d.startAngle + d.endAngle) * 90) / Math.PI - 90;
            return a > 90 ? a - 180 : a;
        };

        const dataset = this.options.data;
        this.host = d3.select(this.element.nativeElement);

        this.host.html('');
        const tooltip = this.host.append('div').attr('class', 'tooltip');

        const svg = this.host
            .append('svg')
            .attr('width', chartSize)
            .attr('height', chartSize);

        const donut = svg
            .append('g')
            .attr(
                'transform',
                'translate(' + chartSize / 2 + ',' + chartSize / 2 + ')',
            );

        const arc = d3
            .arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - donutWidth);

        const pie = d3
            .pie()
            .sort(null)
            .value(function (d: any) {
                return d.value;
            });

        const arcs = donut
            .selectAll('arc')
            .data(pie(dataset))
            .enter()
            .append('g')
            .attr('class', 'arc')
            .attr('stroke', 'white')
            .style('stroke-width', '1px');

        // draw arc paths
        let path = arcs
            .append('path')
            .attr('fill', function (d, i) {
                return d.data.color;
            })
            .attr('d', arc)
            .each(function (d) {
                // NOTE: not sure how to fix this for d3. Need to investigate
                // NOTE: disabling eslint error for this line for now
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
                this._current - d;
            })
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        dataset.forEach(function (d) {
            d.value = +d.value;
            d.enabled = true;
            maxLegendItemLen =
                maxLegendItemLen < d.label.length
                    ? d.label.length
                    : maxLegendItemLen;
        });
        let total = d3.sum(dataset.map((d) => (d.enabled ? d.value : 0)));

        let labels;
        if (
            this.options.legend.showPercentages ||
            this.options.legend.showValue
        ) {
            const format = this.options.legend.showPercentages ? '.1%' : '.3s';
            labels = arcs
                .append('text')
                .attr('transform', function (d) {
                    const diff = d.endAngle - d.startAngle;
                    const rotate = diff > 0.4 ? '' : 'rotate(' + angle(d) + ')';
                    return 'translate(' + arc.centroid(d) + ')' + rotate;
                })
                .attr('dy', '.30em')
                .style('text-anchor', 'middle')
                .style('font-size', '0.9em')
                .attr('stroke', (d: any) => {
                    const color = d3.rgb(
                        d.data.color === 'auto' ? '#000000' : d.data.color,
                    );
                    const luminance = Math.sqrt(
                        0.241 * Math.pow(color.r, 2) +
                            0.691 * Math.pow(color.g, 2) +
                            0.068 * Math.pow(color.b, 2),
                    );
                    if (luminance >= 130) {
                        return '#000000';
                    } else {
                        return '#ffffff';
                    }
                })
                .attr('stroke-width', '0.7px')
                .style('font-weight', '100')
                .style('opacity', (d) =>
                    (d.endAngle - d.startAngle) * chartSize > 25 &&
                    d.data.enabled
                        ? 1
                        : 0,
                )
                .text((d) =>
                    d3.format(format)(
                        this.options.legend.showPercentages
                            ? d.value / total
                            : d.value,
                    ),
                )
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseleave', mouseleave);
        }
        const legendClickHandler = function (s: any, index) {
            const rect: any = d3.select(this.parentNode.childNodes[index]);
            let enabled = true;
            const totalEnabled = d3.sum(
                dataset.map(function (d) {
                    return d.enabled ? 1 : 0;
                }),
            );

            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '');
            } else {
                if (totalEnabled < 2) {
                    return;
                }
                rect.attr('class', 'disabled');
                enabled = false;
            }

            pie.value(function (d: any) {
                if (d.label === s.label) {
                    d.enabled = enabled;
                }
                return d.enabled ? d.value : 0;
            });
            path = path.data(pie(dataset));
            total = d3.sum(dataset.map((d) => (d.enabled ? d.value : 0)));
            path.transition()
                .duration(0)
                .attrTween('d', function (d) {
                    const interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        return arc(interpolate(t));
                    };
                });

            if (self.options.legend.showPercentages) {
                labels = labels.data(pie(dataset));
                labels
                    .transition()
                    .duration(0)
                    .style('opacity', (d) =>
                        (d.endAngle - d.startAngle) * chartSize > 25 &&
                        d.data.enabled
                            ? 1
                            : 0,
                    )
                    .attr('transform', function (d) {
                        const diff = d.endAngle - d.startAngle;
                        const rotate =
                            diff > 0.4 ? '' : 'rotate(' + angle(d) + ')';
                        return 'translate(' + arc.centroid(d) + ')' + rotate;
                    })
                    .text((d) => d3.format('.1%')(d.value / total));
            }
        };

        const legend = d3.select(this.options.legendDiv);
        legend.html('');
        if (this.options.legend.display) {
            const legendg = legend
                .append('svg')
                .attr('width', (3 + maxLegendItemLen) * 9)
                .attr('height', legendItemHeight * dataset.length)
                .append('g')
                .attr('class', 'legend');

            legendg
                .selectAll('rect')
                .data(dataset)
                .enter()
                .append('rect')
                .attr('x', 0)
                .attr('y', (d, i) => i * legendItemHeight)
                .attr('width', 10)
                .attr('height', 10)
                .style('stroke', (d: any) => d.color)
                .style('fill', (d: any) => d.color)
                .on('click', legendClickHandler);

            legendg
                .selectAll('text')
                .data(dataset)
                .enter()
                .append('text')
                .attr('x', 15)
                .attr('width', 10)
                .attr('height', 10)
                .attr('y', (d, i) => i * legendItemHeight + 10)
                .text((d: any) => d.label)
                .on('click', legendClickHandler);
        }
    }
}
