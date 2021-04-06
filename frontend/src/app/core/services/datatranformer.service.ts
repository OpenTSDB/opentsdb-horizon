import { Injectable } from '@angular/core';
import { IDygraphOptions } from '../../shared/modules/dygraphs/IDygraphOptions';
import { barChartPlotter, heatmapPlotter, stackedAreaPlotter } from '../../shared/dygraphs/plotters';
import { UtilsService } from './utils.service';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DatatranformerService {

   REGDSID = /q?(\d+)?_?(m|e)(\d+).*/;
  // tslint:disable:max-line-length
  constructor(private util: UtilsService ) {  }

  removeEmptySeries(result ) {
    if ( result !== undefined && result.results ) {
        const removeSource = {};
        for ( let i = 0;  i < result.results.length; i++ ) {
            const [ source, mid ] = result.results[i].source.split(':');
            if (source === 'summarizer') {
                const n = result.results[i].data.length;
                for (let j = 0; j < n; j++) {
                    const tags = result.results[i].data[j].tags;
                    const hash = this.getHashFromMetricAndTags(result.results[i].data[j].metric, tags);
                    const aggs = result.results[i].data[j].NumericSummaryType.aggregations;
                    const countIndex = aggs.indexOf('count');
                    const key = Object.keys(result.results[i].data[j].NumericSummaryType.data[0])[0];
                    const count = result.results[i].data[j].NumericSummaryType.data[0][key][countIndex];
                    if ( count === 0 ) {
                        if ( !removeSource[mid] ) {
                            removeSource[mid] = {};
                        }
                        removeSource[mid][hash] = true;
                    }
                }
            }
        }
        if ( Object.keys(removeSource).length  ) {
            for ( let i = result.results.length - 1 ;  i >= 0; i-- ) {
                const [ source, mid ] = result.results[i].source.split(':');
                if ( removeSource[mid] ) {
                    const n = result.results[i].data.length;
                    result.results[i].data = result.results[i].data.filter(d => {
                        const hash = this.getHashFromMetricAndTags(d.metric, d.tags);
                        return !removeSource[mid][hash];
                    });
                }
            }
        }
    }
    return result;
  }

  // options will also be update of its labels array
  yamasToDygraph(widget, options: IDygraphOptions, normalizedData: any[], result: any): any {
    const startTime = new Date().getTime();
    let intermediateTime = startTime;
    result = { ...result };
    if ( normalizedData.length && normalizedData[0].length === 1 ) {
      // there is no data in here but default, reset it
      normalizedData = [];
    }
    // this will also take care of payload return as empty {}
    if ( result === undefined || !result.results || !result.results.length ) {
        return normalizedData;
    }

    const mSeconds = { 's': 1, 'm': 60, 'h': 3600, 'd': 86400 };
    const periods = { 'h': 'Hour', 'd': 'Day', 'w': 'Week'}
    const dict = {};
    // const queryResults = [];
    const queryResultsObj = {};
    let isStacked = false;
    // for time over time, turn bar or area to line type
    let hasToT = false;
    const midExToTNSeries = {};
    const groups = {};
    const stackedYAxes = [];
    let yMax = 0, y2Max = 0;
    const min = { y1: null, y2: null };
    const mTimeConfigs = {};
    let totalSeries = 0;
    let nAutoColors = 0;
    const schemeMeta = {};
    for ( let i = 0;  i < result.results.length; i++ ) {
        // no data then skip it.
        if (result.results[i].data.length === 0) {
            continue;
        }
        // queryResults.push(result.results[i]);
        queryResultsObj[i] = result.results[i];
        const [ source, mid ] = result.results[i].source.split(':');
        const midExToT = mid.split('-')[0];
        const tot = mid.split('-')[1];
        if (tot) {
            hasToT = true;
            isStacked = false;
        }
        const qids = this.REGDSID.exec(mid);
        const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
        const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
        const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
        const mConfig = gConfig && gConfig.metrics[mIndex] ? gConfig.metrics[mIndex] : null;
        const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
        queryResultsObj[i] = Object.assign( {}, queryResultsObj[i], {visualType: vConfig.type || 'line', mid} );
        if ( gConfig && gConfig.settings.visual.visible && vConfig.visible ) {
            if (!dict[mid]) {
                dict[mid] = { hashes: {}, summarizer: {}};
            }
            if ( !midExToTNSeries[midExToT] ) {
                midExToTNSeries[midExToT] = 0;
            }
            if (source === 'summarizer') {
                const n = queryResultsObj[i].data.length;
                for (let j = 0; j < n; j++) {
                    const tags = queryResultsObj[i].data[j].tags;
                    const hash = JSON.stringify(tags);
                    const aggs = queryResultsObj[i].data[j].NumericSummaryType.aggregations;
                    const key = Object.keys(queryResultsObj[i].data[j].NumericSummaryType.data[0])[0];
                    const data = queryResultsObj[i].data[j].NumericSummaryType.data[0][key];
                    const aggData = {};
                    for (let k = 0; k < aggs.length; k++) {
                        aggData[aggs[k]] = data[k];
                    }
                    dict[mid]['summarizer'][hash] = aggData;
                    if (!vConfig.axis || vConfig.axis === 'y1') {
                        yMax = yMax < aggData['max'] ? aggData['max'] : yMax;
                        min['y1'] = min['y1'] === null || min['y1'] > aggData['min'] ? aggData['min'] : min['y1'];
                    } else {
                        y2Max = y2Max < aggData['max'] ? aggData['max'] : y2Max;
                        min['y2'] = min['y2'] === null || min['y2'] > aggData['min'] ? aggData['min'] : min['y2'];
                    }
                }
            } else {
                dict[mid]['values'] = {}; // queryResults.data;
                const n = queryResultsObj[i].data.length;
                if ( !vConfig.color && ( !vConfig.scheme || vConfig.scheme === 'auto') ) {
                    nAutoColors += n;
                }
                totalSeries += n;
                midExToTNSeries[midExToT] += n;
                const key = queryResultsObj[i].timeSpecification.start + '-' + queryResultsObj[i].timeSpecification.end + '-' + queryResultsObj[i].timeSpecification.interval;
                mTimeConfigs[key] = {timeSpecification: queryResultsObj[i].timeSpecification, nSeries: n};
                for (let j = 0; j < n; j++) {
                    const tags = queryResultsObj[i].data[j].tags;
                    const hash = JSON.stringify(tags);
                    dict[mid]['values'][hash] = queryResultsObj[i].data[j].NumericType;
                    if ( !hasToT && ((vConfig.type === 'area' && vConfig.stacked !== 'false') || vConfig.type === 'bar' ) ) {
                        isStacked = true;
                        const axis = !vConfig.axis || vConfig.axis === 'y1' ? 'y' : 'y2';
                        if ( !stackedYAxes.includes(axis) ) {
                            stackedYAxes.push(axis);
                        }
                    }
                }
            }
        }
    }
    const queryResults: any[] = Object.values(queryResultsObj);
    // if no series return right away
    if ( totalSeries === 0 ) {
        return [];
    }

    const tsObj = this.util.getTimestampsFromTimeSpecification(Object.values(mTimeConfigs));
    const ts = Object.keys(tsObj);
    const tsn = Object.keys(tsObj).length;
    const xAggs = {
                        max: {
                            'area': { 'y' : Array( tsn ).fill(0), 'y2': Array( tsn ).fill(0) },
                            'bar': { 'y' : Array( tsn ).fill(0), 'y2': Array( tsn ).fill(0) }
                        },
                        min: {
                            'area': { 'y' : Array( tsn ).fill(0), 'y2': Array( tsn ).fill(0) },
                            'bar': { 'y' : Array( tsn ).fill(0), 'y2': Array( tsn ).fill(0) }
                        },
                    };
    for ( let i = 0; i < ts.length; i++ ) {
        normalizedData[i] = Array( totalSeries + 1 ).fill(null);
        normalizedData[i][0] = new Date(parseInt(ts[i], 10));
    }

    queryResults.sort((a, b) => a.mid.localeCompare(b.mid));
    options.axes.y.tickFormat.max = yMax;
    options.axes.y.tickFormat.min = min['y1'];
    options.axes.y2.tickFormat.max = y2Max;
    options.axes.y2.tickFormat.min = min['y2'];

            // sometimes opentsdb returns empty results
            // reset series in state
            options.series = {};
            const colors = {};
            const dseries = [];
            for ( let i = 0;  i < queryResults.length; i++ ) {
                const [ source, mid ] = queryResults[i].source.split(':');
                const midExToT = mid.split('-')[0];
                const tot = mid.split('-')[1] || '';
                if ( source === 'summarizer') {
                    continue;
                }
                let totLabel = tot;
                if ( totLabel ) {
                    const totregres = /(\d+)?(\w)/.exec(totLabel);
                    const totVal = totregres[1] ? parseInt(totregres[1], 10) : 1;
                    const totPeriod = totregres[2];
                    totLabel = ' [' + totVal + '-' + periods[totPeriod] + (totVal > 1 ? 's' : '') + ' ago]';
                }
                totLabel = totLabel ? totLabel : '';
                const qids = this.REGDSID.exec(mid);
                const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
                const mIndex = this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
                const timeSpecification = queryResults[i].timeSpecification;
                const qid = widget.queries[qIndex].id;
                const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
                const mConfig = gConfig && widget.queries[qIndex].metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : {};
                const vConfig = mConfig && mConfig.settings ? this.util.deepClone(mConfig.settings.visual) : {};
                vConfig.type = hasToT ? 'line' : vConfig.type;
                const n = queryResults[i].data.length;

                if ( vConfig.color && vConfig.color !== 'auto' ) {
                    colors[midExToT] = midExToTNSeries[midExToT] === 1 ? [vConfig.color] : this.util.getColorsHSV( vConfig.color , midExToTNSeries[midExToT] ).reverse();
                } else if ( vConfig.scheme && vConfig.scheme !== 'auto' ) {
                    colors[midExToT] = this.util.getColorsFromScheme(vConfig.scheme, midExToTNSeries[midExToT]);
                    schemeMeta[mid] = true;
                }
                for ( let j = 0; j < n; j ++ ) {
                    const data = queryResults[i].data[j].NumericType;
                    const tags = queryResults[i].data[j].tags;
                    const hash = JSON.stringify(tags);
                    const mLabel = this.util.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
                    const metric = vConfig.label ? vConfig.label : mConfig.expression ? mLabel : queryResults[i].data[j].metric;
                    if ( gConfig && gConfig.settings.visual.visible && vConfig.visible ) {
                        const aggData = dict[mid]['summarizer'][hash];
                        const config: any = {
                            strokeWidth: vConfig.lineWeight ? parseFloat(vConfig.lineWeight) : 1,
                            strokePattern: this.getStrokePattern(vConfig.lineType),
                            // color: vConfig.color && vConfig.color !== 'auto' && n === 1 ? vConfig.color : '',
                            fillGraph: vConfig.type === 'area' ? true : false,
                            isStacked: vConfig.type === 'area' && vConfig.stacked !== 'false' ? true : false,
                            axis: !vConfig.axis || vConfig.axis === 'y1' ? 'y' : 'y2',
                            metric: metric,
                            tags: { metric: !mConfig.expression ?
                                    queryResults[i].data[j].metric : mLabel, ...tags},
                            aggregations: aggData,
                            group: vConfig.type ? vConfig.type : 'line',
                            order1:  vConfig.type !== 'line' ? '1' + '-' + qIndex + '-' + mIndex  : '0-' + qIndex + '-' + mIndex   + '-' + tot,
                            stackOrderBy: vConfig.type === 'line' ? 'label' : vConfig.stackOrderBy || 'min',
                            stackOrder: vConfig.stackOrder || 'asc',
                            connectMissingData: vConfig.connectMissingData === 'true' ? true : false
                        };
                        if ( vConfig.type === 'bar') {
                            config.plotter = barChartPlotter;
                        } else if ( vConfig.type === 'area' && vConfig.stacked !== 'false' ) {
                            config.plotter = stackedAreaPlotter;
                        } else {
                            groups['line'] = true;
                        }
                        config.label = this.getLableFromMetricTags(vConfig.label ? vConfig.label : '', config.tags) + totLabel;
                        dseries.push({  mid: mid,
                                        config: config,
                                        data: data,
                                        hash: this.getHashFromMetricAndTags(mConfig.expression ? mLabel : queryResults[i].data[j].metric, tags),
                                        timeSpecification: timeSpecification});
                }
            }
        }

        // sort the data
        intermediateTime = new Date().getTime();
            // if ( !hasToT ) {
            dseries.sort((a: any, b: any) => {
                // area/bar plotter draws the series from last to first
                return  ( a.config.group.localeCompare(b.config.group) ||
                                    (a.config.order1.localeCompare(b.config.order1, 'en', { numeric: true, sensitivity: 'base' }))) ||
                                    ( a.config.group === 'line'  ? a.config.label.localeCompare(b.config.label) :
                                    // the order is reverse as the area/bar plotter draws series from last to first
                                    (a.config.aggregations ? ( a.config.group === 'line' || (a.config.group !== 'line' && a.config.stackOrder === 'desc') ? a.config.aggregations[a.config.stackOrderBy] - b.config.aggregations[b.config.stackOrderBy] : b.config.aggregations[b.config.stackOrderBy] - a.config.aggregations[a.config.stackOrderBy]) : 0));
            });
        // }
        // console.debug(widget.id, "time taken for sorting data series(ms) ", new Date().getTime() - intermediateTime );
        intermediateTime = new Date().getTime();
        // reset visibility, instead of constantly pushing (which causes it to grow in size if refresh/autorefresh is called)
        options.visibility = [];
        let newVisibilityHash: any = {};
        let cIndex = 0;
        const autoColors = this.util.getColors();
        for ( let i = 0; i < dseries.length; i++ ) {
            const label = options.labels.length.toString();
            const mid = dseries[i].mid;
            const midExToT = dseries[i].mid.split('-')[0];
            options.labels.push(label);
            if ( options.visibilityHash[dseries[i].hash] !== undefined ) {
                options.visibility.push(options.visibilityHash[dseries[i].hash]);
            } else {
                options.visibility.push(true);
            }
            newVisibilityHash[dseries[i].hash] = options.visibility[i];
            options.series[label] = dseries[i].config;
            options.series[label].color = colors[midExToT] ? colors[midExToT].pop() : autoColors[cIndex++ % nAutoColors];
            options.series[label].hash = dseries[i].hash;
            const seriesIndex = options.labels.indexOf(label);
            const axis = dseries[i].config.axis;
            const unit = dseries[i].timeSpecification.interval.replace(/[0-9]/g, '');
            const m = parseInt(dseries[i].timeSpecification.interval, 10);
            const numPoints = dseries[i].data.length;
            const type = dseries[i].config.group;
            const data = dseries[i].data;
            for (let k = 0; k < numPoints; k++) {
                const secs = dseries[i].timeSpecification.start + (m * k * mSeconds[unit]);
                const ms = secs * 1000;
                const tsIndex = tsObj[ms];
                if ( tsIndex !== undefined ) {
                    normalizedData[tsIndex][seriesIndex] = !isNaN(data[k]) ? data[k] : ( dseries[i].config.connectMissingData ? null : NaN );
                }
                if ( isStacked && !isNaN(data[k]) && ( (type === 'area' && dseries[i].config.isStacked) || type === 'bar') ) {
                    if ( data[k] > 0) {
                        xAggs['max'][type][axis][k] += data[k];
                    } else {
                        xAggs['min'][type][axis][k] += data[k];
                    }
                }
            }
        }
        options.visibilityHash = newVisibilityHash;
        // console.debug(widget.id, "time taken for finding min, max(ms)", new Date().getTime() - intermediateTime );

        if (isStacked) {
            for ( let i = 0; i < stackedYAxes.length; i++ ) {
                const axis = stackedYAxes[i];
                let axisMax = d3.max([...xAggs['max']['area'][axis], ...xAggs['max']['bar'][axis]]);
                let axisMin = d3.min([...xAggs['min']['area'][axis], ...xAggs['min']['bar'][axis]]);
                const axisConfig = widget.settings.axes[stackedYAxes[i] === 'y' ? 'y1' : 'y2'];

                if ( stackedYAxes[i] === 'y' ) {
                    axisMax = yMax > axisMax ? yMax : axisMax;
                    axisMin = min['y1'] < axisMin ? min['y1'] : axisMin;
                    yMax = axisMax;
                }
                if ( stackedYAxes[i] === 'y2' ) {
                    axisMax = y2Max > axisMax ? y2Max : axisMax;
                    axisMin = min['y2'] < axisMin ? min['y2'] : axisMin;
                    y2Max = axisMax;
                }

                if ( isNaN(parseFloat( axisConfig.max)) ) {
                    options.axes[axis].valueRange[1] = axisMax + axisMax * 0.05;
                }

                if ( isNaN(parseFloat( axisConfig.min)) ) {
                    options.axes[axis].valueRange[0] = axisMin < 0  ? Math.ceil(axisMin + axisMin * 0.05) : axisConfig.scale === 'logscale' ? null : 0;
                }
            }
        }

        if ( options.axes.y.valueRange[0] !== null && options.axes.y.valueRange[0] >= yMax ) {
            options.axes.y.valueRange[0] = null;
        }

        if ( options.axes.y2.valueRange[0] !== null && options.axes.y2.valueRange[0] >= y2Max ) {
            options.axes.y2.valueRange[0] = null;
        }
        // console.debug(widget.id, "time taken on data transformer(ms) ", new Date().getTime() - startTime );
        return [...normalizedData];
    }

    getHashFromMetricAndTags(metric, tags) {
        let res = metric;
        if (tags) {
            let keys = Object.keys(tags);
            keys = keys.sort();
            for ( let i = 0; i < keys.length; i++ ) {
                const key = keys[i];
                res += '-' + key + ':' + tags[keys[i]];
            }
        }
        return res;
    }

  yamasToHeatmap(widget, options: IDygraphOptions, normalizedData: any[], result: any): any {

    normalizedData = [];
    options.series = {};
    const mSeconds = { 's': 1, 'm': 60, 'h': 3600, 'd': 86400 };
    options.plotter = heatmapPlotter;
    let cIndex = 0;
    let min = Infinity, max = -Infinity;
    // find min and max from the series. used in yaxis range

    if ( result && result.results ) {
        // sometimes opentsdb returns empty results
        for ( let i = 0;  i < result.results.length; i++ ) {
            // skip if no data
            if (result.results[i].data.length === 0) {
                continue;
            }
            const queryResults = result.results[i];
            const [ source, mid ] = queryResults.source.split(':');
            if ( source === 'summarizer') {
                continue;
            }
            const qids = this.REGDSID.exec(mid);
            const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
            const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
            const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
            const mConfig = gConfig && gConfig.metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : null;
            const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
            const n = queryResults.data.length;
            for ( let j = 0; j < n; j ++ ) {
                const data = queryResults.data[j].NumericType;
                const numPoints = data.length;
                if ( gConfig && gConfig.settings.visual.visible && vConfig.visible ) {
                    for (let k = 0; k < numPoints ; k++ ) {
                        if (!isNaN(data[k]) && data[k] < min) {
                            min = data[k];
                        }
                        if (!isNaN(data[k]) && data[k] > max) {
                            max = data[k];
                        }
                    }
                }
            }
        }
    }
    options.axes.y.valueRange = [Math.floor(min), Math.ceil(max)];
    options.labels = ['x'].concat( Array.from( Array(options.heatmap.buckets), (x, index) => (index + 1).toString()));
    options.heatmap.x = [];

    const y = d3.scaleQuantize()
                .domain([min, max])
                .range(Array.from( Array(options.heatmap.buckets), (x, index) => (index + 1)));

    const autoColors =  ['#3F00FF']; // we support single metric on heatmap, use this.util.getColors if multiple

    if ( result && result.results ) {
        // sometimes opentsdb returns empty results
        for ( let i = 0;  i < result.results.length; i++ ) {
            if (result.results[i].data.length === 0) {
                continue;
            }
            const queryResults = result.results[i];
            const [ source, mid ] = queryResults.source.split(':');
            const qids = this.REGDSID.exec(mid);
            const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
            const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );

            const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
            const mConfig = gConfig && gConfig.metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : null;
            const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
            if ( source === 'summarizer' || !gConfig || !gConfig.settings.visual.visible || !vConfig.visible) {
                continue;
            }

            const timeSpecification = queryResults.timeSpecification;
            const n = queryResults.data.length;
            const color = !widget.settings.visual.color ? autoColors[cIndex++] : widget.settings.visual.color;
            options.heatmap.nseries = n;
            options.heatmap.color = color;
            for ( let j = 0; j < n; j ++ ) {
                const data = queryResults.data[j].NumericType;
                const tags = queryResults.data[j].tags;
                const numPoints = data.length;
                const mLabel = this.util.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
                options.heatmap.metric = mConfig.expression ?  mLabel  : queryResults.data[j].metric;
                    let label = vConfig.label ? vConfig.label : '';
                    label = this.getLableFromMetricTags(label, { metric: !mConfig.expression ? queryResults.data[j].metric : mLabel, ...tags});
                    const unit = timeSpecification.interval.replace(/[0-9]/g, '');
                    const m = parseInt(timeSpecification.interval, 10);
                    for (let k = 0; k < numPoints ; k++ ) {
                        const time = (timeSpecification.start + ( m * k * mSeconds[unit] )) * 1000;
                        if (!Array.isArray(normalizedData[k])) {
                            normalizedData[k] = Array( options.heatmap.buckets + 1 ).fill(null);
                            normalizedData[k][0] = new Date(time);
                            options.heatmap.x.push(time);
                        }
                            if ( !isNaN(data[k]) ) {
                                const bucket = y(data[k]);
                                    normalizedData[k][bucket] += 1;
                                if (!options.series[bucket]) {
                                    options.series[bucket] = {};
                                }
                                if (!options.series[bucket][time]) {
                                    options.series[bucket][time] = [];
                                }
                                options.series[bucket][time].push({label: label, v: data[k], tags: tags });
                            }
                    }
            }
        }
    }


    // ranking
    const bucketValues = [];
    for ( let i = 0; i < normalizedData.length; i++ ) {
        for ( let j = 1; j < normalizedData[i].length; j++ ) {
            if ( normalizedData[i][j] !== null && !bucketValues.includes(normalizedData[i][j]) ) {
                bucketValues.push(normalizedData[i][j]);
            }
        }
    }
    bucketValues.sort((a, b) => a - b);
    options.heatmap.bucketValues = bucketValues;
    return [...normalizedData];
  }

    yamasToChartJS( chartType, options, widget, data, queryData, stacked = false ) {
        switch ( chartType ) {
            case 'bar':
                return this.getChartJSFormattedDataBar(options, widget, data, queryData, stacked);
            case 'horizontalBar':
                return this.getChartJSFormattedDataBar(options, widget, data, queryData, stacked);
        }
    }

    /**
     * converts data to chartjs bar or stacked bar chart format
     *
     * Stacked bar chart - datasets format
     *   [ dataset-1, dataset-2, .. ] where
     *   dataset-x format is:
     *       {
     *           data: [ {x:"x1", y: 20} , {x:"x2", y: 30}, .. ],
     *           backgroundColor: '#ccc'
     *       }
     *   We wanted to stack based on stack labels.
     *   So, we are going to generate series for each stack labels.
     */

    getChartJSFormattedDataBar( options, widget, datasets, queryData, stacked ) {
        if ( queryData === undefined || !queryData.results || !queryData.results.length ) {
            return datasets;
        }

        options.scales.xAxes[0].stacked = stacked;
        options.scales.yAxes[0].stacked = stacked;

        datasets[0] = {data: [], backgroundColor: [], tooltipData: []};
        options.labels = [];
        let nAutoColors = 0;
        const results = queryData.results ? queryData.results : [];
        const dseries = [];
        const schemeMeta = { 'colors': {}, 'midScheme': {}, 'schemeN': {}};
        const colors = {};
        for ( let i = 0;  i < results.length; i++ ) {
            const [source, mid ] = results[i].source.split(':');
            if ( source !== 'summarizer') {
                continue;
            }
            const qids = this.REGDSID.exec(mid);
            const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
            const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
            const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
            const mConfig = widget.queries[qIndex] && widget.queries[qIndex].metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : null;
            const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
            if ( !gConfig || !mConfig || !gConfig.settings.visual.visible || !mConfig.settings.visual.visible ) {
                continue;
            }
            const n = results[i].data.length;
            if ( !vConfig.color && ( !vConfig.scheme || vConfig.scheme === 'auto') ) {
                nAutoColors += n;
            } else if ( vConfig.scheme && vConfig.scheme !== 'auto' ) {
                colors[mid] = this.util.getColorsFromScheme(vConfig.scheme, n);
                schemeMeta['midScheme'][mid] = { scheme: vConfig.scheme, n: n };
            } else {
                colors[mid] = n === 1 ? [vConfig.color] : this.util.getColorsHSV( vConfig.color, n );
            }
            for ( let j = 0;  j < n; j++ ) {
                const summarizer = this.getSummarizerOption(widget, qIndex, mIndex);
                const aggs = results[i].data[j].NumericSummaryType.aggregations;
                const tags = results[i].data[j].tags;
                const key = Object.keys(results[i].data[j].NumericSummaryType.data[0])[0];
                const aggData = results[i].data[j].NumericSummaryType.data[0][key];
                const mLabel = this.util.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
                let label = mConfig.settings.visual.label ? mConfig.settings.visual.label : '';
                const aggrIndex = aggs.indexOf(summarizer);
                label = this.getLableFromMetricTags(label, { metric: !mConfig.expression ? results[i].data[j].metric : mLabel, ...tags});
                dseries.push({  mid: mid, order: qIndex + '-' + mIndex, label: label, value: aggData[aggrIndex], tooltipData: { metric: !mConfig.expression ? results[i].data[j].metric : mLabel, ...tags } });
            }
        }

        let cIndex = 0;
        const autoColors =  this.util.getColors();
        // assing colors based on value
        dseries.sort((a: any, b: any) => {
            return  a.value - b.value;
        });

        for ( let i = 0; i < dseries.length; i++ ) {
            const mid = dseries[i].mid;
            options.labels.push(dseries[i].label);
            datasets[0].data.push(dseries[i].value);
            datasets[0].backgroundColor.push( colors[mid] ? (schemeMeta['midScheme'][mid] ? colors[mid].shift() : colors[mid].pop()) : autoColors[ cIndex++ % nAutoColors ]);
            datasets[0].tooltipData.push(dseries[i].tooltipData);
        }
        return [...datasets];
    }

    getLableFromMetricTags(label, tags, len= 70 ) {
        const regex = /\{\{([\w-.:\/]+)\}\}/ig
        label = label.trim();
        const matches = label.match(regex);
        if ( matches ) {
            for ( let i = 0, len = matches.length; i < len; i++ ) {
                const key = matches[i].replace(/\{|\}/g,'');
                label = label.replace(matches[i], tags[key]? tags[key] : '');
            }
        } else if ( !label ) {
            label = tags.metric;
            for ( let k in tags ) {
                if ( k !== 'metric' ) {
                    label = label + '-' + tags[k];
                }
            }
        }
        label = label.length > len ? label.substr(0, len - 2) + '..' : label;
        return label;
    }

    yamasToD3Donut(options, widget, queryData) {
        options.data = [];
        if ( queryData === undefined || !queryData.results || !queryData.results.length ) {
            return {...options};
        }
        const results = queryData.results ? queryData.results : [];
        const dseries = [];
        let nAutoColors = 0;
        const schemeMeta = { 'colors': {}, 'midScheme': {}, 'schemeN': {}};
        const colors = {};
        for ( let i = 0; i < results.length; i++ ) {
            const [source, mid ] = results[i].source.split(':');
            if ( source !== 'summarizer') {
                continue;
            }
            const qids = this.REGDSID.exec(mid);
            const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
            const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
            const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
            const mConfig = widget.queries[qIndex] && widget.queries[qIndex].metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : null;
            const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
            if ( !gConfig || !mConfig || !gConfig.settings.visual.visible || !mConfig.settings.visual.visible ) {
                continue;
            }

            const n = results[i].data.length;
            if ( !vConfig.color && ( !vConfig.scheme || vConfig.scheme === 'auto') ) {
                nAutoColors += n;
            } else if ( vConfig.scheme && vConfig.scheme !== 'auto' ) {
                colors[mid] = this.util.getColorsFromScheme(vConfig.scheme, n);
                schemeMeta['midScheme'][mid] = { scheme: vConfig.scheme, n: n };
            } else {
                colors[mid] =  n === 1 ? [ vConfig.color ] : this.util.getColorsHSV( vConfig.color, n );
            }

            for ( let j = 0; j < n; j++ ) {
                const summarizer = this.getSummarizerOption(widget, qIndex, mIndex);
                const aggs = results[i].data[j].NumericSummaryType.aggregations;
                const tags = results[i].data[j].tags;
                const key = Object.keys(results[i].data[j].NumericSummaryType.data[0])[0];
                const aggData = results[i].data[j].NumericSummaryType.data[0][key];
                const mLabel = this.util.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
                let label = mConfig.settings.visual.label ? mConfig.settings.visual.label : '';
                const aggrIndex = aggs.indexOf(summarizer);
                label = this.getLableFromMetricTags(label, { metric: !mConfig.expression ? results[i].data[j].metric : mLabel, ...tags});
                dseries.push({ mid: mid, label: label, order: qIndex + '-' + mIndex, value: aggData[aggrIndex], tooltipData: tags});
            }
        }

        const autoColors =  this.util.getColors();
        let cIndex = 0;

        // assing colors based on value desc
        dseries.sort((a: any, b: any) => {
            return  b.value - a.value;
        });

        for ( let i = 0; i < dseries.length; i++ ) {
            const mid = dseries[i].mid;
            options.data.push( { label: dseries[i].label, value: dseries[i].value,
                                    color: colors[mid] ? (schemeMeta['midScheme'][mid] ? colors[mid].shift() : colors[mid].pop()) : autoColors[ cIndex++ % nAutoColors ],
                                    tooltipData: dseries[i].tooltipData } );
        }

        return {...options};
    }

    yamasToD3Bar(options, widget, queryData) {
        options.data = [];
        if ( queryData === undefined || !queryData.results || !queryData.results.length ) {
            return {...options};
        }
        const results = queryData.results ? queryData.results : [];

        for ( let i = 0; i < results.length; i++ ) {
            const [source, mid ] = results[i].source.split(':');
            if ( source !== 'summarizer') {
                continue;
            }
            const qids = this.REGDSID.exec(mid);
            const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
            const mIndex =  this.util.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
            const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
            const mConfig = widget.queries[qIndex] && widget.queries[qIndex].metrics[mIndex] ? widget.queries[qIndex].metrics[mIndex] : null;
            if ( !gConfig || !mConfig || !gConfig.settings.visual.visible || !mConfig.settings.visual.visible ) {
                continue;
            }

            const n = results[i].data.length;
            const color =  !widget.settings.visual.color || widget.settings.visual.color === 'auto' ? '' : widget.settings.visual.color;
            for ( let j = 0; j < n; j++ ) {
                const summarizer = this.getSummarizerOption(widget, qIndex, mIndex);
                const aggs = results[i].data[j].NumericSummaryType.aggregations;
                const tags = results[i].data[j].tags;
                const key = Object.keys(results[i].data[j].NumericSummaryType.data[0])[0];
                const aggrIndex = aggs.indexOf(summarizer);
                const aggData = results[i].data[j].NumericSummaryType.data[0][key];
                const mLabel = this.util.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
                let label = mConfig.settings.visual.label ? mConfig.settings.visual.label : '';
                label = this.getLableFromMetricTags(label, { metric: !mConfig.expression ? results[i].data[j].metric : mLabel, ...tags});
                if ( !isNaN(aggData[aggrIndex])) {
                    const o = { label: label, value: aggData[aggrIndex], color: this.overrideColor(aggData[aggrIndex], color, widget.settings.visual.conditions), tooltipData: tags};
                    options.data.push(o);
                }
            }
        }

        return {...options};
    }

    overrideColor(value, color, conditions) {
        value = value.toFixed(2);
        for ( let i = 0; conditions && i < conditions.length ; i++ ) {
            switch( conditions[i].operator ) {
                case 'gt':
                    if ( conditions[i].value !== '' && value > conditions[i].value ) {
                        return conditions[i].color;
                    }
                    break;
                case 'ge':
                    if ( conditions[i].value !== '' && value >= conditions[i].value ) {
                        return conditions[i].color;
                    }
                    break;
                case 'lt':
                    if ( conditions[i].value !== '' && value < conditions[i].value ) {
                        return conditions[i].color;
                    }
                    break;
                case 'le':
                    if ( conditions[i].value !== '' && value <= conditions[i].value ) {
                        return conditions[i].color;
                    }
                    break;
            }
        }
        return color;
    }

    getStrokePattern( lineType ) {
        let pattern = [];
        switch ( lineType ) {
            case 'solid':
                pattern = [];
                break;
            case 'dashed':
                pattern = [4, 4];
                break;
            case 'dotted':
                pattern = [2, 3];
                break;
            case 'dot-dashed':
                pattern = [4, 4, 2];
                break;
        }
        return pattern;
    }

    getSummarizerOption(widget: any, qIndex: number, metricIndex: number) {
        let summarizerOption;
        if (widget.queries[qIndex].metrics[metricIndex].summarizer) {
            summarizerOption = widget.queries[qIndex].metrics[metricIndex].summarizer;
        } else if ( widget.settings.time.downsample.aggregators && widget.settings.time.downsample.aggregators[qIndex]) { // todo: remove once summarizer exposed for all widgets
            summarizerOption = widget.settings.time.downsample.aggregators[qIndex];
        } else {
            summarizerOption = 'avg';
        }
        return summarizerOption;
    }
}
