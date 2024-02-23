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
import { Location } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfigService } from './config.service';
import { UtilsService } from './utils.service';
import { DateUtilsService } from './dateutils.service';

@Injectable({
    providedIn: 'root',
})
export class URLOverrideService {
    version = 1;
    activeDashboardId = '';

    private subscription: Subscription = new Subscription();
    private overrides: any = {};

    getTimeOverrides(tz = 'utc') {
        if (this.overrides['time']) {
            const otz = this.overrides['time']['zone']
                ? this.overrides['time']['zone']
                : 'utc';
            if (this.overrides['time']['start']) {
                const t = this.overrides['time']['start'];
                const m = this.dateUtil.timeToMoment(t, otz);
                /* eslint-disable max-len */
                this.overrides['time']['start'] =
                    m === undefined
                        ? ''
                        : t.toLowerCase() === 'now' ||
                            this.dateUtil.relativeTimeToMoment(t)
                            ? t
                            : this.dateUtil.timestampToTime(
                                m.unix().toString(),
                                tz,
                            );
            }
            if (this.overrides['time']['end']) {
                const t = this.overrides['time']['end'];
                const m = this.dateUtil.timeToMoment(t, otz);
                this.overrides['time']['end'] =
                    m === undefined
                        ? ''
                        : t.toLowerCase() === 'now' ||
                            this.dateUtil.relativeTimeToMoment(t)
                            ? t
                            : this.dateUtil.timestampToTime(
                                m.unix().toString(),
                                tz,
                            );
            }
            return this.overrides['time'];
        }
    }

    getTagOverrides() {
        if (this.overrides['tags']) {
            return this.overrides['tags'];
        }
    }

    clearOverrides() {
        this.overrides = {};
        const url = this.getLocationURLandQueryParams();
        if (url['queryParams']) {
            url['queryParams'] = {};
        }
        this.updateLocationURL(url);
    }

    getURLParamTime() {
        return this.overrides['time'] || null;
    }

    applyURLParamsToDB(p) {
        const time = {};
        const tags = {};
        for (const k in p) {
            if (!p[k]) {
                continue;
            }
            const v = p[k];

            switch (k) {
                case '__start':
                    time['start'] = decodeURIComponent(v);
                    break;
                case '__end':
                    time['end'] = decodeURIComponent(v);
                    break;
                case '__tz':
                    time['zone'] = decodeURIComponent(v.toLowerCase());
                    break;
                default:
                    if (k.startsWith('__')) {
                        break;
                    }
                    // key doesn't start with '__'
                    // treat it like tag key
                    const decodeKey = decodeURIComponent(k);
                    tags[decodeKey] = decodeURIComponent(v);
                    break;
            }
        }
        if (Object.keys(time).length) {
            this.overrides['time'] = time;
        }
        if (Object.keys(tags).length) {
            this.overrides['tags'] = tags;
        }
    }

    getLocationURLandQueryParams() {
        const currentFullUrl = this.location.path();
        const urlParts = currentFullUrl.split('?');
        const queryParams = {};
        const urlObj = {};
        urlObj['path'] = urlParts[0];
        urlObj['queryParams'] = queryParams;
        if (urlParts.length > 1) {
            // split query params
            // at this moment, do not decode before the split
            const qp = urlParts[1].split('&');
            for (const p in qp) {
                if (!qp[p]) {
                    continue;
                }
                const s = qp[p].split('=');
                if (s.length > 1) {
                    queryParams[s[0]] = s[1];
                }
            }
        }
        return urlObj;
    }

    updateLocationURL(url) {
        if (url.path) {
            if (url.queryParams) {
                // create param string
                const params: string[] = [];
                for (const q in url['queryParams']) {
                    if (!url['queryParams'][q]) {
                        continue;
                    }
                    params.push(
                        q + '=' + encodeURIComponent(url['queryParams'][q]),
                    );
                }
                const paramString = params.join('&');
                this.location.replaceState(url.path, paramString);
            }
        }
    }

    constructor(
        private location: Location,
        private router: Router,
        private utils: UtilsService,
        private dateUtil: DateUtilsService,
        private appConfig: AppConfigService,
    ) {}

    initialize(options = null) {
        const url = this.getLocationURLandQueryParams();
        const otherParams = {};
        for (const k in url['queryParams']) {
            if (!url['queryParams'][k]) {
                continue;
            }
            const v = url['queryParams'][k];
            switch (k.toLowerCase()) {
                case '__tsdb_host':
                    this.appConfig.setConfig(
                        'tsdb_host',
                        decodeURIComponent(v),
                    );
                    this.appConfig.setConfig('tsdb_hosts', [
                        decodeURIComponent(v),
                    ]);
                    break;
                case '__config_host':
                    this.appConfig.setConfig('configdb', decodeURIComponent(v));
                    break;
                case '__meta_host':
                    this.appConfig.setConfig('metaApi', decodeURIComponent(v));
                    break;
                case '__debug_level':
                    this.appConfig.setConfig('debugLevel', v);
                    break;
                case '__tsdb_source':
                    this.appConfig.setConfig(
                        'tsdbSource',
                        decodeURIComponent(v),
                    );
                    break;
                case '__tsdb_cache':
                    this.appConfig.setConfig('tsdbCacheMode', v);
                    break;
                default:
                    otherParams[k] = v;
            }
        }
        if (
            options &&
            options.dbOverride &&
            Object.keys(otherParams).length > 0
        ) {
            this.applyURLParamsToDB(otherParams);
        }
    }

    applyParamstoURL(params) {
        const url: any = this.getLocationURLandQueryParams();
        const decodeQueryParams = {};
        for (const key in url.queryParams) {
            if (url.queryParams.hasOwnProperty(key)) {
                const decodeKey = decodeURIComponent(key);
                const decodeVal = decodeURIComponent(url.queryParams[key]);
                decodeQueryParams[decodeKey] = decodeVal;
            }
        }
        url.queryParams = decodeQueryParams;
        const tags: any = {};
        if (params.start) {
            /* eslint-disable max-len */
            url['queryParams']['__start'] =
                params.start.toLowerCase() === 'now' ||
                this.dateUtil.relativeTimeToMoment(params.start)
                    ? params.start
                    : this.dateUtil.timestampToTime(
                        this.dateUtil
                            .timeToMoment(params.start, params.zone)
                            .unix()
                            .toString(),
                        'UTC',
                        'YYYYMMDDTHHmmss',
                    );
        }
        if (params.end) {
            url['queryParams']['__end'] =
                params.end.toLowerCase() === 'now' ||
                this.dateUtil.relativeTimeToMoment(params.end)
                    ? params.end
                    : this.dateUtil.timestampToTime(
                        this.dateUtil
                            .timeToMoment(params.end, params.zone)
                            .unix()
                            .toString(),
                        'UTC',
                        'YYYYMMDDTHHmmss',
                    );
        }
        /*
        if (params.zone) {
            url['queryParams']['__tz'] = 'UTC';
        }
        */
        if (params.tags) {
            for (const i in params.tags) {
                if (!params.tags[i]) {
                    continue;
                }
                const tk = params.tags[i].alias;
                const tv = params.tags[i].filter;
                if (tk && tv) {
                    url['queryParams'][tk] = tv;
                    tags[tk] = tv;
                } else {
                    // if the value is set to empty, remove from queryParams
                    if (url['queryParams'][tk]) {
                        delete url['queryParams'][tk];
                    }
                }
            }
        }
        // we need to get overrides['tags'] when apply to url
        this.overrides['tags'] = tags;
        this.updateLocationURL(url);
    }
}
