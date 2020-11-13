// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { environment } from '../../../environments/environment';

interface IQuery {
    id: string;
    type: string;
    metric: any;
    fetchLast: boolean;
    sourceId: any;
    timeShiftInterval?: string;
}

interface IEventQuery {
    id: string;
    namespace: string;
    search: string;
    groupBy?: any[];
    downSample?: any;
}

@Injectable({
  providedIn: 'root'
})
export class YamasService {
    queries: any = [];
    downsample: any;
    time: any;
    tot: any;
    transformedQuery: any;
    // used to map the sub graphs for use in expressions so we can link to the final
    // function in the list.
    metricSubGraphs: any = new Map();
    topnPrefix = 'topn-';
    egadsSlidingWindowPrefix = 'egads-sliding-window-';

    constructor( private utils: UtilsService ) { }

    buildQuery( time, queries, downsample: any = {} , summaryOnly= false, sorting, options) {

        let periodOverPeriodEnabled = false;
        const periodOverPeriod = options && options.periodOverPeriod ? options.periodOverPeriod : {};
        if (periodOverPeriod && Object.keys(periodOverPeriod).length > 0) {
            periodOverPeriodEnabled = true;
        }

        this.downsample = {...downsample};
        this.time = time;
        this.transformedQuery = {
            start: time.start,
            end: time.end,
            executionGraph: []
        };

        this.queries = queries;
        this.metricSubGraphs = new Map();
        const outputIds = [];
        const outputIdToSummarizer = new Map();
        const outputSourceIds = options && options.sources ? options.sources : [];
        this.tot = options.tot ? options.tot : null;
        let querySources = [];
        for ( let i = 0; i < outputSourceIds.length; i++ ) {
            const [qindex, mindex] = this.utils.getMetricIndexFromId(outputSourceIds[i], this.queries);
            this.getMetricSources(qindex, mindex, querySources);
        }

        // time over time
        let totM = 1, totPeriod = 'h', totN = 0;
        if ( this.tot ) {
            const regres = /(\d+)?(\w)/.exec(this.tot.period);
            totM = regres[1] ? parseInt(regres[1], 10) : 1;
            totPeriod = regres[2];
            totN = this.tot.value;
        }

        // add metric definitions
        for ( const i in this.queries ) {
            if ( this.queries[i]) {
                let hasCommonFilter = false;
                const filterId = this.queries[i].filters.length ? 'filter-' + this.queries[i].id  : '';

                this.downsample.aggregator = this.downsample.aggregators ? this.downsample.aggregators[0] : 'avg';

                for (let j = 0; j < this.queries[i].metrics.length; j++) {
                    const id = this.queries[i].metrics[j].id;
                    if ( !this.queries[i].metrics[j].expression && (!querySources.length || querySources.includes(id) ) ) {
                        for ( let k = 0; k <= totN; k++ ) {
                            const timeshift = k === 0 ? '' : (k * totM) + totPeriod;
                            const q: any = this.getMetricQuery(i, j, timeshift);
                            const subGraph = [ q ];
                            if ( this.queries[i].metrics[j].groupByTags && this.queries[i].metrics[j].groupByTags.length && !this.checkTagsExistInFilter(i, this.queries[i].metrics[j].groupByTags) ) {
                                const filter = this.getFilterQuery(i, j);
                                q.filter = filter.filter;
                            } else if ( filterId ) {
                                hasCommonFilter = true;
                                q.filterId = filterId;
                            }

                            const dsId = q.id + '_downsample';
                            subGraph.push(this.getQueryDownSample(downsample, this.downsample.aggregator, dsId, [q.id]));

                            const groupbyId = q.id + '_groupby';
                            const groupByQuery = this.getQueryGroupBy(this.queries[i].metrics[j].tagAggregator, this.queries[i].metrics[j].groupByTags, [dsId], groupbyId);
                            subGraph.push(groupByQuery);

                            let lastId = '';
                            this.getFunctionQueries(i, j, subGraph, q.id);
                            for (const node of subGraph) {
                                lastId = node.id;
                                this.transformedQuery.executionGraph.push(node);
                            }
                            this.metricSubGraphs.set(q.id, subGraph);
                            let outputId = subGraph[subGraph.length - 1].id;

                            if (periodOverPeriodEnabled) { // set egads nodes and outputIds
                                const slidingWindowQuery = this.getPeriodOverPeriodSlidingWindowConfig(periodOverPeriod, lastId, q.id);

                                // todo: insert common filters into PoP query
                                const periodOverPeriodQuery = this.getPeriodOverPeriod(periodOverPeriod, subGraph, time.start, q.id);

                                subGraph.push(slidingWindowQuery);
                                this.transformedQuery.executionGraph.push(slidingWindowQuery);
                                this.transformedQuery.executionGraph.push(periodOverPeriodQuery);
                                outputId = periodOverPeriodQuery.id;
                            } else { // normal query - set outputIds
                                // const outputId = subGraph[subGraph.length - 1].id;
                                // outputIds.push(outputId);

                                if (this.queries[i].metrics[j].summarizer) { // build for summarizer (which works with topN)
                                    outputIdToSummarizer[outputId] = this.queries[i].metrics[j].summarizer;
                                }
                            }
                            if (!outputSourceIds.length || outputSourceIds.includes(id) ) {
                                outputIds.push(outputId);
                            }

                            this.metricSubGraphs.set(q.id, subGraph);
                        }
                    }
                }

                // add common filters
                if ( this.queries[i].filters.length && hasCommonFilter) {
                    if ( !this.transformedQuery.filters ) {
                        this.transformedQuery.filters = [];
                    }
                    const _filter: any = this.getFilterQuery(i);
                    _filter.id = filterId;
                    this.transformedQuery.filters.push(_filter);
                }
            }
        }

        const expNodes = [];
        // add expression definitions
        for ( const i in this.queries ) {
            if ( this.queries[i]) {
                for (let j = 0; j < this.queries[i].metrics.length; j++) {
                    const id = this.queries[i].metrics[j].id;
                    if ( this.queries[i].metrics[j].expression && (!querySources.length || querySources.includes(id) ) ) {
                        for ( let k = 0; k <= totN; k++ ) {
                            const timeshift = k === 0 ? '' : (k * totM) + totPeriod;
                            const q = this.getExpressionQuery(i, j, timeshift);
                            expNodes.push(q);
                            const subGraph: any = [ q ];
                            if ( this.queries[i].metrics[j].tagAggregator ) {
                                const groupbyId = q.id + '_groupby';
                                const groupByQuery = this.getQueryGroupBy(this.queries[i].metrics[j].tagAggregator, this.queries[i].metrics[j].groupByTags, [q.id], groupbyId);
                                subGraph.push(groupByQuery);
                            }

                            this.getFunctionQueries(i, j, subGraph, subGraph[subGraph.length - 1].id);
                            for (const node of subGraph) {
                                this.transformedQuery.executionGraph.push(node);
                            }
                            this.metricSubGraphs.set(q.id, subGraph);
                            let outputId = subGraph[subGraph.length - 1].id;

                            if (periodOverPeriodEnabled) { // set egads nodes and outputIds
                                const nodesExceptSlidingWindow = this.getNodes(q.sources, this.metricSubGraphs);
                                const eId = q.id;

                                const slidingWindowQuery = this.getPeriodOverPeriodSlidingWindowConfig(periodOverPeriod, eId, eId);
                                const periodOverPeriodQuery = this.getPeriodOverPeriod(periodOverPeriod, nodesExceptSlidingWindow.concat(q).concat(slidingWindowQuery) , time.start, q.id, this.transformedQuery.filters);
                                this.transformedQuery.executionGraph.push(slidingWindowQuery);
                                this.transformedQuery.executionGraph.push(periodOverPeriodQuery);
                                outputId = periodOverPeriodQuery.id;
                            } else {
                                // const outputId = subGraph[subGraph.length - 1].id;
                                // outputIds.push(outputId);
                                if (this.queries[i].metrics[j].summarizer) { // build for summarizer (which works with topN)
                                    outputIdToSummarizer[outputId] = this.queries[i].metrics[j].summarizer;
                                }
                            }
                            if (!outputSourceIds.length || outputSourceIds.includes(id) ) {
                                outputIds.push(outputId);
                            }
                        }
                    }
                }
            }
        }

        // replace the sourceid with sourceid of the function definition of metric/expression
        if (periodOverPeriodEnabled) {
            for ( let i = 0; i < expNodes.length; i++ ) {
                expNodes[i].sources = expNodes[i].sources.map(d => {
                                                                    const subGraph = this.metricSubGraphs.get(d);
                                                                    return subGraph[subGraph.length - 2].id;
                                                                });
            }
        } else {
            for ( let i = 0; i < expNodes.length; i++ ) {
                expNodes[i].sources = expNodes[i].sources.map(d => {
                                                                    const subGraph = this.metricSubGraphs.get(d);
                                                                    return subGraph[subGraph.length - 1].id;
                                                                });
            }
        }

        const summarizerIds = [];
        for (const id of outputIds) {
            if (sorting && sorting.order && sorting.limit && outputIdToSummarizer[id]) { // must be sorting and metric has summarizer picked
                this.transformedQuery.executionGraph.push(this.getTopN(sorting.order, sorting.limit, id, outputIdToSummarizer[id]));
                summarizerIds.push(this.topnPrefix + id);
            } else {
                summarizerIds.push(id);
            }
        }

        if (!periodOverPeriodEnabled) {
            this.transformedQuery.executionGraph.push(this.getQuerySummarizer(summarizerIds));
        }

        let serdesConfigsFilter = [... outputIds];
        if (summaryOnly) {
            serdesConfigsFilter = ['summarizer'];
        } else if (!periodOverPeriodEnabled) {
            serdesConfigsFilter.push('summarizer');
        }

        this.transformedQuery.serdesConfigs = [{
            id: 'JsonV3QuerySerdes',
            filter: serdesConfigsFilter
        }];
        this.transformedQuery.logLevel = environment.debugLevel.toUpperCase();
        this.transformedQuery.cacheMode = environment.tsdbCacheMode ?
            environment.tsdbCacheMode.toUpperCase() : null;
        // make this a bit more readable/identifiable in the console
        console.log('%cTSDB QUERY%c' + JSON.stringify(this.transformedQuery),
                    'padding: 4px 32px 0 6px; font-weight: bold; color: #ffffff; background: #008080; clear: both; border-radius: 40% 60% 100% 0% / 30% 100% 0% 70%;',
                    'padding: 6px; border: 3px solid #008080; background: #F5FFFA;'
                    );
        return this.transformedQuery;
    }

