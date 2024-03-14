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
import { UtilsService } from './utils.service';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DashboardConverterService {
    currentVersion = 11;

    constructor(
        private utils: UtilsService,
        private httpService: HttpService,
    ) {}

    // call to convert dashboad to currentVersion
    convert(dashboard: any): Observable<any> {
        const i = dashboard.content.version + 1 || 2;
        return this['toDBVersion' + i](dashboard);
    }

    // to return current max version of dashboard
    getDBCurrentVersion() {
        return this.currentVersion;
    }

    // some helper/private functions for converter
    applytDBFilterToWidget(widget: any, payload: any, rawDbTags: any) {
        let isModify = false;
        const wid = widget.id;
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

    // helper and clean up un-used db filters
    private checkCount(tvar: any, widget: any, tvars: any[]): boolean {
        let inWidget = false;
        // check to apply each widget with this db filter
        // check id this fb filter in there to update the count
        for (let k = 0; k < widget.queries.length; k++) {
            const query = widget.queries[k];
            for (let c = 0; c < query.filters.length; c++) {
                // clean up db fitler in wiget queries that not there anymore, bug from previous conversion if there
                if (
                    query.filters[c].customFilter &&
                    query.filters[c].customFilter.length > 0
                ) {
                    query.filters[c].customFilter = query.filters[
                        c
                    ].customFilter.filter((alias) => {
                        const idx = tvars.findIndex(
                            (t) => alias === '[' + t.alias + ']',
                        );
                        return idx > -1 ? true : false;
                    });
                }
                // update count
                if (
                    query.filters[c].customFilter &&
                    query.filters[c].customFilter.includes(
                        '[' + tvar.alias + ']',
                    )
                ) {
                    inWidget = true;
                }
            }
            // remove if these fitler is empty value
            query.filters = query.filters.filter(
                (f) =>
                    f.filter.length > 0 ||
                    (f.customFilter && f.customFilter.length > 0),
            );
        }
        return inWidget;
    }
    // - end of helper private, put your helper/private functions in above block of code

    // update dashboard to version 2
    toDBVersion2(dashboard: any): Observable<any> {
        dashboard.content.version = 2;
        const widgets = dashboard.content.widgets;
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            for (let j = 0; j < queries.length; j++) {
                const metrics = queries[j].metrics;
                const filters = queries[j].filters;
                const groupByTags = [];
                for (let k = 0; k < filters.length; k++) {
                    if (filters[k].groupBy === true) {
                        groupByTags.push(filters[k].tagk);
                    }
                }
                for (let k = 0; k < metrics.length; k++) {
                    // metrics
                    if (
                        metrics[k].expression === undefined &&
                        !metrics[k].groupByTags
                    ) {
                        metrics[k].tagAggregator =
                            metrics[k].tagAggregator || 'sum';
                        metrics[k].groupByTags = groupByTags;
                    }
                    if (metrics[k].expression && metrics[k].metrics) {
                        metrics[k].expression = metrics[k].originalExpression;
                        const emetrics = metrics[k].metrics;
                        // add missing metric to the metric list
                        for (let m = 0; m < emetrics.length; m++) {
                            const pos = emetrics[m].name.indexOf('.') + 1;
                            emetrics[m].metric = emetrics[m].name.substr(pos);
                            const metric = metrics.find(
                                (d) =>
                                    d.expression === undefined &&
                                    d.name === emetrics[m].metric,
                            );
                            if (!metric) {
                                const oMetric = {
                                    id: this.utils.generateId(
                                        3,
                                        this.utils.getIDs(
                                            this.utils.getAllMetrics(queries),
                                        ),
                                    ),
                                    name: emetrics[m].metric,
                                    settings: {
                                        visual: {
                                            visible: false,
                                            color: 'auto',
                                            label: '',
                                        },
                                    },
                                    tagAggregator: 'sum',
                                    functions: [],
                                };
                                metrics.push(oMetric);
                            }
                        }
                        for (let m = 0; m < emetrics.length; m++) {
                            const pos = emetrics[m].name.indexOf('.') + 1;
                            emetrics[m].metric = emetrics[m].name.substr(pos);
                            const metric = metrics.find(
                                (d) =>
                                    d.expression === undefined &&
                                    d.name === emetrics[m].metric,
                            );
                            emetrics[m].newId = metric ? metric.id : null;
                            const reg = new RegExp(emetrics[m].refId, 'g');
                            metrics[k].expression = metrics[
                                k
                            ].expression.replace(
                                reg,
                                '{{' + emetrics[m].newId + '}}',
                            );
                        }
                    }
                }
            }
        }
        return this.toDBVersion3(dashboard);
    }
    // update dashboard to version 3, we move tplVariables to top and remove
    // enable things
    toDBVersion3(dashboard: any): Observable<any> {
        dashboard.content.version = 3;
        const tplVariables = [
            ...dashboard.content.settings.variables.tplVariables,
        ];
        for (let i = 0; i < tplVariables.length; i++) {
            const varObj: any = tplVariables[i];
            // remove this property
            if (varObj.hasOwnProperty('enabled')) {
                delete varObj.enabled;
            }
            if (varObj.hasOwnProperty('allowedValues')) {
                delete varObj.allowedValues;
            }
            if (varObj.hasOwnProperty('type')) {
                delete varObj.type;
            }
            // take first value only if many
            if (varObj.filter.length > 0) {
                varObj.filter = varObj.filter[0];
            }
            // there is case that user did not set the alias
            if (varObj.alias.trim() === '') {
                varObj.alias = varObj.tagk;
            }
        }
        // dashboard mode was set wrong to true in some dashboards
        dashboard.content.settings.mode = 'dashboard';
        // clean up tags and lastQueriedTagValues
        if (dashboard.content.settings.tags) {
            delete dashboard.content.settings.tags;
        }
        if (dashboard.content.settings.lastQueriedTagValues) {
            delete dashboard.content.settings.lastQueriedTagValues;
        }
        // delete the old one
        delete dashboard.content.settings.variables;
        dashboard.content.settings.tplVariables = tplVariables;

        // we also need to convert topN chart to make sure only 1 series is enable
        const widgets = [...dashboard.content.widgets];
        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];
            if (widget.settings.component_type === 'TopnWidgetComponent') {
                const idx = [];
                for (let j = 0; j < widget.queries[0].metrics.length; j++) {
                    if (widget.queries[0].metrics[j].settings.visual.visible) {
                        idx.push(j);
                    }
                }
                if (idx.length > 1) {
                    for (let k = 1; i < idx.length; k++) {
                        widget.queries[0].metrics[
                            idx[k]
                        ].settings.visual.visible = false;
                    }
                }
            }
        }
        dashboard.content.widgets = widgets;
        return this.toDBVersion4(dashboard);
    }

    // update dashboard to version 4, convert array to string
    toDBVersion4(dashboard: any): Observable<any> {
        dashboard.content.version = 4;
        const tplVariables = [...dashboard.content.settings.tplVariables];
        for (let i = 0; i < tplVariables.length; i++) {
            const varObj: any = tplVariables[i];
            if (Array.isArray(varObj.filter)) {
                if (varObj.filter.length > 0) {
                    varObj.filter = varObj.filter[0];
                } else {
                    varObj.filter = '';
                }
            }
        }
        dashboard.content.settings.tplVariables = tplVariables;
        return this.toDBVersion5(dashboard);
    }

    // update dashboard to version 5, make sure ids are unique within widget and replace expression references
    toDBVersion5(dashboard: any): Observable<any> {
        dashboard.content.version = 5;
        const widgets = dashboard.content.widgets;
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            // if (widgets[i].settings.component_type === 'LinechartWidgetComponent') {
            const ids = new Set();
            ids.add(widgets[i].id);
            for (let j = 0; j < queries.length; j++) {
                const metrics = queries[j].metrics;
                for (let k = 0; k < metrics.length; k++) {
                    // metrics
                    if (ids.has(metrics[k].id)) {
                        const oldId = metrics[k].id;
                        const newId = this.utils.generateId(
                            3,
                            this.utils.getIDs(
                                this.utils.getAllMetrics(queries),
                            ),
                        );
                        this.utils.replaceIdsInExpressions(
                            newId,
                            oldId,
                            metrics,
                        );
                        metrics[k].id = newId;
                        ids.add(newId);
                    } else {
                        ids.add(metrics[k].id);
                    }
                }
            }
            // }
        }
        return this.toDBVersion6(dashboard);
    }

    // update dashboard to version 6: make sure summarizer is set for barchart, big number, donut, and topn
    toDBVersion6(dashboard: any): Observable<any> {
        dashboard.content.version = 6;
        const widgets = dashboard.content.widgets;
        for (let i = 0; i < widgets.length; i++) {
            const queries = widgets[i].queries;
            if (
                widgets[i].settings.component_type ===
                    'BarchartWidgetComponent' ||
                widgets[i].settings.component_type ===
                    'BignumberWidgetComponent' ||
                widgets[i].settings.component_type === 'DonutWidgetComponent' ||
                widgets[i].settings.component_type === 'TopnWidgetComponent'
            ) {
                for (let j = 0; j < queries.length; j++) {
                    const metrics = queries[j].metrics;
                    for (let k = 0; k < metrics.length; k++) {
                        // metrics
                        if (!metrics[k].summarizer) {
                            metrics[k].summarizer = 'avg';
                        }
                    }
                }
            }
        }
        return this.toDBVersion7(dashboard);
    }
    // update dashboard to version 7: set eventQueries if not there
    toDBVersion7(dashboard: any): Observable<any> {
        dashboard.content.version = 7;
        const widgets = dashboard.content.widgets;
        for (let i = 0; i < widgets.length; i++) {
            if (
                widgets[i].settings.component_type ===
                'LinechartWidgetComponent'
            ) {
                if (!widgets[i].settings.visual || !widgets[i].eventQueries) {
                    widgets[i].settings.visual = {};
                    widgets[i].settings.visual.showEvents = false;
                    widgets[i].eventQueries = [];
                    widgets[i].eventQueries[0] = {};
                    widgets[i].eventQueries[0].namespace = '';
                    widgets[i].eventQueries[0].search = '';
                    widgets[i].eventQueries[0].id = 'q1_m1';
                }
            }
        }
        return this.toDBVersion8(dashboard);
    }

    // update dashboard to version 8
    // to deal with dashboard template v2
    toDBVersion8(dashboard: any) {
        return new Observable((observer) => {
            this.httpService
                .getTagKeysForQueries(dashboard.content.widgets)
                .subscribe((res) => {
                    dashboard.content.version = 8;
                    const settings = dashboard.content.settings;
                    const widgets = dashboard.content.widgets;
                    let tplVariables: any = {};
                    // there was a bug that save v8 of db filter at v7
                    if (
                        settings.tplVariables &&
                        settings.tplVariables.tvars &&
                        settings.tplVariables.namespaces
                    ) {
                        tplVariables = settings.tplVariables;
                    } else {
                        const tvars = settings.tplVariables || [];
                        // get all namespace from widgets
                        const namespaces = {};
                        for (let i = 0; i < widgets.length; i++) {
                            const queries = widgets[i].queries;
                            for (let j = 0; j < queries.length; j++) {
                                if (queries[j].namespace) {
                                    namespaces[queries[j].namespace] = true;
                                }
                            }
                        }
                        // update tvars format

                        for (let i = 0; i < tvars.length; i++) {
                            tvars[i].mode = 'auto';
                            tvars[i].applied = 0;
                            tvars[i].isNew = 0;
                        }
                        tplVariables = {
                            namespaces: Object.keys(namespaces),
                            tvars: tvars,
                        };
                    }

                    const dbTags = this.formatDbTagKeysByWidgets(res);
                    for (let i = 0; i < tplVariables.tvars.length; i++) {
                        const tvar = tplVariables.tvars[i];
                        const payload = {
                            vartag: tvar,
                            originAlias: [],
                            index: i,
                            insert: 1,
                        };
                        // check to apply each widget with this db filter
                        for (let j = 0; j < widgets.length; j++) {
                            const widget = widgets[j];
                            // if they set not use DbFilter then we do not modify them at all.
                            if (
                                widget.settings.hasOwnProperty('useDBFilter') &&
                                !widget.settings.useDBFilter
                            ) {
                                continue;
                            }
                            const isModify = this.applytDBFilterToWidget(
                                widget,
                                payload,
                                dbTags.rawDbTags,
                            );
                            if (isModify) {
                                tvar.applied = tvar.applied + 1;
                            }
                        }
                    }
                    delete dashboard.content.settings.tplVariables;
                    dashboard.content.settings.tplVariables = tplVariables;
                    delete dashboard.content.widgets;
                    dashboard.content.widgets = widgets;
                    this.toDBVersion9(dashboard).subscribe((res1) => {
                        observer.next(res1);
                        observer.complete();
                    });
                });
        });
    }

    // fix the count of db filters when convert at version 8
    toDBVersion9(dashboard: any): Observable<any> {
        return new Observable((observer) => {
            dashboard.content.version = 9;
            const widgets = dashboard.content.widgets;
            const tplVariables = dashboard.content.settings.tplVariables;
            for (let i = 0; i < tplVariables.tvars.length; i++) {
                const tvar = tplVariables.tvars[i];
                tvar.applied = 0;
                for (let j = 0; j < widgets.length; j++) {
                    const isInWidget = this.checkCount(
                        tvar,
                        widgets[j],
                        tplVariables.tvars,
                    );
                    if (isInWidget) {
                        tvar.applied += 1;
                    }
                }
            }
            this.toDBVersion10(dashboard).subscribe((res) => {
                observer.next(res);
                observer.complete();
            });
        });
    }
    // adding dashboard downsample settings
    toDBVersion10(dashboard: any): Observable<any> {
        return new Observable((observer) => {
            dashboard.content.version = 10;
            const settings = dashboard.content.settings;
            // set default
            if (!settings.downsample) {
                settings.downsample = {
                    aggregators: [''],
                    customUnit: '',
                    customValue: '',
                    value: 'auto',
                };
            }
            this.toDBVersion11(dashboard).subscribe((res) => {
                observer.next(dashboard);
                observer.complete();
            });
        });
    }

    toDBVersion11(dashboard: any): Observable<any> {
        return new Observable((observer) => {
            dashboard.content.version = 11;
            const widgets = dashboard.content.widgets;
            for (let i = 0; i < widgets.length; i++) {
                if (
                    ['TopnWidgetComponent', 'HeatmapWidgetComponent'].includes(
                        widgets[i].settings.component_type,
                    ) &&
                    (!widgets[i].settings.visual.color ||
                        widgets[i].settings.visual.color === 'auto')
                ) {
                    switch (widgets[i].settings.component_type) {
                        case 'HeatmapWidgetComponent':
                            widgets[i].settings.visual.color = '#3F00FF';
                            break;
                        case 'TopnWidgetComponent':
                            widgets[i].settings.visual.color = '#dff0ff';
                            break;
                    }
                } else if (
                    widgets[i].settings.component_type ===
                    'BignumberWidgetComponent'
                ) {
                    widgets[i].settings.visual.backgroundColor =
                        widgets[i].settings.visual.backgroundColor || '#0B5ED2';
                    widgets[i].settings.visual.color =
                        widgets[i].settings.visual.textColor || '#FFFFFF';
                } else if (
                    widgets[i].settings.component_type ===
                    'EventsWidgetComponent'
                ) {
                    widgets[i].settings.title =
                        '({{eventCount}}) {{namespace}}-{{eventQuery}}';
                } else {
                    const queries = widgets[i].queries;
                    for (let j = 0; j < queries.length; j++) {
                        const metrics = queries[j].metrics;
                        for (let k = 0; k < metrics.length; k++) {
                            if (metrics[k].settings.visual.color === 'auto') {
                                metrics[k].settings.visual.color = '';
                            }
                        }
                    }
                }
            }
            observer.next(dashboard);
            observer.complete();
        });
    }
}
