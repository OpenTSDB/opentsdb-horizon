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
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _moment from 'moment';
import * as d3 from 'd3';

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
                if (!queries[i].metrics[j].settings.visual || queries[i].metrics[j].settings.visual.visible === true ) {
                    metricsVisibleLen++;
                    // tslint:disable:max-line-length
                    if (!queries[i].metrics[j].settings.visual || queries[i].metrics[j].settings.visual.color === 'auto' || !queries[i].metrics[j].settings.visual.color) {
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
                                    overrideTime: config.overrideTime || '',
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

    getColors() {
       const defaultColors =  [
            // some high contrast colors first
            '#0000FF',    // 'blue',
            '#008000',    // 'green'
            '#FFA500',    // 'orange'
            '#808000',    // 'olive'
            '#800080',    //  'purple'
            '#0BC582', '#9E8317', '#847D81', '#58018B', '#B70639', '#703B01', '#118B8A', '#4AFEFA', '#FCB164', '#796EE6', '#53495F', '#F95475', '#61FC03', '#5D9608', '#98A088', '#4F584E', '#248AD0', '#5C5300', '#9F6551', '#932C70', '#B5AFC4', '#D4C67A', '#AE7AA1', '#C2A393', '#0232FD', '#6A3A35', '#BA6801', '#168E5C', '#16C0D0', '#C62100', '#014347', '#233809', '#42083B', '#82785D', '#023087', '#196956', '#8C41BB', '#94C661', '#F8907D', '#895E6B', '#788E95', '#FB6AB8', '#576094', '#DB1474', '#8489AE', '#860E04',
            '#FBC206', '#6EAB9B', '#645341', '#760035', '#647A41', '#496E76', '#876128', '#A1A711', '#01FB92', '#FD0F31', '#BE8485', '#C660FB', '#D48958', '#05AEE8', '#C3C1BE', '#9F98F8', '#1167D9', '#D19012', '#B7D802', '#826392', '#5E7A6A', '#B29869', '#1D0051', '#76E0C1', '#BACFA7', '#11BA09', '#462C36', '#65407D', '#03422C', '#72A46E', '#128EAC', '#47545E', '#B95C69', '#A14D12', '#372A55', '#3F3610', '#D3A2C6', '#719FFA', '#0D841A', '#4C5B32', '#9DB3B7', '#B14F8F', '#747103', '#9F816D', '#D26A5B', '#8B934B', '#F98500', '#002935',
            '#FCB899', '#6B5F61', '#F98A9D', '#9B72C2', '#A6919D', '#2C3729', '#D7C70B', '#9F9992', '#923A52', '#5140A7', '#BC14FD', '#6D706C', '#0007C4', '#C6A62F', '#904431', '#600013', '#693955', '#5E7C99', '#6C6E82', '#D0AFB3', '#493B36', '#AC93CE', '#C4BA9C', '#09C4B8', '#69A5B8', '#374869', '#F868ED', '#E70850', '#C04841', '#C36333', '#700366', '#8A7A93', '#52351D', '#B503A2', '#D17190', '#A0F086', '#7B41FC', '#0EA64F', '#017499', '#08A882', '#7300CD', '#A9B074', '#4E6301', '#AB7E41', '#547FF4', '#134DAC', '#056164',
            '#FE12A0', '#C264BA', '#939DAD', '#0BCDFA', '#277442', '#1BDE4A', '#826958', '#977678', '#7D8475', '#8CCF95', '#726638', '#6B9279', '#C2FE4B', '#304041', '#1EA6A7', '#062A47', '#054B17', '#F4C673', '#02FEC7', '#9DBAA8', '#775551', '#835536', '#565BCC', '#80D7D2', '#7AD607', '#696F54', '#87089A', '#664B19', '#7DB00D', '#D5A97E', '#433F31', '#311A18', '#D586C9', '#7A5FB1', '#32544A', '#859D96', '#2B8570', '#8B282D', '#E16A07', '#4B0125', '#021083', '#114558', '#F707F9', '#C78571', '#7FB9BC', '#FC7F4B', '#8D4A92', '#6B3119',
            '#884F74', '#994E4F', '#9DA9D3', '#867B40', '#1CA2FE', '#D9C5B4', '#FEAA00', '#507B01', '#A7D0DB', '#53858D', '#588F4A', '#FC93C1', '#3E4A02', '#7A8B62', '#9A5AE2', '#896C04', '#B1121C', '#402D7D', '#858701', '#D498A6', '#B484EF', '#5C474C', '#067881', '#726075', '#8D3101', '#6C93B2', '#A26B3F', '#AA6582', '#4F4C4F', '#5A563D', '#E83005', '#32492D', '#FC7272', '#B9C457', '#552A5B', '#B50464', '#616E79', '#CF8028', '#0AE2F0', '#4F1E24', '#FD5E46', '#4B694E', '#5DC262', '#022D26', '#7776B8', '#FD9F66', '#B049B8', '#988F73', '#BE385A',
            '#54805A', '#141B55', '#67C09B', '#456989', '#166175', '#C1E29C', '#A397B5', '#2E2922', '#ABDBBE', '#B4A6A8', '#A06B07', '#A99949', , '#B14E2E', '#60557D', '#D4A556', '#82A752', '#4A005B', '#3C404F', '#6E6657', '#7E8BD5', '#1275B8', '#D79E92', '#230735', '#661849', '#7A8391', '#FE0F7B', '#B0B6A9', '#629591', '#D05591', '#97B68A', '#97939A', '#035E38', '#53E19E', '#02436C', '#525A72', '#059A0E', '#3E736C', '#AC8E87', '#D10C92', '#B9906E', '#66BDFD', '#0734BC', '#341224', '#8AAAC1', '#414522', '#6A2F3E', '#2D9A8A', '#4568FD',
            '#FEE007', '#9A003C', '#AC8190', '#DCDD58', '#B7903D', '#9B02E6', '#827A71', '#878B8A', '#8F724F', '#AC4B70', '#37233B', '#385559', '#F347C7', '#9DB4FE', '#D57179', '#DE505A', '#37F7DD', '#503500', '#DD0323', '#00A4BA', '#955602', '#FA5B94', '#AA766C', '#B8E067', '#6A807E', '#4D2E27', '#73BED7', '#D7BC8A', '#614539', '#526861', '#716D96', '#829A17', '#436C2D', '#784955', '#987BAB', '#8F0152', '#0452FA', '#B67757', '#A1659F', '#48416F', '#DEBAAF', '#A5A9AA', '#8C6B83', '#403740', '#70872B', '#D9744D',
            '#5C5E5E', '#B47C02', '#E49D7D', '#DD9954', '#B0A18B', '#2B5308', '#EDFD64', '#9D72FC', '#2A3351', '#68496C', '#C94801', '#EED05E', '#826F6D', '#5B6DB4', '#662F98', '#0C97CA', '#C1CA89', '#755A03', '#DFA619', '#CD70A8', '#BBC9C7', '#A16462', '#01D0AA', '#87C6B3', '#D85379', '#643AD5', '#D18AAE', '#13FD5E', '#C977DB', '#C1A7BB', '#9286CB', '#A19B6A', '#6B1F17', '#DF503A', '#10DDD7', '#9A8457', '#60672F', '#7D327D', '#DD8782', '#59AC42', '#82FDB8', '#909F6F', '#B691AE', '#B811CD', '#BCB24E', '#CB4BD9', '#2B2304', '#AA9501', '#5D5096', '#403221',
            '#3990FC', '#70DE7F', '#95857F', '#84A385', '#50996F', '#797B53', '#7B6142', '#81D5FE', '#9CC428', '#0B0438', '#3E2005', '#4B7C91', '#523854', '#005EA9', '#ACB799', '#FAC08E', '#502239', '#BFAB6A', '#2B3C48', '#0EB5D8', '#8A5647', '#49AF74', '#067AE9', '#F19509', '#554628', '#4426A4', '#7352C9', '#3F4287', '#8B655E', '#B480BF', '#9BA74C', '#5F514C', '#CC9BDC', '#BA7942', '#1C4138', '#3C3C3A', '#29B09C', '#02923F', '#701D2B', '#36577C', '#3F00EA', '#3D959E', '#440601', '#6D442A', '#BEB1A8', '#A11C02', '#8383FE', '#A73839', '#DBDE8A', '#0283B3',
            '#888597', '#32592E', '#AC707A', '#B6BD03', '#027B59', '#7B4F08', '#957737', '#83727D', '#035543', '#6F7E64', '#C39999', '#52847A', '#925AAC', '#77CEDA', '#516369', '#555424', '#96E6B6', '#85BB74', '#5E2074', '#BD5E48', '#9BEE53', '#1A351E', '#3148CD', '#71575F', '#69A6D0', '#391A62', '#E79EA0', '#1C0F03', '#1B1636', '#D20C39', '#765396', '#7402FE', '#447F3E', '#CFD0A8', '#3A2600', '#685AFC', '#A4B3C6', '#534302', '#9AA097', '#FD5154', '#9B0085', '#403956', '#80A1A7', '#6E7A9A', '#605E6A', '#5A2B01', '#7E3D43', '#ED823B', '#32331B',
            '#424837', '#40755E', '#524F48', '#B75807', '#B40080', '#5B8CA1', '#755847', '#CAB296', '#2D7100', '#362823', '#69C63C', '#AC3801', '#163132', '#4750A6', '#61B8B2', '#DEBA2E', '#FE0449', '#737930', '#8470AB', '#687D87', '#D7B760', '#6AAB86', '#8398B8', '#B7B6BF', '#92C4A1', '#B6084F', '#853B5E', '#D0BCBA', '#92826D', '#BE5F5A', '#280021', '#435743', '#874514', '#63675A', '#E97963', '#8F9C9E', '#985262', '#909081', '#023508', '#DDADBF', '#D78493', '#363900', '#5B0120', '#603C47', '#C3955D', '#AC61CB', '#FD7BA7', '#716C74', '#8D895B',
            '#82B4F2', '#B6BBD8', '#71887A', '#8B9FE3', '#997158', '#65A6AB', '#2E3067', '#321301', '#3B5E72', '#C8FE85', '#CB49A6', '#3E5EB0', '#88AEA7', '#04504C', '#975232', '#6786B9', '#068797', '#9A98C4', '#A1C3C2', '#1C3967', '#DBEA07', '#789658', '#A6C886', '#957F89', '#752E62', '#A75648', '#01D26F', '#0F535D', '#047E76', '#C54754', '#5D6E88', '#AB9483', '#803B99', '#FA9C48', '#4A8A22', '#654A5C', '#965F86', '#9D0CBB', '#A0E8A0', '#FD908F', '#AEAB85', '#A13B89', '#F1B350', '#066898', '#948A42', '#19252C', '#7046AA', '#3E6557', '#CD3F26',
            '#2B1925', '#DDAD94', '#C0B109', '#37DFFE', '#039676', '#907468', '#9E86A5', '#3A1B49', '#C29501', '#9E3645', '#DC580A', '#645631', '#444B4B', '#FD1A63', '#887800', '#36006F', '#3A6260', '#784637', '#FEA0B7', '#A3E0D2', '#6D6316', '#5F7172', '#B99EC7', '#777A7E', '#E16DC5', '#01344B', '#9F9FB5', '#182617', '#FE3D21', '#7D0017', '#822F21', '#6E68C4', '#35473E', '#007523', '#767667', '#A6825D', '#83DC5F', '#227285', '#A95E34', '#526172', '#979730', '#756F6D', '#716259', '#E8B2B5', '#B6C9BB', '#9078DA', '#4F326E', '#B2387B', '#888C6F', '#314B5F', 
            '#E5B678', '#38A3C6', '#586148', '#5C515B', '#C8977F', '#9BC4E5', '#310106', '#04640D', '#FEFB0A', '#FB5514', '#E115C0', '#00587F',
            '#800000',
            '#022403', '#242235',
            '#151E2C', '#2B2126', '#FF0000', '#000D2C', '#2B1B04', '#2B2D32', '#491803', '#1C0720', '#000000'
        ];
        return defaultColors;
    }

    getColorsFromScheme(name, n ) {
        let colors = [];
        name = name[0].toUpperCase() + name.slice(1);
        const categorical = ['Category10', 'Accent', 'Dark2', 'Paired', 'Set1', 'Set2', 'Set3', 'Tableau10'];
        if ( categorical.includes(name) ) {
          const schemeColors = d3[`scheme${name}`];
          const cn = schemeColors.length;
          colors = this.deepClone(schemeColors);
          if ( cn < n ) {
              for ( let i = cn; i < n; i++) {
                colors.push( schemeColors[i % cn] );
              }
          } else if ( cn > n ) {
              colors = colors.slice(0, n);
          }
        } else {
            const interpolate = d3[`interpolate${name}`];
            if ( n <= 2 ) {
                colors.push(d3.rgb(interpolate(0.5)).hex());
                colors.push(d3.rgb(interpolate(1)).hex());
            } else {
                for (let i = 0; i < n; ++i) {
                colors.push(d3.rgb(interpolate(i / (n - 1) )).hex());
                }
            }
        }
        return colors;
    }

    getColorsHSV(color = null, n = 1, shades = null ) {
        const colors = [];
        let hue;
        let hsv = [];
        if (color) {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);
            hsv = this.rgbToHsv(r, g, b);
            hue = hsv[0];

        } else {
            hue = 0;
        }

        // saturation & value/brightness ranges
        const srange = [1, 0.1], vrange = [0.9, 0.1];
        const contrast = this.findContrastColor(color);
        if ( shades && shades === 'dark' && contrast.type === 'black' ) { // light theme => dark shades +  
            srange[1] = 0.4;
        } else if (shades && shades === 'light' && contrast.type === 'white' ) { // dark theme => light shades + light color
            srange[0] = 0.6;
        }

        // no. of colors on light to bright (sBand) and no. of bright to dark (vBand)
        const sBand = Math.ceil(n * 1), vBand = Math.floor(n * 0);
        const sStep = (srange[1] - srange[0]) / sBand;
        const vStep = (vrange[0] - vrange[1]) / vBand;

        // if random color set SV to 0.8
        let s = color ? srange[0] - sStep : 1;
        let v = color ? hsv[2] : 0.9;
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
    
    // human sort asc
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
    // human sort desc
    sortAlphaNumDesc(a, b) {
        const aa = a.toLowerCase().split(/(\d+)/);
        const bb = b.toLowerCase().split(/(\d+)/);
        for (let x = 0; x < Math.max(aa.length, bb.length); x++) {
            if (aa[x] !== undefined && bb[x] !== undefined && aa[x] !== bb[x]) {
                const cmp1 = (isNaN(parseInt(aa[x], 10))) ? aa[x] : parseInt(aa[x], 10);
                const cmp2 = (isNaN(parseInt(bb[x], 10))) ? bb[x] : parseInt(bb[x], 10);
                if (cmp1 === undefined || cmp2 === undefined) {
                    return bb.length - aa.length;
                } else {
                    return (cmp1 < cmp2) ? 1 : -1;
                }
            }
        }
        return 0;     
    }

    // passing order and default is asc
    sortAliasforMultigraph(order: string = 'asc') {
        return function(a, b) {
            const aPart = a.split('~');
            const bPart = b.split('~');
            let a1 = aPart.length === 3 ? aPart[2] : aPart[1];
            let b1 = bPart.length === 3 ? bPart[2] : bPart[1];
            // when row/column does not include metric
            if (a1 === undefined) a1 = a;
            if (b1 === undefined) b1 = b;
            const aa = a1.toLowerCase().split(/(\d+)/);
            const bb = b1.toLowerCase().split(/(\d+)/);
            for (let x = 0; x < Math.max(aa.length, bb.length); x++) {
                if (aa[x] !== undefined && bb[x] !== undefined && aa[x] !== bb[x]) {
                    const cmp1 = (isNaN(parseInt(aa[x], 10))) ? aa[x] : parseInt(aa[x], 10);
                    const cmp2 = (isNaN(parseInt(bb[x], 10))) ? bb[x] : parseInt(bb[x], 10);
                    if (cmp1 === undefined || cmp2 === undefined) {
                        return order === 'asc' ? aa.length - bb.length : bb.length - aa.length;
                    } else {
                        return order === 'asc' ? (cmp1 < cmp2) ? -1 : 1 : (cmp1 < cmp2) ? 1 : -1;
                    }
                }
            }
            return 0;            
        }
    }

    sortObject(obj) {
        return Object.keys(obj).sort().reduce(function (result, key) {
          result[key] = obj[key];
          return result;
        }, {});
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

    isArraySubset(arr1, arr2) {
        return arr2.every( v => arr1.includes(v) );
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

  getFiltersTsdbToLocal(filter) {
    const filterTypes = ['TagValueLiteralOr', 'TagValueRegex'];
    let newFilters = [];
    const filters = filter.filters || [ filter ];
    for (let i = 0; i < filters.length; i++ ) {
        const filter = filters[i];
        const ftype = filter.type;
        if ( ftype === 'Chain' && filter['op'] === 'OR' ) {
            newFilters = newFilters.concat(this.getFiltersTsdbToLocal(filter));
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

    deepmerge(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], this.deepmerge(target[key], source[key]));
            }
        }
      
        // Join `target` and modified `source`
        Object.assign(target || {}, source)
        return target;
    }

    regExpEscSpecialChars(value, replaceChars) {
        const regex = new RegExp('[' + replaceChars.join('') + ']', 'g');
        return value.replace(regex, '\\$&'); 
    }
}