    getNodes(graphNames: any[], mapGraph): any[] {
        const nodes: any[] = [];
        for (const g of graphNames) {
            for (const node of mapGraph.get(g)) {
                if (!node.id.startsWith(this.egadsSlidingWindowPrefix + g)) {
                    nodes.push(node);
                }
            }
        }
        return nodes;
    }

    getMetricQuery(qindex, mindex, timeShift ) {
        const mid = this.utils.getDSId(this.queries, qindex, mindex);
        const q: IQuery = {
            id: mid + ( timeShift ? '-' + timeShift : '' ) , // using the loop index for now, might need to generate its own id
            type: 'TimeSeriesDataSource',
            metric: {
                type: 'MetricLiteral',
                metric:  this.queries[qindex].namespace + '.' + this.queries[qindex].metrics[mindex].name
            },
            sourceId: environment.tsdbSource ? environment.tsdbSource : null,
            fetchLast: false,
        };

        timeShift = timeShift ? timeShift : this.utils.getTotalTimeShift(this.queries[qindex].metrics[mindex].functions);
        if (timeShift) {
            q.timeShiftInterval = timeShift;
        }

        return q;
    }

    getTopN(order: string, count: number, source: string, aggregator: string) {

        let _order = true;  // true is topN
        if (order.toLowerCase() === 'bottom') {
            _order = false;
        }

        return {
            'id': this.topnPrefix + source,
            'type': 'topn',
            'sources': [source],
            'aggregator': aggregator,
            'top': _order,
            'count': count
        };
    }

