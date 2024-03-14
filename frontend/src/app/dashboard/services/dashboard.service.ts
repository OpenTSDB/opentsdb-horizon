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
import { UtilsService } from '../../core/services/utils.service';
import { DashboardConverterService } from '../../core/services/dashboard-converter.service';
import { URLOverrideService } from '../../core/services/urlOverride.service';
import { HttpService } from '../../core/http/http.service';
import { Observable, forkJoin, of } from 'rxjs';

@Injectable()
export class DashboardService {
    version = 2;

    private dashboardProto: any = {
        settings: {
            time: {
                start: '1h',
                end: 'now',
                zone: 'local',
            },
            meta: {
                title: 'My Dashboard',
                description: '',
                labels: [],
                namespace: '',
                isPersonal: false,
            },
            tplVariables: {
                namespaces: [],
                tvars: [],
            },
            downsample: {
                aggregators: [''],
                customUnit: '',
                customValue: '',
                value: 'auto',
            },
        },
        widgets: [],
    };

    private widgetPrototype = {
        gridPos: {
            x: 0,
            y: 0,
            h: 5,
            w: 12,
            xMd: 0,
            yMd: 0,
            wMd: 12,
            hMd: 5,
            xSm: 0,
            ySm: 0,
            wSm: 1,
            hSm: 1,
        },
        settings: {
            title: 'my widget',
            component_type: 'PlaceholderWidgetComponent',
            visual: {},
            axes: {},
            legend: {},
            time: {
                downsample: {
                    value: 'auto',
                    aggregator: 'avg',
                    customValue: '',
                    customUnit: '',
                    minInterval: '',
                    reportingInterval: '',
                },
            },
        },
        queries: [],
    };

    private widgetsConfig = {};

    constructor(
        private utils: UtilsService,
        private dbConverterService: DashboardConverterService,
        private urlOverride: URLOverrideService,
        private httpService: HttpService,
    ) {}

    setWigetsConfig(conf) {
        this.widgetsConfig = { ...conf };
    }

    getWidgetPrototype(type = '', widgets = []): any {
        const widget: any = JSON.parse(JSON.stringify(this.widgetPrototype));
        widget.id = this.utils.generateId(6, this.utils.getIDs(widgets));
        widget.settings.component_type = type;
        switch (type) {
            case 'HeatmapWidgetComponent':
                widget.settings.visual.color = '#3F00FF';
                break;
            case 'TopnWidgetComponent':
                widget.settings.visual.color = '#dff0ff';
                break;
            case 'BignumberWidgetComponent':
            case 'LinechartWidgetComponent':
            case 'BarchartWidgetComponent':
            case 'DonutWidgetComponent':
            case 'DeveloperWidgetComponent':
            case 'MarkdownWidgetComponent':
            case 'EventsWidgetComponent':
            case 'TableWidgetComponent':
                break;
            default:
                widget.settings.component_type = 'PlaceholderWidgetComponent';
        }
        return widget;
    }

    getDashboardPrototype(): any {
        const dashboard: any = this.utils.deepClone(this.dashboardProto);
        const widget: any = this.utils.deepClone(this.getWidgetPrototype());
        dashboard.widgets.push(widget);
        return dashboard;
    }

    // help to put new widget on top.
    // set new position of first position down
    positionWidgetY(widgets: any, y) {
        const modWidgets = widgets;
        for (let i = 0; i < modWidgets.length; i++) {
            modWidgets[i].gridPos.y = modWidgets[i].gridPos.y + y;
            modWidgets[i].gridPos.yMd = modWidgets[i].gridPos.yMd + y;
        }
        return modWidgets;
    }

