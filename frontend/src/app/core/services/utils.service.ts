import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _moment from 'moment';
import { isArray } from 'util';
const moment = _moment;

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    constructor(private titleService: Title) { }

    // random generate 6 random chars
    generateId(len: number = 6, excludes = []) {
        const start = 3;
        let id = '';
        while (id.length === 0) {
            id = Math.random().toString(36).substring(start, len + start);
            id = excludes.includes(id) ? '' : id;
        }
        return id;
    }

    getIDs(collection: any[]) {
        const ids = [];
        for (const obj of collection) {
            if (obj.hasOwnProperty('id')) {
                ids.push(obj.id);
            }
        }
        return ids;
    }

    getAllMetrics(queries: any[]) {
        const metrics = [];
        for (const query of queries) {
            metrics.concat(query.metrics);
        }
        return metrics;
    }

    convertPatternTSDBCompat(searchPattern) {
        searchPattern = searchPattern.replace(/\s+/g, '.*');
        if ((searchPattern).search(/^\s*\.\*/) === -1) {
            searchPattern = '.*' + searchPattern;
        }
        if ((searchPattern).search(/\.\*\s*$/) === -1) {
            searchPattern = searchPattern + '.*';
        }
        return searchPattern.toLowerCase();
    }

    // reserve whatever user type as regexp
    convertPattern(searchPattern) {
        searchPattern = searchPattern ? searchPattern.trim() : '';
        if (searchPattern.length === 0) {
            return '.*';
        } else {
            searchPattern = searchPattern.replace(/\s+/g, '.*');
            return searchPattern;
        }
    }

    replaceIdsInExpressions(newID, oldID, metrics) {
        const idreg = new RegExp('\\{\\{' + oldID + '\\}\\}', 'g');
        for (const metric of metrics) {
            if (metric.expression) {
                if (metric.expression.indexOf('{{' + oldID + '}}') !== -1) {
                    metric.expression = metric.expression.replace(idreg, '{{' + newID + '}}');
                }
            }
        }
    }

    modifyWidgets(dashboard: any) {
        // add extra info item behaviors
        for (let i = 0; i < dashboard.widgets.length; i++) {
            const wd: any = dashboard.widgets[i];
            // wd.id = this.utils.generateId(); // we set it manually to test
            const mod = { 'xMd': wd.gridPos.x, 'yMd': wd.gridPos.y, 'dragAndDrop': true, 'resizable': true };
            wd.gridPos = { ...wd.gridPos, ...mod };
        }
        // return dashboard;
    }

    getWidgetQueryStatistics(queries) {
        let metricsVisibleLen = 0;
        let metricsVisibleAutoColorLen = 0;
        const metricsVisibleAutoColorIds = [];
        for (let i = 0; i < queries.length; i++) {
            const qid = queries[i].id;
            for (let j = 0; j < queries[i].metrics.length; j++) {
                const mid = queries[i].metrics[j].id;
                if (queries[i].metrics[j].settings.visual.visible === true) {
                    metricsVisibleLen++;
                    if (queries[i].metrics[j].settings.visual.color === 'auto' || !queries[i].metrics[j].settings.visual.color) {
                        metricsVisibleAutoColorLen++;
                        metricsVisibleAutoColorIds.push(qid + '-' + mid);
                    }
                }

            }
        }
        return {
            nVisibleMetrics: metricsVisibleLen,
            nVisibleAutoColors: metricsVisibleAutoColorLen,
            mVisibleAutoColorIds: metricsVisibleAutoColorIds
        };
    }

    setWidgetMetaData(widget, config) {
        widget.settings = {...widget.settings, ...config};
    }

    setWidgetTimeConfiguration(widget, config) {
        widget.settings.time = {
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

    updateQuery( widget, payload ) {
        const query = payload.query;
        const qindex = query.id ? widget.queries.findIndex(q => q.id === query.id ) : -1;
        if ( qindex === -1 ) {
            query.id = this.generateId(6, this.getIDs(widget.queries));
            widget.queries.push(query);
        } else {
            widget.queries[qindex] = query;
        }
    }

    toggleQueryVisibility(widget, qid) {
        const qindex = widget.queries.findIndex(d => d.id === qid);
        widget.queries[qindex].settings.visual.visible =
            !widget.queries[qindex].settings.visual.visible;
    }

    cloneQuery(widget, qid) {
        const qindex = widget.queries.findIndex(d => d.id === qid);
        if ( qindex !== -1 ) {
            const query = this.getQueryClone(widget.queries, qindex);
            widget.queries.splice(qindex + 1, 0, query);
        }
    }

    deleteQuery(widget, qid) {
        const qindex = widget.queries.findIndex(d => d.id === qid);
        widget.queries.splice(qindex, 1);
    }

    updateQueryVisual(widget, qid, mid, visual, ex= []) {
        const qindex = widget.queries.findIndex(d => d.id === qid);
        for ( let i = 0; i < widget.queries[qindex].metrics.length; i++ ) {
            const id = widget.queries[qindex].metrics[i].id;
            if ( !ex.length || !ex.includes(id)) {
                widget.queries[qindex].metrics[i].settings.visual = { ...widget.queries[qindex].metrics[i].settings.visual, ...visual };
            }
        }
    }

    updateQueryMetricVisual(widget, qid, mid, visual) {
        // toggle the individual query metric
        const qindex = widget.queries.findIndex(d => d.id === qid);
        const mindex = widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        widget.queries[qindex].metrics[mindex].settings.visual = { ...widget.queries[qindex].metrics[mindex].settings.visual, ...visual };
    }

    toggleQueryMetricVisibility(widget, qid, mid) {
        // toggle the individual query metric
        const qindex = widget.queries.findIndex(d => d.id === qid);
        const mindex = widget.queries[qindex].metrics.findIndex(d => d.id === mid);
        widget.queries[qindex].metrics[mindex].settings.visual.visible =
            !widget.queries[qindex].metrics[mindex].settings.visual.visible;
    }

    deleteQueryMetric(widget, qid, mid) {
        // toggle the individual query
        const qindex = widget.queries.findIndex(d => d.id === qid);
        if (widget.queries[qindex]) {
            const mindex = widget.queries[qindex].metrics.findIndex(d => d.id === mid);
            widget.queries[qindex].metrics.splice(mindex, 1);
        }
    }

    toggleQueryInfectiousNan(widget, checked) {
        for ( let i = 0; i < widget.queries.length; i++ ) {
            widget.queries[i].settings.infectiousNan = checked;
        }
    }

    getWidgetMetricDefaultLabel(queries, qIndex, mIndex: number) {
        let m = 0;
        let e = 0;
        for (let i = 0; i < queries[qIndex].metrics.length; i++) {
            const isExpression = queries[qIndex].metrics[i].expression !== undefined;
            if (!isExpression) {
                m++;
            } else {
                e++;
            }
            if (i == mIndex) { // mIndex is string here
                break;
            }
        }
        let label = queries.length > 1 ? 'Q' + (parseInt(qIndex, 10) + 1) + ':' : '';
        label += queries[qIndex].metrics[mIndex].expression ? 'e' + e : 'm' + m;
        return label;
    }

    getDSIndexToMetricIndex(query, dsmindex, type) {
        if (!query) {
            return -1;
        }
        let index = 0;
        let mindex = -1;
        let eindex = -1;
        for (let i = 0; i < query.metrics.length; i++) {
            if (query.metrics[i].expression) {
                eindex++;
            } else {
                mindex++;
            }
            if (type === 'e' && eindex === dsmindex) {
                index = i;
                break;
            } else if (type === 'm' && mindex === dsmindex) {
                index = i;
                break;
            }
        }
        return index;
    }

    getDSId(queries, qindex, mindex) {
        const getUserMetricIndex = function (index) {
            let eIdx = 0;
            let mIdx = 0;
            for (let i = 0; i <= index; i++) {
                if (queries[qindex].metrics[i].expression) {
                    eIdx++;
                } else {
                    mIdx++;
                }
            }
            return queries[qindex].metrics[index].expression ? eIdx : mIdx;
        };
        let mprefix = 'm';
        const qprefix = Object.keys(queries).length > 0 ? 'q' + (parseInt(qindex, 10) + 1) + '_' : '';
        if (queries[qindex].metrics[mindex].expression) {
            mprefix = 'e';
        }
        return qprefix + mprefix + getUserMetricIndex(mindex);
    }

    // searches an array of objects for a specify key value and
    // returns the matched object
    getObjectByKey(objs, key, value) {
        for (let i = 0; i < objs.length; i++) {
            if (objs[i][key] === value) {
                return objs[i];
            }
        }
    }

    // ex: Revenue for {{tag.colo}} and {{tag.hostgroup}} -> Revenue for BF1 and WestCoastCluster
    tagMacro(metric: any, inputString: string): string {
        const regExp = /{{([^}}]+)}}/g; // get chars between {{}}
        const matches = inputString.match(regExp);
        if (matches) {
            const captureGroupToValueMap = {};
            for (let i = 0; i < matches.length; i++) {
                const captureGroup = matches[i];
                const captureGroupSplit = captureGroup.split('.');
                if (captureGroupSplit.length === 1) {
                    return inputString;
                }
                const keyword = captureGroupSplit[0].substring(2).toLowerCase().trim();
                const tagKey = captureGroupSplit[1].substring(0, captureGroupSplit[1].length - 2).toLowerCase().trim();
                captureGroupToValueMap[captureGroup] = captureGroup;

                // get tag values
                if (keyword === 'tag' && tagKey) {
                    for (const [key, value] of Object.entries(metric['tags'])) {
                        if (key.toLowerCase() === tagKey) {
                            captureGroupToValueMap[captureGroup] = value;
                        }
                    }
                }

                // set tag values in string
                for (const [_captureGroup, tagValue] of Object.entries(captureGroupToValueMap)) {
                    inputString = inputString.replace(_captureGroup, tagValue.toString());
                }
            }
        }
        return inputString;
    }

    getArrayAggregate(aggregate, arr) {
        switch (aggregate.toLowerCase()) {
            case 'sum':
                return arr.reduce((a, b) => !isNaN(b) ? a + b : a, 0);
            case 'avg':
                return arr.reduce((a, b) => !isNaN(b) ? a + b : a, 0) / arr.length;
            case 'min':
                return arr.reduce((a, b) => b !== null && !isNaN(b) && a > b ? b : a, Infinity);
            case 'max':
                return arr.reduce((a, b) => b !== null && !isNaN(b) && a < b ? b : a, -Infinity);
            default:
                return null;
        }
    }

    getColors(color = null, n = 1) {
        const colors = [];
        let hue;
        if (color) {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);
            hue = this.rgbToHsv(r, g, b)[0];
        } else {
            hue = 0;
        }

        // saturation & value/brightness ranges
        const srange = [0.9, 0.2], vrange = [0.9, 0.2];

        // no. of colors on light to bright (sBand) and no. of bright to dark (vBand)
        const sBand = Math.ceil(n * 1), vBand = Math.floor(n * 0);
        const sStep = (srange[1] - srange[0]) / sBand;
        const vStep = (vrange[0] - vrange[1]) / vBand;

        // if random color set SV to 0.8
        let s = color ? srange[0] - sStep : 1;
        let v = color ? vrange[0] : 0.9;
        const hueOffset = 1 / (6 * Math.ceil(n / 6));
        for (let i = 0; i < n; i++) {
            if (color) {
                // get the shades
                if (i < sBand) {
                    s = s + sStep;
                } else {
                    v = v - vStep;
                }
            } else {
                // random colors
                hue = i % 6 === 0 ? Math.floor(i / 6) * hueOffset : hue + 1 / 6;
            }
            colors.push(this.rgbToHex(this.hsvToRGB(hue, s, v)));
        }
        return n === 1 ? colors[0] : colors;
    }

    hsvToRGB(h, s, v) {
        let r, g, b;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }

    rgbToHex(rgb) {
        const color = '#' + rgb.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
        return color;
    }

    rgbToHsv(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    // utility to parse hex to rgb
    hexToRgb(hex: string): any {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /* determine whether white or black is appropriate contrast color
        Argument types
        color: string - #hex
        color: object - {r,g,b}
        color: array[3] - [0,0,0]
    */
    findContrastColor(color: any) {
        // if string, convert to rgb array
        if (typeof(color) === 'string' && color[0] === '#') {
            const convColor = this.hexToRgb(color);
            color = [convColor.r, convColor.g, convColor.b];
        }

        // if rgb object, convert to array
        if (typeof(color) === 'object' && color.r && color.g && color.b) {
            color = [color.r, color.g, color.b];
        }

        // catch if its not an array
        if (!Array.isArray(color)) {
            return false;
        }

        // http://www.w3.org/TR/AERT#color-contrast
        const brightness = Math.round(((parseInt(color[0]) * 299) +
                            (parseInt(color[1]) * 587) +
                            (parseInt(color[2]) * 114)) / 1000);

        const contrast: any = {
            hex: (brightness > 125) ? '#000000' : '#ffffff',
            type: (brightness > 125) ? 'black' : 'white'
        };

        contrast.rgb = this.hexToRgb(contrast.hex);

        return contrast;
    }

    arrayUnique(items) {
        items = items.filter((elem, pos, arr) => {
            return arr.indexOf(elem) === pos;
        });
        return items;
    }

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // utility to measure a string's rendered width
    calculateTextWidth(text, fontSize, fontFace) {

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = fontSize + 'px ' + fontFace;

        const textWidth = context.measureText(text).width;
        canvas.remove();

        return textWidth;
    }

    // check if string is numeric
    checkIfNumeric(val: string): boolean {
        return /^\d+$/.test(val);
    }

    // human sort
    sortAlphaNum(a, b) {
        const aa = a.toLowerCase().split(/(\d+)/);
        const bb = b.toLowerCase().split(/(\d+)/);
        for (let x = 0; x < Math.max(aa.length, bb.length); x++) {
            if (aa[x] !== undefined && bb[x] !== undefined && aa[x] !== bb[x]) {
                const cmp1 = (isNaN(parseInt(aa[x], 10))) ? aa[x] : parseInt(aa[x], 10);
                const cmp2 = (isNaN(parseInt(bb[x], 10))) ? bb[x] : parseInt(bb[x], 10);
                if (cmp1 === undefined || cmp2 === undefined) {
                    return aa.length - bb.length;
                } else {
                    return (cmp1 < cmp2) ? -1 : 1;
                }
            }
        }
        return 0;
    }

    getSummarizerForMetric(id, queries) {
        const metric = this.getMetricFromId(id, queries);
        return metric.summarizer ? metric.summarizer : 'avg';
    }

    getSummmarizerDataWithId(id, queries, data) {
        const source = this.getSourceIDAndTypeFromMetricID(id, queries);
        if (source.hasOwnProperty('id')) {
            return this.getSummarizerDataForMetric(data, source.id);
        } else {
            return {};
        }
    }

    getSummarizerDataForMetric(data, tsdbId): any {
        let metric = {};
        if (data) {
            for (let i = 0; data && i < data.length; i++) {
                const [source, mid] = data[i].source.split(':'); // example: summarizer:q1_m2, summarizer:m2
                if ( source !== 'summarizer' ) {
                    continue;
                }
                if (mid === tsdbId) {
                    metric = data[i].data[0];
                    break;
                }
            }
        }
        return metric;
    }

    getMetricFromId(id, queries) {
        // tslint:disable-next-line:forin
        for (let i in queries) {
            for (let j in queries[i].metrics) {
                if (queries[i].metrics[j].id === id) {
                    return queries[i].metrics[j];
                }
            }
        }
        return {};
    }

    getMetricIndexFromId(id, queries) {
        // tslint:disable-next-line:forin
        for (const i in queries) {
            for (const j in queries[i].metrics) {
                if (queries[i].metrics[j].id === id) {
                    return [parseInt(i, 10), parseInt(j, 10)];
                }
            }
        }
        return [];
    }

    getSourceIDAndTypeFromMetricID(metricId, queries) {
        // tslint:disable-next-line:forin
        for (const i in queries) {
            const queryIndex = parseInt(i, 10) + 1;
            let metricIndex = 0;
            let expressionIndex = 0;
            for (let j = 0; j < queries[i].metrics.length; j++) {
                // calculate expression, metric indexes
                if (queries[i].metrics[j].expression) {
                    expressionIndex++;
                } else {
                    metricIndex++;
                }

                if (queries[i].metrics[j].id === metricId) {
                    if (queries[i].metrics[j].expression) {
                        // tslint:disable-next-line:max-line-length
                        return { id: 'q' + queryIndex + '_' + 'e' + expressionIndex, qIndex: queryIndex - 1, mIndex: metricIndex - 1, expression: true };
                    } else {
                        // tslint:disable-next-line:max-line-length
                        return { id: 'q' + queryIndex + '_' + 'm' + metricIndex, qIndex: queryIndex - 1, mIndex: metricIndex - 1, expression: false };
                    }
                }
            }
        }
        return {};
    }

    arrayToObject(arr) {
        const obj = {};
        for (let i = 0; i < arr.length; i++) {
            obj[i] = arr[i];
        }
        return obj;
    }

    transformTagMapToArray(map: Map<any, any>): any[] {
        const ret = [];

        Object.keys(map).forEach(function (key) {
            ret.push({
                key: key.toString(),
                value: map[key].toString()});

        });
        return ret;
    }

    getQueryClone(queries, index) {
        const query = queries[index];
        const newQuery = this.deepClone(query);
        const mids = this.getIDs(this.getAllMetrics(queries));
        newQuery.id = this.generateId(3, this.getIDs(queries));
        const oldIds = this.getIDs(query.metrics), newIds = [];
        for (const metric of query.metrics) {
            const newId = this.generateId(3, mids);
            metric.id = newId;
            mids.push(newId);
            newIds.push(newId);
        }

        for (let i = 0; i < oldIds.length; i++) {
            this.replaceIdsInExpressions(newIds[i], oldIds[i], query.metrics);
        }
        return newQuery;
    }

    getTotalTimeShift(functions: any[]): string {
        let numOfHours = 0;
        if (functions) {
            for (let i = 0; i < functions.length; i++) {
                const fxCall = functions[i].fxCall;
                switch (fxCall) {
                    case 'Timeshift':
                        const timeAmountRegEx = /\d+/;
                        const timeUnitRegEx = /[a-zA-Z]/;
                        const timeAmount = parseInt(functions[i].val.match(timeAmountRegEx)[0], 10);
                        const timeUnit = functions[i].val.match(timeUnitRegEx)[0].toLowerCase();
                        if (timeUnit === 'w') {
                            numOfHours = numOfHours + (timeAmount * 7 * 24);
                        } else if (timeUnit === 'd') {
                            numOfHours = numOfHours + (timeAmount * 24);
                        } else { // timeUnit === 'h'
                            numOfHours = numOfHours + timeAmount;
                        }
                        break;
                }
            }
            // determine h d or w
            if (numOfHours) {
                let highestUnit = 'h';
                if (numOfHours % 24 === 0) {
                    highestUnit = 'd';
                    numOfHours = numOfHours / 24;
                    if (numOfHours % 7 === 0) {
                        highestUnit = 'w';
                        numOfHours = numOfHours / 7;
                    }
                }
                return numOfHours + highestUnit;
            } else {
                return null;
            }
        }
        return null;
    }

    getTimestampsFromTimeSpecification(tsConfigs) {
        let tsObj = {};
        const mSeconds = { 's': 1, 'm': 60, 'h': 3600, 'd': 86400 };
        for (let i = 0; i < tsConfigs.length; i++) {
            const timeSpecification = tsConfigs[i].timeSpecification;
            const unit = timeSpecification.interval.replace(/[0-9]/g, '');
            const m = parseInt(timeSpecification.interval, 10);
            let start = timeSpecification.start;
            const end = timeSpecification.end;
            let j = 0;
            while (start < end) {
                tsObj[start * 1000] = true;
                j++;
                start = timeSpecification.start + (m * j * mSeconds[unit]);
            }
        }
        const ts: number[] = Object.keys(tsObj).map(d => parseInt(d, 10));
        ts.sort((a, b) => a - b);
        tsObj = {};
        for (let i = 0; i < ts.length; i++) {
            tsObj[ts[i]] = i;
        }
        return tsObj;
    }

  getEventBuckets(startTime, endTime, maxNumOfBuckets, events) {
    // startTime in milliseconds. ex: 1561670640000
    // tslint:disable-next-line:max-line-length
    const validBucketSizes = [1, 5, 10, 15, 30, 60, 60 * 2, 60 * 3, 60 * 4, 60 * 6, 60 * 12, 60 * 24, 60 * 48, 60 * 24 * 7, 60 * 24 * 14, 60 * 24 * 28, 60 * 24 * 28 * 3, 60 * 24 * 28 * 12]; // in minutes
    const duration = moment.duration(moment(endTime).diff(moment(startTime))).as('minutes');
    const minuteAsMilliseconds = 60 * 1000;
    const buckets = []; // [ {startTime: startTime, endTime: endTime, events: []} ]

    // find bucketSize (number of minutes)
    let bucketSize = validBucketSizes[validBucketSizes.length - 1];
    for (let i = validBucketSizes.length - 1; i >= 0; i--) {
        const numOfBuckets = parseInt((duration / validBucketSizes[i]).toString(), 10);
        if (numOfBuckets <= maxNumOfBuckets) {
            bucketSize = validBucketSizes[i];
        } else {
            break;
        }
    }

    // find first bucket
    const numOfMinutes = moment(startTime).minutes();
    let bucketStartTime = startTime;
    let bucketEndTime = startTime;
    if (numOfMinutes === 0) {
        bucketEndTime = bucketStartTime + bucketSize * minuteAsMilliseconds;
    } else {
        bucketEndTime = bucketEndTime + minuteAsMilliseconds;
        while (moment(bucketEndTime).minutes() % bucketSize !== 0) {
            bucketEndTime = bucketEndTime + minuteAsMilliseconds;
        }
    }
    buckets.push({startTime: bucketStartTime, endTime: bucketEndTime, width: bucketSize * minuteAsMilliseconds, events: []});

    // create remaining buckets
    while (bucketEndTime + 2 * bucketSize * minuteAsMilliseconds < endTime) {
        bucketStartTime = bucketEndTime;
        bucketEndTime = bucketStartTime + bucketSize * minuteAsMilliseconds;
        buckets.push({startTime: bucketStartTime, endTime: bucketEndTime, width: bucketSize * minuteAsMilliseconds, events: []});
    }

    // insert last bucket
    buckets.push({startTime: bucketEndTime, endTime: endTime, width: bucketSize * minuteAsMilliseconds, events: []});

    // fillup buckets with events
    for (const event of events) {
        const eStartTime = event.timestamp;
        for (const bucket of buckets) {
            if (eStartTime >= bucket.startTime && eStartTime < bucket.endTime) {
                bucket.events.push(event);
                break;
            }
        }
    }

    // remove unused buckets
    for (let i = 0; i < buckets.length; i++) {
        if (buckets[i].events.length === 0 ) {
            buckets.splice(i, 1);
            i--;
        }
    }
    return buckets.reverse();
  }

  getTimeArray(timeInMilliseconds, timezone?: string): any[] {
    const time = [];
    if (!timezone) {
        timezone = 'local';
    }
    timezone = timezone.toLowerCase();

    const a = new Date(timeInMilliseconds);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = (timezone === 'utc') ? a.getUTCFullYear() : a.getFullYear();
    const month = (timezone === 'utc') ? months[a.getUTCMonth()] : months[a.getMonth()];
    const date = (timezone === 'utc') ? a.getUTCDate() : a.getDate();
    let hour;
    let ampm;
    if (timezone === 'utc') {
        hour = a.getUTCHours() < 10 ? '0' + a.getUTCHours() : a.getUTCHours();
        ampm = hour >= 12 ? 'pm' : 'am';
    } else {
        hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
        ampm = hour >= 12 ? 'pm' : 'am';
        // hour = hour % 12;
        // hour = hour ? hour : 12; // the hour '0' should be '12'
    }

    let min;
    if (timezone === 'utc') {
        min = a.getUTCMinutes() < 10 ? '0' + a.getUTCMinutes() : a.getUTCMinutes();
    } else {
        min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
    }

    let sec;
    if (timezone === 'utc') {
        sec = a.getUTCSeconds() < 10 ? '0' + a.getUTCSeconds() : a.getUTCSeconds();
    } else {
        sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
    }


    time.push(year, month, date, hour, min, sec, ampm);
    return time;
  }


  buildDisplayTime(unixMillisec: number, startTime: number, endTime, includeSeconds: boolean = false, timezone: string = 'local'): string {
    const time = this.getTimeArray(unixMillisec, timezone);
    const start = this.getTimeArray(startTime, timezone);
    const end = this.getTimeArray(endTime, timezone);

    let crossedMidnight = false;
    for (let i = 0; i < 3; i++) {
        if (start[i] !== end[i]) {
            crossedMidnight = true;
            break;
        }
    }

    let dateString = '';
    if (crossedMidnight) { // include full time, including year and date
        dateString = time[0] + '-' + time[1] + '-' + time[2] + ' ' + time[3] + ':' + time[4];
    } else { // only include hour and minute
        dateString = time[3] + ':' + time[4];
    }

    if (includeSeconds) {
        dateString = dateString + ':' + time[5];
    }

    // add am/pm for local time
    // if (timezone !== 'utc') {
    //     dateString = dateString + ' ' + time[6];
    // }

    return dateString;

  }

  setDefaultEventsConfig(widget, displayEvents: boolean) {
    if (!widget.eventQueries) {
        widget.eventQueries = [];
        widget.eventQueries[0] = {};
        widget.eventQueries[0].namespace = '';
        widget.eventQueries[0].search = '';
        widget.eventQueries[0].id = 'q1_m1';
        widget.settings.visual.showEvents = displayEvents;
    }
    return widget;
  }

  isNumber(value: string | number): boolean {
    if (value === 0) {
        return true;
    } else {
        return value ? parseInt(value.toString(), 10) !== NaN : false;
    }
  }

  getFiltersTsdbToLocal(filters) {
    const filterTypes = ['TagValueLiteralOr', 'TagValueRegex'];
    let newFilters = [];
    for (let i = 0; i < filters.length; i++ ) {
        const filter = filters[i];
        const ftype = filter.type;
        if ( ftype === 'Chain' && filter['op'] === 'OR' ) {
            newFilters = newFilters.concat(this.getFiltersTsdbToLocal(filter.filters));
        } else if ( filterTypes.includes(ftype) ) {
            let values = [];
            switch ( ftype ) {
                case 'TagValueLiteralOr':
                    values = filter.filter.split('|');
                    break;
                case 'TagValueRegex':
                    values = ['regexp(' + filter.filter + ')'];
                    break;
            }
            const index = newFilters.findIndex(d => d.tagk === filter.tagKey);
            if ( index === -1 ) {
                newFilters.push( { tagk: filter.tagKey, filter: values });
            } else {
                newFilters[index].filter = newFilters[index].filter.concat(values);
            }
        }
    }
    return newFilters;
  }

  decodeHTML(s: string) {
    if (!s) return s;
    return s.replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
            .replace(/&quot/g, "\"")
            .replace(/&apos;/g,"\'")
            .replace(/amp;/g,"");

  }

  setTabTitle(newTitle?: string) {
      if (newTitle) {
        this.titleService.setTitle(newTitle);
      } else {
        this.titleService.setTitle('Horizon');
      }
  }

  hasInitialZoomTimeSet(time): boolean {
      if (time && time.zone && time.start && time.end) {
          return true;
      }
      return false;
  }

    addTransitions(arr: any[], transitions: any[]) {
        for (const transition of transitions) {
            this.addTransition(arr, transition);
        }
    }

    removeTransitions(arr: any[], transitions: any[]) {
        for (const transition of transitions) {
            this.removeTransition(arr, transition);
        }
    }

    addTransition(arr, transition) {
        let transitionExists = false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === transition) {
                transitionExists = true;
                return;
            }
        }
        if (!transitionExists) {
            arr.push(transition);
        }
    }

    removeTransition(arr, transition) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === transition) {
              arr = arr.splice(i, 1);
            }
        }
    }

    getExpressionLabel(qindex, mindex, queries) {
        const label = 'q' + (qindex + 1) + '.e';
        let eIndex = -1;
        for ( let i = 0; i <= mindex && i < queries[qindex].metrics.length; i++ ) {
            if ( queries[qindex].metrics[i].expression ) {
                eIndex++;
            }
        }
        return label + (eIndex + 1);
    }

    getMetricDropdownValue(queries, dsId) {
        const REGDSID = /q?(\d+)?_?(m|e)(\d+).*/;
        const ids = REGDSID.exec(dsId);
        const qIndex = ids ? parseInt(ids[1], 10) - 1 : 0;
        const mIndex = ids ? this.getDSIndexToMetricIndex(queries[qIndex], parseInt(ids[3], 10) - 1, ids[2]) : -1;
        const config  = qIndex !== -1 && mIndex !== -1 ? queries[qIndex].metrics[mIndex] : {};
        return config.id;
    }

    getNameFromID(id, queries) {
        for (let i = 0; i < queries.length; i++) {
            for (let j = 0; j < queries[i].metrics.length; j++) {
                if (queries[i].metrics[j].id === id) {
                    return queries[i].metrics[j].name;
                }
            }
        }
        return '';
    }

    createNewReference(items, exclude = []) {
        for ( let i = 0; i < items.length; i++ ) {
            if ( !exclude.includes(i)) {
                items[i] = {...items[i]};
            }
        }
    }

}
