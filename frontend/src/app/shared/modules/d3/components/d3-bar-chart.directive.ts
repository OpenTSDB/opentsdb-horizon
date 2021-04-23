import { Directive, ElementRef, AfterViewInit, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { UnitConverterService } from '../../../../core/services/unit-converter.service';
import { UtilsService } from '../../../../core/services/utils.service';


import * as d3 from 'd3';
import { TooltipDataService } from '../../universal-data-tooltip/services/tooltip-data.service';

@Directive({
    selector: '[D3BarChart]'
})
export class D3BarChartDirective implements OnInit, OnChanges {

    @Input() options;
    @Input() size: any;

    private host;
    private svg;
    constructor(
        private element: ElementRef,
        private utils: UtilsService,
        private unitService: UnitConverterService,
        private ttDataSvc: TooltipDataService
    ) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.options && changes.options || changes.size && changes.size.currentValue) {
            if (this.options && this.options.direction === 'horizontal') {
                this.horizontalBarChart();
            } else {
                this.verticalBarChart();
            }
        }
    }
    horizontalBarChart() {
        if (!this.size || !this.size.width || !this.options) {
            return;
        }
        let dataset = this.options.data;
        const margin = { top: 0, bottom: 0, left: 3, right: 5 };
        const minBarHeight = 15;
        let chartHeight = minBarHeight * dataset.length;
        let yAxisWidth = 0, labelHeight = 0;
        chartHeight = chartHeight > this.size.height || !this.size.height ? chartHeight : this.size.height - 7; // -7 avoids the scrollbar
        const chartAreaHeight = chartHeight - margin.top - margin.bottom;

        // const refValue = min >=0  ? Math.pow(10, Math.floor(Math.log10(max))) : 1;
        // const formatter = d3.formatPrefix(".2s", refValue);
        const unitOptions = this.options.format;
        const tooltipUnitOptions = this.utils.deepClone(this.options.format);
        unitOptions.precision = 2;
        tooltipUnitOptions.precision = 'auto';
        let longText = '';
        // const dunit = this.unitService.getNormalizedUnit(max, unitOptions);
        for (let i = 0, len = dataset.length; i < len; i++) {
            // tslint:disable-next-line: max-line-length
            dataset[i].formattedValue = this.unitService.convert(dataset[i].value, unitOptions.unit, this.unitService.getNormalizedUnit(dataset[i].value, unitOptions), unitOptions);
            longText = longText.length > dataset[i].formattedValue.length ? longText : dataset[i].formattedValue;
        }
        const self = this;
        const mousemove = function (d) {
            // const containerPos = self.element.nativeElement.parentNode.parentNode.getBoundingClientRect();
            /*tooltip.style("left", d3.event.x - containerPos.x + "px");
            tooltip.style("top", d3.event.y - containerPos.y + 30 + "px");
            let taghtml = '';
            for (const k in d.tooltipData) {
                taghtml += '<p>' + k + ': ' + d.tooltipData[k] + '</p>';
            }
            // tooltip.html( d.label + '<p>Value: ' +  self.unitService.convert(d.value, unitOptions.unit, dunit, unitOptions )   + '</p>' + taghtml);
            const nunit = self.unitService.getNormalizedUnit(d.value, unitOptions);
            const nValue = self.unitService.convert(d.value, unitOptions.unit, nunit, unitOptions);
            const sValue = self.unitService.convert(d.value, unitOptions.unit, tooltipUnitOptions, tooltipUnitOptions);
            let tooltiphtml = d.label + '<p>Value: ' + nValue;
            if (nValue !== sValue) {
                tooltiphtml += ' (' + sValue + ')';
            }
            tooltiphtml += '</p>' + taghtml;
            tooltip.html(tooltiphtml);*/

            const nunit = self.unitService.getNormalizedUnit(d.value, unitOptions);
            const nValue = self.unitService.convert(d.value, unitOptions.unit, nunit, unitOptions);
            const sValue = self.unitService.convert(d.value, unitOptions.unit, tooltipUnitOptions, tooltipUnitOptions);

            const ttData: any = {
                color: (d.color && d.color.length > 0) ? d.color : false,
                label: d.label,
                value: {
                    n: nValue,
                    s: (nValue !== sValue) ? sValue : false
                },
                nValue,
                sValue,
                tags: []
            };

            for (const k in d.tooltipData ) {
                ttData.tags.push({key: k, value: d.tooltipData[k]});
            }

            self.ttDataSvc._ttDataPut({data: ttData, position: {x: d3.event.clientX, y: d3.event.clientY}});
        };
        //const mouseover = function (d) { tooltip.style("display", "inline-block"); }
        const mouseover = function (d) {
            tooltip.style("display", "none");
        }
        const mouseleave = function (d) {
            tooltip.style("display", "none");
        };

        this.host = d3.select(this.element.nativeElement);
        // this.host.html('');
        const tooltip = d3.select(this.element.nativeElement.parentNode.parentNode).select('.tooltip');


        const y = d3.scaleBand()
            .rangeRound([0, chartAreaHeight])
            .paddingInner(0.1)
            .domain(dataset.map((d, i) => i));

        const barHeight = y.bandwidth();
        const yAxis = d3.axisLeft(y)
            .tickSize(0)
            .tickFormat((d: any, i) => dataset[i].formattedValue);


        let svg = this.host.select('svg');

        if (svg.empty()) {
            svg = this.host
                .append('svg');
        }

        svg
            // .style('width', (this.size.width - margin.left - margin.right) + 'px')
            .style('height', chartHeight + 'px');

        // rerendering causing issue as we clear the chart container. the svg container is not available to calculate the yaxis label width
        setTimeout(() => {
            svg.selectAll('*').remove();
            // calculate the max label length and remove
            svg.append("text").attr("class", "axisLabel")
                .text(longText)
                .each(function () { yAxisWidth = this.getBBox().width; labelHeight = Math.floor(this.getBBox().height); })
                .remove();
            const fontSize = barHeight >= labelHeight ? '1em' : barHeight * 0.75 + 'px'; //y.bandwidth()  * 0.4 + "px";
            const chartAreawidth = this.size.width - yAxisWidth - margin.left - margin.right;
            const dmin = dataset.length > 1 ? d3.min(dataset, (d: any) => parseFloat(d.value)) : Number.MIN_VALUE;
            const min = d3.min(dataset, (d: any) => parseFloat(d.value));
            const offset = Math.sign(min) <= -1 ? -1 * min : 0;
            const max = d3.max(dataset, (d: any) => parseFloat(d.value)) + offset;

            const x = d3.scaleLinear()
                .range([0, chartAreawidth])
                .domain([dmin, d3.max(dataset, (d: any) => parseFloat(d.value))]);
            const g = svg.append('g').attr("transform", "translate(" + (margin.left + yAxisWidth + 3) + "," + margin.top + ")");

            // reduce the font-size when bar height is less than the fontsize
            g.append("g")
                .attr("class", "yaxis")
                .call(yAxis)
                .selectAll("text")
                .attr("class", "axisLabel")
                .attr("font-size", fontSize);

            const bars = g.selectAll(".bar")
                .data(dataset)
                .enter()
                .append("g");

            bars.append("rect")
                .attr("class", "bar")
                .attr("y", (d, i) => y(i))
                .attr("height", barHeight)
                .attr("x", 0)
                .attr("width", d => {
                    const v = ((d.value + offset) / max) * chartAreawidth;
                    return v > 0 ? v : 0;
                })
                .style('stroke', (d: any) => d.color)
                .style("fill", (d: any) => d.color)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

            /*bars.append("text")
                .attr("class", (d: any) => {
                    let tmpClass = 'label';
                    let tmpColor = d.color === 'auto' ? '#000000' : d.color;
                    let tcContrast = this.utils.findContrastColor(tmpColor);
                    console.log('%ctcContrast', 'background: red; padding: 2px; color white;', tcContrast);
                    return tmpClass + ' ' + tcContrast.type;
                })
                .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
                .attr("x", 0)
                .attr("font-size", fontSize)
                .attr("dy", ".32em")
                .attr("dx", "0.25em")
                .text((d, i) => d.label)
                .style('fill', (d: any) => {
                    console.log('%cCOLOR', 'background: red; padding: 2px; color white;', d);
                    let tmpColor = d.color === 'auto' ? '#000000' : d.color;
                    let tcContrast = this.utils.findContrastColor(tmpColor);
                    let returnVal;

                    return 'rgba(' + tcContrast.rgb.r + ', ' + tcContrast.rgb.b + ', ' + tcContrast.rgb.g + ', .85)';

                    //const color = d3.rgb(d.color === 'auto' ? '#000000' : d.color);
                    //return 'rgb(' + Math.floor(255 - color.r) + ',' + Math.floor(255 - color.g) + ',' + Math.floor(255 - color.b) + ')';
                })
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);*/

            bars.append("foreignObject")
                .attr("class", (d: any) => {
                    let tmpClass = 'label';
                    let tmpColor = d.color === 'auto' ? '#000000' : d.color;
                    let tcContrast = this.utils.findContrastColor(tmpColor);
                    console.log('%ctcContrast', 'background: red; padding: 2px; color white;', tcContrast);
                    return tmpClass + ' ' + tcContrast.type;
                })
                .attr("y", (d, i) => y(i))
                .attr("x", 5)
                .attr("height", barHeight)
                .attr("width", (d: any) => {
                    let txtWidth = this.utils.calculateTextWidth(d.label, '12px', 'Helvetica Neue');
                    console.log('%cWidth', 'color: white; background: green; padding: 2px;', txtWidth);
                    return txtWidth + 10;
                })
                .style("position","relative")
              .append("xhtml:div")
                .attr("class", "text")
                .style("padding", "2px")
                .style("font","12px 'Helvetica Neue'")
                .style("position","absolute")
                .style("top", "50%")
                .style("margin-top", "-9px")
                .style("color", "rgba(0, 0, 0, .85)")
                .style("background-color",(d: any) => {
                    console.log('%cCOLOR', 'background: red; padding: 2px; color white;', d);
                    let tmpColor = d.color === 'auto' ? '#000000' : d.color;
                    let tcContrast = this.utils.findContrastColor(tmpColor);
                    let opacity: any = (tcContrast.type === 'white') ? .65 : 0

                    return 'rgba(255, 255, 255, ' + opacity + ')';
                })
                .html((d: any) => "<span>" + d.label + "</span>")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

            bars.exit().remove();
        }, 200);
    }


    verticalBarChart() {
        if (!this.size || !this.size.width || !this.options) {
            return;
        }

        const margin = { top: 5, bottom: 3, left: 3, right: 5 };
        let xAxisHeight = 25, yAxisWidth = 35, labelHeight = 0;
        const chartAreaHeight = this.size.height - margin.top - margin.bottom - xAxisHeight;

        const yAxisConf = this.options.axes.y;
        const xAxisConf = this.options.axes.x;
        const dataset = this.options.data;
        const direction = this.options.direction;

        const xKey = this.options.axes.x && this.options.axes.x.key ? this.options.axes.x.key : direction === 'horizontal' ? 'value' : 'label';
        const yKey = this.options.axes.y && this.options.axes.y.key ? this.options.axes.y.key : direction === 'horizontal' ? 'label' : 'value';

        const max = dataset.length ? d3.max(dataset, (d: any) => Number(d.value)) : 0;

        const yAxisFormat = this.options.axes.y.format || { unit: 'auto', precision: 'auto' };
        const xAxisFormat = this.options.axes.x.format || { unit: 'auto', precision: 'auto' };
        const self = this;

        this.host = d3.select(this.element.nativeElement);
        let svg = this.host.select('svg');

        if (svg.empty()) {
            svg = this.host
                .append('svg');
        }

        // rerendering causing issue as we clear the chart container. the svg container is not available to calculate the yaxis label width
        setTimeout(() => {
            svg
                .style('height', this.size.height + 'px'); // chartHeight

            svg.selectAll('*').remove();
            let x, y, chartAreawidth, barSize;

            if (this.options.axes.y.type === 'category') {
                y = d3.scaleBand()
                    .rangeRound([0, chartAreaHeight])
                    .padding(0.1)
                    .domain(dataset.map(d => d[yKey]));
                barSize = y.bandwidth();
            } else {
                y = d3.scaleLinear()
                    .range([0, chartAreaHeight])
                    .domain([max, 0]);
            }

            chartAreawidth = this.size.width - yAxisWidth - margin.left - margin.right;
            if (this.options.axes.x.type === 'category') {
                x = d3.scaleBand()
                    .rangeRound([0, chartAreawidth])
                    .padding(0.1)
                    .domain(dataset.map(d => d[xKey]));
                barSize = x.bandwidth();
            } else {
                const key = this.options.axes.x.key ? this.options.axes.x.key : 'value';
                const min = dataset.length ? d3.min(dataset, (d) => Number(d[key])) : 0;
                const max = dataset.length ? d3.max(dataset, (d) => Number(d[key])) : 0;
                const m = Math.abs(max - min) / dataset.length;
                x = d3.scaleLinear()
                    .domain([min, max + m])
                    .range([0, chartAreawidth]);
                barSize = (chartAreawidth / dataset.length) - 1;
            }

            const g = svg.append('g').attr('transform', 'translate(' + (margin.left + yAxisWidth + 3) + ',' + margin.top + ')');

            const d3YAxis = this.getAxisByPosition(yAxisConf.position);
            const yAxis = d3[d3YAxis](y)
                // tslint:disable-next-line: max-line-length
                .tickFormat((d, i) => self.unitService.convert(d, yAxisFormat.unit, self.unitService.getNormalizedUnit(d, yAxisFormat), yAxisFormat));

            const ytx = 0;
            const yty = 0;
            if (yAxisConf.display === undefined || yAxisConf.display) {
                g.append('g')
                    .attr('class', 'yaxis')
                    .attr('transform', 'translate(' + ytx + ',' + yty + ')')
                    .call(yAxis)
                    .selectAll('text')
                    .attr('class', 'axisLabel');
            }
            const xtx = 0;
            const xty = chartAreaHeight;
            const d3XAxis = this.getAxisByPosition(xAxisConf.position);
            const xAxis = d3[d3XAxis](x)
                // tslint:disable-next-line: max-line-length
                .tickFormat((d, i) => self.unitService.convert(d, xAxisFormat.unit, self.unitService.getNormalizedUnit(d, xAxisFormat), xAxisFormat));
            if (xAxisConf.display === undefined || xAxisConf.display) {
                g.append('g')
                    .attr('class', 'xaxis')
                    .attr('transform', 'translate(' + xtx + ',' + xty + ')')
                    .call(xAxis)
                    .selectAll('text')
                    .attr('class', 'axisLabel')
                    .attr('text-anchor', 'middle');
            }
            const bars = g.selectAll('.bar')
                .data(dataset)
                .enter()
                .append('g');

            bars.append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d[xKey]) + 1)
                .attr('y', d => y(d.value))
                .attr('width', barSize)
                .attr('height', d => y(max - d.value))
                .style('stroke', (d) => d.color)
                .style('fill', (d) => d.color);
        }, 0);
    }

    getAxisByPosition(position) {
        switch (position) {
            case 'left':
                return 'axisLeft';
            case 'bottom':
                return 'axisBottom';
        }
    }
}