    getFilterQuery(qindex, mindex = -1) {
        const filters = this.queries[qindex].filters ? this.transformFilters(this.queries[qindex].filters) : [];
        const groupByTags = this.queries[qindex].metrics[mindex] ? this.queries[qindex].metrics[mindex].groupByTags : [];
        let filter: any = {
                        filter : {
                            type: 'Chain',
                            op: 'AND',
                            filters: filters
                        }
                    };
        // add groupby tags to filters if its not there
        for ( let i = 0;  groupByTags && i < groupByTags.length; i++ ) {
            const index = this.queries[qindex].filters.findIndex(d => d.tagk === groupByTags[i]);
            if ( index === -1 ) {
                filter.filter.filters.push( this.getFilter(groupByTags[i], 'regexp(.*)'));
            }
        }
        if ( this.queries[qindex].settings.explicitTagMatch ) {
            filter = { filter : { type: 'ExplicitTags', filter: filter.filter } };
        }
        return filter;
    }

    getPeriodOverPeriodSlidingWindowConfig(periodOverPeriodConfig, last_source: string, metric_id: string) {
        const slidingWindowConfig = {
            'id': this.egadsSlidingWindowPrefix + metric_id ,
            'type': 'MovingAverage',
            'sources': [
                last_source
            ],
            'samples': 0,
            'interval': periodOverPeriodConfig.slidingWindow + 's',
            'alpha': 0.0,
            'median': false,
            'weighted': periodOverPeriodConfig.algorithm === 'ewma',
            'exponential': periodOverPeriodConfig.algorithm === 'ewma',
            'averageInitial': true,
            'infectiousNan': false
        };
        return slidingWindowConfig;
    }

