import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { Router,  NavigationEnd } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UtilsService} from '../../core/services/utils.service';
import { DateUtilsService } from '../../core/services/dateutils.service';

@Injectable({
  providedIn: 'root'
})
export class URLOverrideService {
    version = 1;
    activeDashboardId = '';

    private subscription: Subscription = new Subscription();
    private overrides: any = {};

    getTimeOverrides() {
        if (this.overrides['time']) {
            const tz = this.overrides['time']['zone'] ? this.overrides['time']['zone'] : 'local';
            if ( this.overrides['time']['start'] ) {
                const t = this.overrides['time']['start'];
                const m = this.dateUtil.timeToMoment(t, tz);
                // tslint:disable:max-line-length
                this.overrides['time']['start'] = m === undefined ? '' : ( t.toLowerCase() === 'now' || this.dateUtil.relativeTimeToMoment(t) ? t : this.dateUtil.timestampToTime(m.unix().toString(), tz));
            }
            if ( this.overrides['time']['end'] ) {
                const t = this.overrides['time']['end'];
                const m = this.dateUtil.timeToMoment(t, tz);
                this.overrides['time']['end'] = m === undefined ? '' : ( t.toLowerCase() === 'now' || this.dateUtil.relativeTimeToMoment(t) ? t : this.dateUtil.timestampToTime(m.unix().toString(), tz));
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
        var url = this.getLocationURLandQueryParams();
        if (url['queryParams']) {
            url['queryParams'] = {};
        }
        this.updateLocationURL(url);
    }


    applyURLParamsToDB(p) {
        var time = {};
        var tags = {};
        for (var k in p) {
            var v = p[k];
            if (!v) continue;
            switch (k) {
                case '__start':
                    time['start'] = decodeURIComponent(v); break;
                case '__end':
                    time['end'] = decodeURIComponent(v); break;
                case '__tz':
                    time['zone'] = decodeURIComponent(v.toLowerCase()); break;
                default:
                    if (k.startsWith('__'))
                        break;
                    // key doesn't start with '__' 
                    // treat it like tag key
                    tags[k] = decodeURIComponent(v);
                    break;
            }
        }
        if (Object.keys(time).length)
            this.overrides['time'] = time;
        if (Object.keys(tags).length)
            this.overrides['tags'] = tags;
    }

    getLocationURLandQueryParams() {
        var currentFullUrl = this.location.path();
        var urlParts = currentFullUrl.split('?');
        var queryParams = {};
        var urlObj = {};
        urlObj['path'] = urlParts[0];
        urlObj['queryParams'] = queryParams;
        if (urlParts.length > 1) {
            // split query params
            // at this moment, do not decode before the split
            let qp = urlParts[1].split('&');
            for(let p in qp) {
                let s = qp[p].split('=');
                if (s.length > 1) {
                    queryParams[s[0]]  = s[1];
                }
            }
        }
        return urlObj;
    }

    updateLocationURL(url) {
        if (url.path) {
            if (url.queryParams) {
                // create param string
                var params: string[] = [];
                for (var q in url['queryParams']) {
                    params.push(q + "=" + encodeURIComponent(url['queryParams'][q]));
                }
                var paramString = params.join('&');
                this.location.replaceState(url.path, paramString);
            }
        }
    }

    constructor(
        private location: Location,
        private router: Router,
        private utils: UtilsService,
        private dateUtil: DateUtilsService
    ) {
        var url = this.getLocationURLandQueryParams();
        var otherParams = {};
        for (var k in url['queryParams']) {
            var v = url['queryParams'][k];
            switch (k.toLowerCase()) {
                case '__tsdb_host':
                    environment.tsdb_host = decodeURIComponent(v);
                    environment.tsdb_hosts = [decodeURIComponent(v)];
                    break;
                case '__config_host':
                    environment.configdb = decodeURIComponent(v);
                    break;
                case '__meta_host':
                    environment.metaApi = decodeURIComponent(v);
                    break;
                case '__debug_level':
                    environment.debugLevel = v;
                    break;
                    case '__tsdb_source':
                    environment.tsdbSource = decodeURIComponent(v);
                    break;
                case '__tsdb_cache':
                    environment.tsdbCacheMode = v;
                    break;
                default:
                    otherParams[k] = v;
            }
        }
        if (Object.keys(otherParams).length > 0) {
            this.applyURLParamsToDB(otherParams);
        }
    }

    applyParamstoURL(params) {
        let url = this.getLocationURLandQueryParams();
        let tags: any = {};
        if (params.start) {
            // tslint:disable:max-line-length
            url['queryParams']['__start'] = params.start.toLowerCase() === 'now' || this.dateUtil.relativeTimeToMoment(params.start) ? params.start : this.dateUtil.timestampToTime(this.dateUtil.timeToMoment(params.start, params.zone).unix().toString(), params.zone, 'YYYYMMDDTHHmmss');
        }
        if (params.end) {
            url['queryParams']['__end'] = params.end.toLowerCase() === 'now' || this.dateUtil.relativeTimeToMoment(params.end) ? params.end : this.dateUtil.timestampToTime(this.dateUtil.timeToMoment(params.end, params.zone).unix().toString(), params.zone, 'YYYYMMDDTHHmmss');
        }
        if (params.zone) {
            url['queryParams']['__tz'] = params.zone;
        }
        if (params.tags) {
            for (let i in params.tags) {
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