    getNamespacesFromWidgets(widgets) {
        const namespaces = {};
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            for (let j = 0; j < queries.length; j++) {
                if (queries[j].namespace) {
                    namespaces[queries[j].namespace] = true;
                }
            }
        }
        return Object.keys(namespaces);
    }

    getMetricsFromWidgets(widgets) {
        const metrics = [];
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            for (let j = 0; j < queries.length; j++) {
                for (let k = 0; k < queries[j].metrics.length; k++) {
                    if (!queries[j].metrics[k].expression) {
                        metrics.push(
                            queries[j].namespace +
                                '.' +
                                queries[j].metrics[k].name,
                        );
                    }
                }
            }
        }
        return metrics;
    }

    filterMetrics(query) {
        query.metrics = query.metrics.filter(
            (item) => item.settings.visual.visible === true,
        );
        return query;
    }

    overrideQueryFilters(query, filters, tags = []) {
        for (let i = 0; i < filters.length; i++) {
            let tagExists = false;
            for (let j = 0; query.filters && j < query.filters.length; j++) {
                if (
                    filters[i].tagk === query.filters[j].tagk &&
                    filters[i].filter &&
                    filters[i].filter.length
                ) {
                    query.filters[j].filter = filters[i].filter;
                    tagExists = true;
                }
            }
            if (!tagExists && tags.indexOf(filters[i].tagk) !== -1) {
                query.filters.push({
                    tagk: filters[i].tagk,
                    filter: filters[i].filter,
                });
            }
        }
        return query;
    }

    // check if dashboard have any mertics
    havingDBMetrics(widgets: any[]): boolean {
        if (widgets.length === 0) {
            return false;
        }
        for (let i = 0; i < widgets.length; i++) {
            const widQueries = widgets[i].queries || [];
            for (let j = 0; j < widQueries.length; j++) {
                const metrics = widQueries[j].metrics || [];
                if (metrics.length > 0) {
                    return true;
                }
            }
        }
    }

    // apply new db filter alias to widget
    insertTplAliasToWidget(widget: any, payload: any, rawDbTags: any) {
        let isModify = false;
        const wid =
            widget.id.indexOf('__EDIT__') !== -1
                ? widget.id.replace('__EDIT__', '')
                : widget.id;
        if (rawDbTags[wid]) {
            for (let i = 0; i < widget.queries.length; i++) {
                const query = widget.queries[i];
                if (
                    rawDbTags[wid].hasOwnProperty(query.id) &&
                    rawDbTags[wid][query.id].includes(payload.vartag.tagk)
                ) {
                    const fIndx = query.filters.findIndex(
                        (f) => f.tagk === payload.vartag.tagk,
                    );
                    if (fIndx > -1) {
                        // query does has this tag defined
                        const currFilter = query.filters[fIndx];
                        if (!currFilter.customFilter) {
                            currFilter.customFilter = [
                                '[' + payload.vartag.alias + ']',
                            ];
                            isModify = true;
                        } else {
                            // only insert if they are not there
                            if (
                                !currFilter.customFilter.includes(
                                    '[' + payload.vartag.alias + ']',
                                )
                            ) {
                                currFilter.customFilter.push(
                                    '[' + payload.vartag.alias + ']',
                                );
                                isModify = true;
                            }
                        }
                    } else {
                        // query does not has this tag define yet
                        const nFilter = {
                            tagk: payload.vartag.tagk,
                            customFilter: ['[' + payload.vartag.alias + ']'],
                            filter: [],
                            groupBy: false,
                        };
                        query.filters.push(nFilter);
                        isModify = true;
                    }
                }
            }
        }
        return isModify;
    }

    // update db filter alias to widget
    // here is when user modify existing alias
    updateTplAliasToWidget(widget: any, payload: any) {
        let isModify = false;
        const wid =
            widget.id.indexOf('__EDIT__') !== -1
                ? widget.id.replace('__EDIT__', '')
                : widget.id;
        for (let i = 0; i < widget.queries.length; i++) {
            const query = widget.queries[i];
            for (let j = 0; j < query.filters.length; j++) {
                const qfilter = query.filters[j];
                // filter tagkey exist in aliasInfo
                if (payload.aliasInfo[qfilter.tagk]) {
                    let anyModify = false;
                    for (let k = 0; k < qfilter.customFilter.length; k++) {
                        const custFilter = qfilter.customFilter[k];
                        const idx = payload.aliasInfo[qfilter.tagk].findIndex(
                            (item) => custFilter === '[' + item.oAlias + ']',
                        );
                        if (idx > -1) {
                            anyModify = true;
                            qfilter.customFilter[k] =
                                '[' +
                                payload.aliasInfo[qfilter.tagk][idx].nAlias +
                                ']';
                        }
                    }
                    if (anyModify) {
                        isModify = true;
                    }
                }
            }
        }
        return isModify;
    }

    // apply the customFilter to widget queries if it's eligible
    // @widget: widget to modify
    // @tplVar: the current tplVar to apply
    // @rawDbTags: the information about widget available tags
    applytDBFilterToWidget(widget: any, payload: any, rawDbTags: any) {
        let isModify = false;
        const wid =
            widget.id.indexOf('__EDIT__') !== -1
                ? widget.id.replace('__EDIT__', '')
                : widget.id;
        if (rawDbTags[wid]) {
            for (let i = 0; i < widget.queries.length; i++) {
                const query = widget.queries[i];
                if (
                    rawDbTags[wid].hasOwnProperty(query.id) &&
                    rawDbTags[wid][query.id].includes(payload.vartag.tagk)
                ) {
                    const fIndx = query.filters.findIndex(
                        (f) => f.tagk === payload.vartag.tagk,
                    );
                    if (fIndx > -1) {
                        const currFilter = query.filters[fIndx];
                        // we do have this tag defined
                        if (payload.insert === 1) {
                            if (!currFilter.customFilter) {
                                currFilter.customFilter = [
                                    '[' + payload.vartag.alias + ']',
                                ];
                                isModify = true;
                            } else {
                                // only insert if they are not there
                                if (
                                    !currFilter.customFilter.includes(
                                        '[' + payload.vartag.alias + ']',
                                    )
                                ) {
                                    currFilter.customFilter.push(
                                        '[' + payload.vartag.alias + ']',
                                    );
                                    isModify = true;
                                }
                            }
                        } else {
                            // to do update alias name if only they are there.
                            if (currFilter.customFilter) {
                                const idx = currFilter.customFilter.indexOf(
                                    '[' +
                                        payload.originAlias[payload.index] +
                                        ']',
                                );
                                if (idx > -1) {
                                    currFilter.customFilter[idx] =
                                        '[' + payload.vartag.alias + ']';
                                    isModify = true;
                                }
                            }
                        }
                    } else {
                        // the filter is not yet defined
                        if (payload.insert === 1) {
                            const nFilter = {
                                tagk: payload.vartag.tagk,
                                customFilter: [
                                    '[' + payload.vartag.alias + ']',
                                ],
                                filter: [],
                                groupBy: false,
                            };
                            query.filters.push(nFilter);
                            isModify = true;
                        }
                    }
                }
            }
        }
        return isModify;
    }

    // helper to create dbTags
    formatDbTagKeysByWidgets(res: any) {
        const _dashboardTags = { rawDbTags: {}, totalQueries: 0, tags: [] };
        for (let i = 0; res && i < res.results.length; i++) {
            const [wid, qid] = res.results[i].id
                ? res.results[i].id.split(':')
                : [null, null];
            if (!wid) {
                continue;
            }
            const keys = res.results[i].tagKeys.map((d) => d.name);
            if (!_dashboardTags.rawDbTags[wid]) {
                _dashboardTags.rawDbTags[wid] = {};
            }
            _dashboardTags.rawDbTags[wid][qid] = keys;
            _dashboardTags.totalQueries++;
            _dashboardTags.tags = [
                ..._dashboardTags.tags,
                ...keys.filter((k) => _dashboardTags.tags.indexOf(k) < 0),
            ];
        }
        _dashboardTags.tags.sort(this.utils.sortAlphaNum);
        return { ..._dashboardTags };
    }

    // to resolve from variable to real filter value, this is for insert mode
    // and combine with existing values
    resolveTplVarCombine(query: any, tplVariables: any[]) {
        for (let i = 0; i < query.filters.length; i++) {
            const qFilter = query.filters[i];
            // they do have custom filter
            if (qFilter.customFilter && qFilter.customFilter.length > 0) {
                for (let j = 0; j < qFilter.customFilter.length; j++) {
                    const hasNot = qFilter.customFilter[j][0] === '!';
                    const alias = qFilter.customFilter[j].substring(
                        hasNot ? 2 : 1,
                        qFilter.customFilter[j].length - 1,
                    );
                    const tplIdx = tplVariables.findIndex(
                        (tpl) => tpl.alias === alias,
                    );
                    if (tplIdx > -1) {
                        if (
                            tplVariables[tplIdx].filter.trim() !== '' &&
                            qFilter.filter.indexOf(
                                tplVariables[tplIdx].filter,
                            ) === -1
                        ) {
                            qFilter.filter.push(
                                hasNot
                                    ? '!' + tplVariables[tplIdx].filter
                                    : tplVariables[tplIdx].filter,
                            );
                        }
                    }
                }
            }
        }
        // clean out empty filter, since they might have db filter but not set value yet.
        query.filters = query.filters.filter((f) => f.filter.length > 0);
        return query;
    }

    // resolve with replace mode based on mode and default value
    // @scopeCache is the cache for scope if they are using dashboard tag scope
    resolveTplVarReplace(query: any, tplVariables: any[], scopeCache: any[]) {
        for (let i = 0; i < query.filters.length; i++) {
            const qFilter = query.filters[i];
            const replaceFilter = [];
            let autoMode = false; // track of any of db filters have auto mode
            if (qFilter.customFilter && qFilter.customFilter.length > 0) {
                // they do have custom filter
                if (qFilter.customFilter && qFilter.customFilter.length > 0) {
                    for (let j = 0; j < qFilter.customFilter.length; j++) {
                        const hasNot = qFilter.customFilter[j][0] === '!';
                        const alias = qFilter.customFilter[j].substring(
                            hasNot ? 2 : 1,
                            qFilter.customFilter[j].length - 1,
                        );
                        const tplIdx = tplVariables.findIndex(
                            (tpl) => tpl.alias === alias,
                        );
                        if (tplIdx > -1) {
                            if (tplVariables[tplIdx].filter.trim() !== '') {
                                // now we want to check if this is an absolute value or regexp
                                // for regexp then we might need to to solve it
                                const _cfilter = tplVariables[tplIdx].filter;
                                if (
                                    tplVariables[tplIdx].scope &&
                                    tplVariables[tplIdx].scope.length > 0
                                ) {
                                    const res =
                                        _cfilter.match(/^regexp\((.*)\)$/);
                                    const val = res ? res[1] : _cfilter;
                                    const matches = [];
                                    try {
                                        const regx = new RegExp(val, 'gi');
                                        scopeCache[tplIdx].forEach((v) => {
                                            if (v.match(regx)) {
                                                matches.push(v);
                                            }
                                        });
                                    } catch (e) {
                                        const err = (e as Error).message;
                                        // eslint-disable-next-line no-console
                                        console.info('Error: ', err);
                                    }
                                    if (matches.length > 0) {
                                        if (hasNot) {
                                            // we need to combine with scope for not
                                            matches.forEach((m) => {
                                                replaceFilter.push('!' + m);
                                            });
                                            tplVariables[tplIdx].scope.forEach(
                                                (s) => {
                                                    replaceFilter.push(s);
                                                },
                                            );
                                        } else {
                                            matches.forEach((m) => {
                                                replaceFilter.push(m);
                                            });
                                        }
                                    } else {
                                        // there is no match of any values of the scope
                                        // TODO: how to deal with this for error message or let it go
                                        // just to make query return no values
                                        replaceFilter.push(
                                            '__NO_SCOPE_MATCHED__',
                                        );
                                    }
                                } else {
                                    replaceFilter.push(
                                        hasNot ? '!' + _cfilter : _cfilter,
                                    );
                                }
                            } else {
                                // filter is empty but scope is defined, appply it
                                if (
                                    tplVariables[tplIdx].scope &&
                                    tplVariables[tplIdx].scope.length > 0
                                ) {
                                    for (
                                        let k = 0;
                                        k < tplVariables[tplIdx].scope.length;
                                        k++
                                    ) {
                                        const scopeHasNot =
                                            tplVariables[tplIdx].scope[k][0] ===
                                            '!';
                                        const scope = tplVariables[
                                            tplIdx
                                        ].scope[k].substring(
                                            scopeHasNot ? 1 : 0,
                                            tplVariables[tplIdx].scope[k]
                                                .length,
                                        );
                                        if (hasNot) {
                                            if (scopeHasNot) {
                                                replaceFilter.push(scope);
                                            } else {
                                                replaceFilter.push('!' + scope);
                                            }
                                        } else {
                                            replaceFilter.push(
                                                tplVariables[tplIdx].scope[k],
                                            );
                                        }
                                    }
                                }
                            }
                            if (tplVariables[tplIdx].mode === 'auto') {
                                autoMode = true;
                            }
                        }
                    }
                }
            }

            if (replaceFilter.length > 0) {
                if (autoMode) {
                    // do replace
                    qFilter.filter = [...replaceFilter];
                } else {
                    // they are all manual mode and have value, do combine
                    qFilter.filter = qFilter.filter.concat(replaceFilter);
                }
            }
        }
        // clean out empty filter, since they might have db filter but not set value yet.
        query.filters = query.filters.filter((f) => f.filter.length > 0);
        return query;
    }

    // to resolve dasboard scope to scopeCache if not there.
    // this only happens when first time dashboard loads
    resolveDBScope(
        tplVariables: any,
        widgets: any[],
        panelMode: any,
    ): Observable<any> {
        const obs: any[] = [];
        const tpl = panelMode.view
            ? tplVariables.viewTplVariables
            : tplVariables.editTplVariables;
        const metrics = [];
        let query: any = {};
        let doSearch = false;
        for (let i = 0; i < tpl.tvars.length; i++) {
            if (tpl.tvars[i].scope && tpl.tvars[i].scope.length > 0) {
                if (!tplVariables.scopeCache[i]) {
                    tplVariables.scopeCache[i] = [];
                }
                if (!tplVariables.scopeCache[i].length) {
                    for (let j = 0; j < tpl.tvars[i].scope.length; j++) {
                        const v = tpl.tvars[i].scope[j];
                        if (v[0] === '!' || v.match(/regexp\((.*)\)/)) {
                            doSearch = true;
                            query.tagsFilter = [
                                {
                                    tagk: tpl.tvars[i].tagk,
                                    filter: tpl.tvars[i].scope,
                                },
                            ];
                            break;
                        }
                    }
                }
                if (!doSearch) {
                    obs.push(of(tpl.tvars[i].scope));
                }
            } else {
                // no scope or empty, put into obs to protect index
                obs.push(of([]));
            }
            if (doSearch) {
                const tagk = tpl.tvars[i].tagk;
                const alias = tpl.tvars[i].alias;
                for (let ii = 0; i < widgets.length; ii++) {
                    const queries = widgets[ii].queries;
                    for (let j = 0; j < queries.length; j++) {
                        const filters = queries[j].filters;
                        let aliasFound = false;
                        for (let k = 0; k < filters.length; k++) {
                            if (
                                filters[k].tagk === tagk &&
                                filters[k].customFilter
                            ) {
                                filters[k].customFilter.forEach((f) => {
                                    const hasNot = f[0] === '!';
                                    const _alias = f.substring(
                                        hasNot ? 2 : 1,
                                        f.length - 1,
                                    );
                                    if (alias === _alias) {
                                        aliasFound = true;
                                    }
                                });
                            }
                        }
                        if (aliasFound) {
                            for (
                                let k = 0;
                                k < queries[j].metrics.length;
                                k++
                            ) {
                                if (!queries[j].metrics[k].expression) {
                                    metrics.push(
                                        queries[j].namespace +
                                            '.' +
                                            queries[j].metrics[k].name,
                                    );
                                }
                            }
                        }
                    }
                }
                doSearch = false;
                query.tag = { key: tagk, value: '' };
                if (metrics.length) {
                    query.metrics = metrics;
                } else {
                    query.namespaces = tpl.namespaces;
                }
                const cloneQuery = JSON.parse(JSON.stringify(query));
                obs.push(this.httpService.getTagValues(cloneQuery));
                query = {};
            }
        }
        if (obs.length > 0) {
            return forkJoin(obs);
        } else {
            return of([]);
        }
    }

    // for db filter view mode with regexp
    buildViewTagValuesQuery(
        tplVariables: any,
        widgets: any[],
        val: string,
        index: number
    ): any {
        const tpl = tplVariables.viewTplVariables.tvars[index];
        const alias = tpl.alias;
        const tagk = tpl.tagk;
        const metrics = [];
        // get tag values that matches metrics or namespace if metrics is empty
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            for (let j = 0; j < queries.length; j++) {
                const filters = queries[j].filters;
                let aliasFound = false;
                for (let k = 0; k < filters.length; k++) {
                    if (filters[k].tagk === tagk && filters[k].customFilter) {
                        filters[k].customFilter.forEach((f) => {
                            const hasNot = f[0] === '!';
                            const _alias = f.substring(
                                hasNot ? 2 : 1,
                                f.length - 1,
                            );
                            if (alias === _alias) {
                                aliasFound = true;
                            }
                        });
                    }
                }
                if (aliasFound) {
                    for (let k = 0; k < queries[j].metrics.length; k++) {
                        if (!queries[j].metrics[k].expression) {
                            metrics.push(
                                queries[j].namespace +
                                    '.' +
                                    queries[j].metrics[k].name,
                            );
                        }
                    }
                }
            }
        }
        const query: any = {
            tag: { key: tagk, value: val },
        };
        if (metrics.length) {
            query.metrics = metrics;
        } else {
            // eslint-disable-next-line max-len
            query.namespaces = tplVariables.namespaces;
        }
        return query;
    }
    // to build and array of array of resolve tpl filter value for subtitute
    // and only for tpl filter, mainly for regexp
    resolveTplViewValues(tplVariables: any, widgets: any[]): Observable<any> {
        const obs: any[] = [];
        const tpl = tplVariables.viewTplVariables; // we only resolve for view not edit mode
        const scopeMatched = [];
        for (let i = 0; i < tpl.tvars.length; i++) {
            if (tpl.tvars[i].filter.trim() !== '') {
                const filter = tpl.tvars[i].filter;
                const res = filter.match(/^regexp\((.*)\)$/);
                if (res) {
                    try {
                        const regx = new RegExp(res[1], 'gi');
                        if (
                            tpl.tvars[i].scope &&
                            tpl.tvars[i].scope.length > 0
                        ) {
                            // use scope to resolve
                            for (
                                let j = 0;
                                j < tplVariables.scopeCache[i].length;
                                j++
                            ) {
                                if (tplVariables.scopeCache[i][j].match(regx)) {
                                    scopeMatched.push(
                                        tplVariables.scopeCache[i][j],
                                    );
                                }
                            }
                            obs.push(of(scopeMatched));
                        } else {
                            const query = this.buildViewTagValuesQuery(
                                tplVariables,
                                widgets,
                                res[1],
                                i,
                            );
                            obs.push(this.httpService.getTagValues(query));
                        }
                    } catch (e) {
                        const err = (e as Error).message;
                        // eslint-disable-next-line no-console
                        console.info('Error: ', err);
                    }
                } else {
                    obs.push(of([filter]));
                }
            } else {
                obs.push(of([]));
            }
        }
        if (obs.length > 0) {
            return forkJoin(obs);
        } else {
            return of([]);
        }
    }

    addGridterInfo(widgets: any[]) {
        for (let i = 0; i < widgets.length; i++) {
            const w = widgets[i];
            const gpos = widgets[i].gridPos;
            const gridResp = {
                xMd: gpos.x,
                yMd: gpos.y,
                wMd: gpos.w,
                hMd: gpos.h,
                xSm: gpos.x,
                ySm: gpos.y,
                wSm: 1,
                hSm: 1,
            };
            widgets[i].gridPos = { ...widgets[i].gridPos, ...gridResp };
        }
    }

    updateTimeFromURL(dbstate) {
        const paramTime = this.urlOverride.getURLParamTime();
        if (paramTime) {
            const urlTime = this.urlOverride.getTimeOverrides(
                paramTime.zone || dbstate.content.settings.time.zone,
            );
            if (!dbstate.content.settings.time) {
                dbstate.content.settings.time = {};
            }
            const dbTime = dbstate.content.settings.time;
            if (urlTime.start) {
                dbTime.start = urlTime.start;
            }
            if (urlTime.end) {
                dbTime.end = urlTime.end;
            }
            if (urlTime.zone) {
                dbTime.zone = urlTime.zone;
            }
        }
    }

    updateTplVariablesFromURL(dbstate) {
        if (this.urlOverride.getTagOverrides()) {
            const urlTags = this.urlOverride.getTagOverrides();
            if (!dbstate.content.settings.tplVariables) {
                dbstate.content.settings.tplVariables = [];
            }
            const dbTags = this.utils.deepClone(
                dbstate.content.settings.tplVariables.tvars,
            );
            for (const k in urlTags) {
                if (urlTags[k]) {
                    let found = false;

                    // search for template variables using alias first
                    for (const j in dbTags) {
                        if (k === dbTags[j].alias) {
                            dbTags[j].filter = urlTags[k];
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // try against tag keys
                        for (const j in dbTags) {
                            if (k === dbTags[j].tagk) {
                                dbTags[j].filter = urlTags[k];
                                found = true;
                                break;
                            }
                        }
                    }
                }

                // as discuss, it's not there we don't add them in
                // only support if defined in default (edit) mode.
                /*
        if (!found) {
          // dashboard does not have any template
          // variables matching the url param.
          // create one as a best effort
          var newTag = {
            tagk: k,
            alias: k,
            filter: urlTags[k],
            mode: 'manual',
            applied: 0,
            isNew: 0
          };
          dbTags.push(newTag);
        } */
            }
            // keep override for view mode to use
            dbstate.content.settings.tplVariables['override'] = dbTags;
        }
    }

    getStorableFormatFromDBState(dbstate) {
        const widgets = this.utils.deepClone(dbstate.Widgets.widgets);
        for (let i = 0; i < widgets.length; i++) {
            if (widgets[i].gridPos) {
                widgets[i].gridPos.x = widgets[i].gridPos.xMd;
                widgets[i].gridPos.y = widgets[i].gridPos.yMd;
                delete widgets[i].gridPos.xMd;
                delete widgets[i].gridPos.yMd;
                delete widgets[i].gridPos.wMd;
                delete widgets[i].gridPos.hMd;
                delete widgets[i].gridPos.xSm;
                delete widgets[i].gridPos.ySm;
                delete widgets[i].gridPos.wSm;
                delete widgets[i].gridPos.hSm;
            }
            delete widgets[i].settings.time.zoomTime;
        }
        // will remove later, if no need to check this.
        const settings = this.utils.deepClone(dbstate.Settings);
        delete settings.mode;
        if (settings.tplVariables && settings.tplVariables.override) {
            delete settings.tplVariables.override;
        }

        if (settings.tplVariables && settings.tplVariables.scopeCache) {
            delete settings.tplVariables.scopeCache;
        }
        const dashboard = {
            version: this.dbConverterService.getDBCurrentVersion(),
            settings: settings,
            widgets: widgets,
        };
        return dashboard;
    }
}