    getPeriodOverPeriod(periodOverPeriodConfig, subgraph: any [], startTime: string, qId: string, filters = []) {
        const executionGraph = subgraph;

        const baselineQuery = {
            start: startTime,
            filters: filters,
            mode: 'SINGLE',
            timezone: null,
            cacheMode: null,
            executionGraph: executionGraph,
            serdesConfigs: [],
            logLevel: 'ERROR',
            traceEnabled: false,
            debugEnabled: false,
            warnEnabled: false
        };

        const egadsConfig = {
            'id': 'egads-' + qId,
            'type': 'OlympicScoring',
            'sources': [
                this.egadsSlidingWindowPrefix + qId
            ],
            'mode': 'CONFIG',
            'baselineQuery': baselineQuery,
            'baselinePeriod': periodOverPeriodConfig.period + 's',
            'baselineNumPeriods': parseInt(periodOverPeriodConfig.lookbacks, 10),
            'baselineAggregator': 'avg',
            'excludeMax': parseInt(periodOverPeriodConfig.highestOutliersToRemove, 10),
            'excludeMin': parseInt(periodOverPeriodConfig.lowestOutliersToRemove, 10),
            'upperThresholdBad': parseInt(periodOverPeriodConfig.badUpperThreshold, 10),
            'upperThresholdWarn': parseInt(periodOverPeriodConfig.warnUpperThreshold, 10),
            'lowerThresholdBad': parseInt(periodOverPeriodConfig.badLowerThreshold, 10),
            'lowerThresholdWarn': parseInt(periodOverPeriodConfig.warnLowerThreshold, 10),
            'upperIsScalar': periodOverPeriodConfig.upperThresholdType === 'value',
            'lowerIsScalar': periodOverPeriodConfig.lowerThresholdType === 'value',
            'serializeObserved': true,
            'serializeThresholds': false,
            'interpolatorConfigs': [
                {
                'fillPolicy': 'nan',
                'realFillPolicy': 'PREFER_NEXT',
                'dataType': 'net.opentsdb.data.types.numeric.NumericType'
                }
            ]
        };

        return egadsConfig;
    }

    addTagGroupByFilters( filter, groupByTags ) {
        const gFilters = [];
    }

    getSourceIndexById(qindex, id) {
        const index = this.queries[qindex].metrics.findIndex(d => d.id === id );
        return index;
    }

    /**
     * Appends nodes to, inserts nodes in or modifies the sub graph with functions
     * where appropriate. Note the caller will serialize the last entry in this
     * sub graph.
     * @param qindex The query index.
     * @param index The metric index.
     * @param subGraph The sub graph.
     */
    getFunctionQueries(qindex, index, subGraph, idPrefix ) {
        const funs = this.queries[qindex].metrics[index].functions || [];
        let nFnRollup = 0;
        for ( let i = 0; i < funs.length; i++ ) {
            switch ( funs[i].fxCall ) {
                // Rate and Difference
                case 'TotalUsingBaseInterval':
                case 'RateOfChange':  // old
                case 'Rate':
                case 'RateDiff':      // old
                case 'ValueDiff':
                case 'CounterToRate': // old
                case 'CntrRate':
                case 'CounterDiff':   // old
                case 'CounterValueDiff':
                    this.handleRateFunction(idPrefix, subGraph, funs, i);
                    break;
                // Smoothing
                case 'EWMA':
                case 'Median':
                    this.handleSmoothingFunction(idPrefix, subGraph, funs, i);
                    break;
                case 'Rollup':
                    // tslint:disable-next-line:prefer-const
                    let [ aggregator, ds ] = funs[i].val.split(',').map(d => d.trim());
                    if ( aggregator ) {
                        ds = ds || 'auto';
                        nFnRollup++;
                        const override = nFnRollup === 1 && this.queries[qindex].metrics[index].expression === undefined;
                        // first rollup function overrides the metric downsample
                        if ( override ) {
                            const nindex = subGraph.findIndex(d => d.id.indexOf('_downsample') !== -1 );
                            const node = subGraph[nindex];
                            node.aggregator = aggregator;
                            node.interval = ds;
                        } else {
                            const dsNodes = subGraph.filter(d => d.id.indexOf('_downsample') !== -1 );
                            // subGraph[0].id will have metric or expression definition
                            const id = subGraph[0].id + '_downsample' + ( dsNodes.length === 0 ? '' : '_' + dsNodes.length );
                            subGraph.push(this.getQueryDownSample({value: ds}, aggregator, id, [subGraph[subGraph.length - 1].id]));
                        }
                    }
                    break;

                // timeshift
                case 'Timeshift':
                    break;
            }
        }
    }

    handleRateFunction(idPrefix, subGraph, funs, i) {
        const rates = funs[i].val.split(',');
        let func = {
            'id': this.generateNodeId(idPrefix + '-rate', subGraph),
            'type': 'rate',
            'interval': rates[0],
            'dataInterval': rates.length > 1 ? rates[1] : null,
            'counter': false,
            'dropResets': false,
            'deltaOnly': false,
            'rateToCount': false,
            'sources': [ subGraph[subGraph.length - 1].id ]
        };
        switch ( funs[i].fxCall ) {
            case 'TotalUsingBaseInterval':
                // set downsample aggregator=sum, ascount def. should be after the metric def.
                func.rateToCount = true;
                func.sources = [subGraph[0].id];
                const nindex = subGraph.findIndex(d => d.id.indexOf('_downsample') !== -1 );
                if ( nindex !== -1 ) {
                    const node = subGraph[nindex];
                    node.aggregator = 'sum';
                    node.sources = [ func.id ];
                }
                subGraph.splice(1, 0, func);
                func = null;
                break;
            case 'RateOfChange':
            case 'Rate':
                func.deltaOnly = false;
                break;
            case 'RateDiff': // old name
            case 'ValueDiff':
                func.deltaOnly = true;
                break;
            case 'CounterToRate':
            case 'CntrRate':
                func.counter = true;
                func.dropResets = true;
                func.deltaOnly = false;
                // run before downsampling by so we downsample and group the rates, but only if the previous
                // node wasn't an expression.
                if (subGraph[subGraph.length - 1].type.toLowerCase() !== 'expression') {
                    const dsIdx = this.findNode('downsample', subGraph);
                    if (dsIdx < 0) {
                        console.error('Couldn\'t find a downsample node?? ' + JSON.stringify(subGraph));
                        return;
                    } else if (subGraph[1].type === 'rate') {
                        console.error('Already have a counter to rate.');
                    } else {
                        // NOTE: Assumes that 0 is the time series source,
                        // 1 is the downsampler, and anything after is g roup by or functions, etc.
                        func.sources[0] = subGraph[0].id;
                        subGraph[1].sources[0] = func.id;
                        // insert it
                        subGraph.splice(1, 0, func);
                    }
                    func = null;
                }
                break;
            case 'CounterDiff': // old name
            case 'CounterValueDiff':
                func.counter = true;
                func.dropResets = true;
                func.deltaOnly = true;
                break;
        }
        if (func != null) {
            subGraph.push(func);
        }
    }

    handleSmoothingFunction(idPrefix, subGraph, funs, i) {
        const interval_pattern = RegExp(/^\d+[a-zA-Z]$/);
        const func = {
            'id': this.generateNodeId(idPrefix + '-smooth', subGraph),
            'type': 'MovingAverage', // TODO - other types when we have em
            'interval': null,
            'samples': null,
            'alpha': 0.0,
            'weighted': false,  // TODO if we add WMA only
            'exponential': true, // TODO if we add WMA only
            'median': false,
            'sources': [ subGraph[subGraph.length - 1].id ]
        };
        switch ( funs[i].fxCall ) {
            case 'EWMA':
                const parts = funs[i].val.split(',');
                if (parts.length > 1) {
                    // we have an alpha
                    if (interval_pattern.test(parts[0])) {
                        func.interval = parts[0];
                    } else {
                        func.samples = parts[0];
                    }
                    func.alpha = parts[1];
                } else if (parts.length === 1) {
                    if (interval_pattern.test(parts[0])) {
                        func.interval = parts[0];
                    } else {
                        func.samples = parts[0];
                    }
                } else {
                    // nothing, use some defaults.
                    func.samples = 5;
                }
                break;
            case 'Median':
                func.samples = funs[i].val;
                func.exponential = false;
                func.median = true;
                break;
        }
        subGraph.push(func);
    }

    /**
     * Searches the sub graph for the given node type and returns the index if found.
     * @param type The type of node, e.g. "downsample" or "rate"
     * @param subGraph The sub graph.
     */
    findNode(type, subGraph) {
        for (var i = 0; i < subGraph.length; i++) {
            if (subGraph[i].type.toLowerCase() === type) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Searches the sub graph for the given ID in node sources. If found, replaces
     * the ID with the given replacement.
     * @param original The original ID to look for
     * @param replacement The replacement source ID
     * @param subGraph The sub graph.
     */
    replaceNodeSource(original, replacement, subGraph) {
        for (let node of subGraph) {
            if (node.sources && node.sources.length) {
                for (var i = 0; i < node.sources.length; i++) {
                    if (node.sources[i] === original) {
                        node.sources[i] = replacement;
                    }
                }
            }
        }
    }

    /**
     * Runs through the subgraph looking for nodes that start with the same ID. If found,
     * it will append "_#" and if other similar IDs were found with the same appended value,
     * just increments the number. That way we can chain similar functions.
     * @param id The suggested ID.
     * @param subGraph The sub graph.
     */
    generateNodeId(id, subGraph) {
        var idx = 0;
        const pattern = new RegExp(id + '_(\\d+)');
        for (let node of subGraph) {
            if (node.id === id) {
                // exact match
                idx++;
            } else {
                let matches = pattern.exec(node.id);
                if (matches && matches.length == 2) {
                    if (idx <= parseInt(matches[1])) {
                        idx = parseInt(matches[1]) + 1;
                    }
                }
            }
        }
        if (idx > 0) {
            return id + '_' + idx;
        }
        return id;
    }

    getExpressionQuery(qindex, mindex, timeshift) {
        const config = this.queries[qindex].metrics[mindex];
        let transformedExp = config.expression;
        const eid = this.utils.getDSId(this.queries, qindex, mindex);
        let sources = [];
        const expression = config.expression;

        // replace {{<id>}} with query source id
        const re = new RegExp(/\{\{(.+?)\}\}/, 'g');
        let matches = [];

        while (matches = re.exec(expression)) {
            const id = matches[1];
            const idreg = new RegExp( '\\{\\{' + id + '\\}\\}' , 'g');
            const sourceIdAndType = this.utils.getSourceIDAndTypeFromMetricID(id, this.queries);
            if (!sourceIdAndType.hasOwnProperty('id') || !sourceIdAndType.hasOwnProperty('expression')) {
                continue;
            }
            const sourceId = sourceIdAndType.id + (!timeshift ? '' : '-' + timeshift);
            const isExpression = sourceIdAndType.expression;
            transformedExp = transformedExp.replace(idreg, ' ' + sourceId + ' ' );
            // the source id will be replaced with the sourceid of function definition of the metric/expression later
            sources.push(sourceId);
        }
        const oJoinTags = {};
        const joinTags = config.joinTags || [];
        for ( let i = 0; i < joinTags.length; i++ ) {
            const tag = joinTags[i];
            oJoinTags[tag] = tag;
        }
        const econfig = {
            id: eid + (!timeshift ? '' : '-' + timeshift),
            type: 'expression',
            expression: transformedExp,
            join: {
                type: 'Join',
                joinType: config.joinType ? config.joinType : 'NATURAL_OUTER',
                joins: oJoinTags
            },
            interpolatorConfigs: [{
                dataType: 'numeric',
                fillPolicy: 'NAN',
                realFillPolicy: 'NONE'
            }],
            infectiousNan: this.queries[qindex].settings.infectiousNan ? true : false,
            substituteMissing: true,
            variableInterpolators: {},
            sources: sources
        };
        return econfig;
    }

    transformFilters(fConfigs) {
        let filters = [];
        for (let k = 0;  k < fConfigs.length; k++) {
            const f = fConfigs[k];
            const values = f.filter;
            const filter = values.length === 1 ? [this.getFilter(f.tagk, values[0])] : this.getChainFilter(f.tagk, values);
            filters = filters.concat(filter);
        }
        return filters;
    }

    getFilter(key, v) {
        const filterTypes = {
            'literalor': 'TagValueLiteralOr',
            'wildcard': 'TagValueWildCard',
            'regexp': 'TagValueRegex',
            'librange': 'TagValueLibrange'
        };
        let hasNotOp = false;
        if ( v[0] === '!' ) {
            hasNotOp = true;
            v = v.substr(1);
        }
        const regexp = v.match(/regexp\((.*)\)/);
        let filtertype = 'literalor';
        if (regexp) {
            filtertype = 'regexp';
            v = regexp[1];
        } else if (v.match(/librange\((.*)\)/)) {
            const librange = v.match(/librange\((.*)\)/);
            filtertype = 'librange';
            v = librange[1];
        }
        const filter = {
            type: filterTypes[filtertype],
            filter: v,
            tagKey: key
        };
        return !hasNotOp ? filter : { type: 'NOT', filter: filter };
    }
    getOrFilters(key, values) {
        const filterTypes = { 'literalor': 'TagValueLiteralOr',
            'wildcard': 'TagValueWildCard', 'regexp': 'TagValueRegex', 'librange': 'TagValueLibrange'};
        const filters: any = { };
        const literals: any = { };
        for ( let i = 0, len = values.length; i < len; i++ ) {
            let v = values[i];
            let operator = 'include';
            if ( v[0] === '!' ) {
                operator = 'exclude';
                v = v.substr(1);
            }
            if ( filters[operator] === undefined ) {
                filters[operator] = [];
            }
            const regexp = v.match(/regexp\((.*)\)/);
            let filtertype = 'literalor';
            if (regexp) {
                filtertype = 'regexp';
                v = regexp[1];
            } else if (v.match(/librange\((.*)\)/)) {
                const librange = v.match(/librange\((.*)\)/);
                filtertype = 'librange';
                v = librange[1];
            } else {
                if ( literals[operator] === undefined ) {
                    literals[operator] = [];
                }
                literals[operator].push(v);
            }
            if ( filtertype !== 'literalor' ) {
                const filter = {
                    type: filterTypes[filtertype],
                    filter: v,
                    tagKey: key
                };
                filters[operator].push(filter);
            }
        }

        for ( const operator in literals ) {
            if ( literals[operator].length ) {
                const filter = {
                    type: 'TagValueLiteralOr',
                    filter: literals[operator].join('|'),
                    tagKey: key
                };
                filters[operator].push(filter);
            }
        }

        return filters;
    }

    getChainFilter(key, values) {
        const chainFilters = [];
        const filters = this.getOrFilters(key, values);
        for ( const operator in filters ) {
            if ( filters[operator] ) {
                const filter: any = {
                    'type': 'Chain',
                    'op': 'OR',
                    'filters': filters[operator]
                };
                chainFilters.push(operator === 'include' ? filter : { type: 'NOT', filter: filter } );
            }
        }
        return chainFilters;
    }

    getQueryGroupBy(tagAggregator, tagKeys, sources, id= null) {
        const aggregator =  tagAggregator || 'sum';

        const metricGroupBy =  {
            id: id ? id : 'groupby',
            type: 'groupby',
            aggregator: aggregator,
            tagKeys: tagKeys ? tagKeys : [],
            interpolatorConfigs: [
                {
                    dataType: 'numeric',
                    fillPolicy: 'NAN',
                    realFillPolicy: 'NONE'
                }
            ],
            sources: sources
        };
        return metricGroupBy;
    }

    getQueryDownSample(dsSetting, aggregator, id= null, sources= []) {
        let dsValue = dsSetting.value || 'auto';
        if ('custom' === dsSetting.value) {
            dsValue = dsSetting.customValue + dsSetting.customUnit;
        }
        const downsample =  {
            id: id ? id : 'downsample',
            type: 'downsample',
            aggregator: aggregator || 'avg',
            interval: dsValue, // summary ? '0all' : dsValue,
            runAll: false, // summary ? true : false,
            fill: true,
            minInterval: dsSetting.minInterval,
            reportingInterval: dsSetting.reportingInterval,
            interpolatorConfigs: [
                {
                    dataType: 'numeric',
                    fillPolicy: 'NAN',
                    realFillPolicy: 'NONE'
                }
            ],
            sources: sources
        };
        return downsample; // { downsamples: downsamples, dsIds: ids };
    }

    getQuerySummarizer(sources= []) {
        const summarizer =  {
            id: 'summarizer',
            sources: sources ? sources : ['groupby'],
            summaries: ['avg', 'max', 'min', 'count', 'sum', 'first', 'last'],
        };
        return summarizer;
    }

    checkTagsExistInFilter(qindex, tags) {
        const filters = this.queries[qindex].filters;
        let exists = true;

        for ( let i = 0; i < tags.length; i++ ) {
            const index = filters.findIndex(d => d.tagk === tags[i]);
            if ( index === -1 ) {
                exists = false;
            }
        }
        return exists;
    }

    buildEventsQuery(time, queries: IEventQuery[], limit: number = 50) {
        this.time = time;
        this.transformedQuery = {
            start: time.start,
            end: time.end,
            executionGraph: [],
            filters: [],
            mode: 'SINGLE',
            traceEnabled: false,
            debugEnabled: false,
            warnEnabled: false,
            timezone: null,
            serdesConfigs: [],
            logLevel: 'ERROR',
            cacheMode: null
        };
        this.queries = queries;  // todo? necessary?

        for (const query of queries) {
            const node = {
                id: query.id,
                type: 'TimeSeriesDataSource',
                types: ['events'],
                from: '0',   // todo: what is this?
                size: limit,
                namespace: query.namespace,
                filter: {}
            };

            const filters = [{
                    type: 'PassThrough',
                    filter: query.search.trim() ? query.search : '*:*'
                }];

            node.filter = {
                filters,
                type: 'Chain',
                op: 'AND',
            };
            this.transformedQuery.executionGraph.push(node);
            if ( query.downSample ) {
                this.transformedQuery.executionGraph.push(this.getQueryDownSample(query.downSample, query.downSample.aggregator, null, [query.id]));
            }
        }
        return this.transformedQuery;
    }

    buildStatusQuery( query ) {
        const statusQuery = {
            'start': '1h-ago',
            'executionGraph': [
              {
                'id': 'status1',
                'namespace': query.namespace,
                'type': 'TimeSeriesDataSource',
                'types': [
                  'status'
                ],
                'fetchLast': true,
                'filterId': 'f1'
              }
            ],
            'filters': [
              {
                'id': 'f1',
                'filter': {
                  'filters': [
                    {
                      'type': 'FieldLiteralOr',
                      'key': 'groupBy',
                      'filter': '_alert_id'
                    },
                    {
                      'type': 'FieldLiteralOr',
                      'key': 'statusType',
                      'filter': 'alert'
                    },
                    {
                      'type': 'FieldLiteralOr',
                      'key': 'showSummary',
                      'filter': 'true'
                    },
                    {
                      'type': 'FieldLiteralOr',
                      'key': 'showDetails',
                      'filter': 'false'
                    },
                    {
                        'type': 'FieldLiteralOr',
                        'key': 'limit',
                        'filter': '-1'
                     }
                  ],
                  'op': 'AND',
                  'type': 'Chain'
                }
              }
            ]
          };
        return statusQuery;
    }

    getMetricSources(qindex, mindex, sources) {
        const config = this.queries[qindex].metrics[mindex];
        sources.push(config.id);
        const expression = config.expression;
        if (expression !== undefined ) {
            const re = new RegExp(/\{\{(.+?)\}\}/, 'g');
            let matches = [];
            while (matches = re.exec(expression)) {
                const id = matches[1];
                const [ newQIndex, newMIndex ] = this.utils.getMetricIndexFromId(id, this.queries);
                const newConfig = this.queries[newQIndex].metrics[newMIndex];
                if ( newConfig.expression ) {
                    this.getMetricSources(newQIndex, newMIndex, sources);
                } else {
                    sources.push(newConfig.id);
                }
            }
        }
    }

}
