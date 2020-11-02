import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MetaService } from '../services/meta.service';
import { YamasService } from '../services/yamas.service';
import { UtilsService } from '../services/utils.service';
import { LoggerService } from '../services/logger.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    override_host = {
        tsdb_host: '',
        meta_host: '',
        cfgdb_host: ''
    };

    regexMetricFormat = /([^\.]*)\.([^\.]*)\.(.*)/;

    assigned_tsdb_host = ''; // use for session of the app.

    constructor(
        private http: HttpClient,
        private metaService: MetaService,
        private utils: UtilsService,
        private logger: LoggerService,
        private yamasService: YamasService) { }

    getDashoard(id: string): Observable<any> {
        const apiUrl = environment.configdb + '/object/' + id;
        return this.http.get(apiUrl, { withCredentials: true })
            .pipe(
                map((data: any) => JSON.parse(data.content))
            );
    }

    /* to handle error  with more info */
    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            console.log('An error occured:', error.error.message);
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                `body was: ${error.error}`
            );
        }
        return throwError(
            'Something bad happened; please try again later.'
        );
    }
    /* will refactor later */
    getYamasData(payload: any): Observable<any> {
        var headers = new HttpHeaders(
            { 'Content-Type': 'application/json' });
        headers = headers.set('X-Horizon-DSHBID', String(payload.dbid))
                         .set('X-Horizon-WID', String(payload.wid));
        // simple random from 0 to length of hosts - 1
        // const metricsUrl = environment.tsdb_host + '/api/query/graph';
         // const metricsUrl = environment.tsdb_hosts[Math.floor(Math.random() * (environment.tsdb_hosts.length - 1))] + '/api/query/graph';
        if (this.assigned_tsdb_host === '') {
            this.assigned_tsdb_host = environment.tsdb_hosts[Math.floor(Math.random() * (environment.tsdb_hosts.length - 1))] + '/api/query/graph';
        }
        return this.http.post(this.assigned_tsdb_host, payload.query, { headers, withCredentials: true });
    }

    getAlertCount(options: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const statusApiUrl = environment.tsdb_hosts[Math.floor(Math.random() * (environment.tsdb_hosts.length - 1))] + '/api/query/graph';
        const statusQuery = this.yamasService.buildStatusQuery(options);

        return this.http.post(statusApiUrl, statusQuery, { headers, withCredentials: true })
            .pipe(catchError(error => of( { error : error } ) ));
    }

    /* post to search for metric */
    searchMetrics(queryObj: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('/search/msearch', queryObj, { headers, withCredentials: true })
            .pipe(
                catchError(this.handleError)
            );
    }

    getNamespaces(queryObj: any, source= 'meta'): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const apiUrl = environment.metaApi + '/search/timeseries';
        const query = this.metaService.getQuery(source, 'NAMESPACES', queryObj);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
            .pipe(
                map((res: any) => res ? res.results[0].namespaces : []),
            );
    }
    // to get all tagkeys by namespaces
    // can pass a list of namespace and optional a list of metrics
    // queryObj = { namespaces: ['ssp', 'yamas'] }
    getTagKeys(queryObj: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const newQueryParams = {};
        const namespaces = queryObj.namespaces || [];
        for (let i = 0, len = namespaces.length; i < len; i++) {
            const namespace = namespaces[i];
            if (!newQueryParams[namespace]) {
                newQueryParams[namespace] = { search: '', namespace: namespace, metrics: [] };
            }
        }
        const metrics = queryObj.metrics || [];
        for (let i = 0, len = metrics.length; i < len; i++) {
            const res = metrics[i].match(this.regexMetricFormat);
            const namespace = res[1];
            const metric = res[2] + '.' + res[3];
            if (!newQueryParams[namespace]) {
                newQueryParams[namespace] = { search: '', namespace: namespace, metrics: [] };
            }
            newQueryParams[namespace].metrics.push(metric);
        }
        const apiUrl = environment.metaApi + '/search/timeseries';
        const query = this.metaService.getQuery('meta', 'TAG_KEYS', Object.values(newQueryParams));
        // console.log('tag query for query', query);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
            .pipe(
                map((res: any) => {
                    let tagkeys = [];
                    const len = res && res.results ? res.results.length : 0;
                    for (let i = 0; i < len; i++) {
                        const keys = res.results[i].tagKeys.filter(item => tagkeys.indexOf(item.name) === -1);
                        tagkeys = tagkeys.concat(keys.map(d => d.name));
                    }
                    return tagkeys.sort(this.utils.sortAlphaNum);
                })
            );
    }


    getMetricsByNamespace(queryObj: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const apiUrl = environment.metaApi + '/search/timeseries';
        const query = this.metaService.getQuery('meta', 'METRICS', queryObj);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
            .pipe(
                map((res: any) => res ? res.results[0].metrics : [])
            );
    }

    getTagKeysForQueries(widgets): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const newQueries = [];
        for (let i = 0, len = widgets.length; i < len; i++) {
            const queries = widgets[i].queries;
            for (let j = 0;  j < queries.length; j++) {
                let hasMetric = false;
                const q = { id: widgets[i].id + ':' + queries[j].id, search: '', namespace: queries[j].namespace, metrics: [] };
                for (let k = 0;  k < queries[j].metrics.length; k++) {
                    if ( queries[j].metrics[k].expression === undefined ) {
                        q.metrics.push(queries[j].metrics[k].name);
                        hasMetric = true;
                    }
                }
                if ( hasMetric ) {
                    newQueries.push(q);
                }
            }
        }
        if ( newQueries.length ) {
            const query = this.metaService.getQuery('meta', 'TAG_KEYS', newQueries);
            const apiUrl = environment.metaApi + '/search/timeseries';
            return this.http.post(apiUrl, query, { headers, withCredentials: true });
        } else {
            return of({ 'results': [] });
        }
    }
    getNamespaceTagKeys(queryObj: any, source = 'meta'): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const apiUrl =  environment.metaApi + '/search/timeseries';
        const query = this.metaService.getQuery(source, 'TAG_KEYS', queryObj);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
            .pipe(
                map((res: any) => res ? res.results[0].tagKeys : [])
            );
    }

    getTagValuesByNamespace(queryObj: any, source = 'meta'): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const apiUrl =  environment.metaApi + '/search/timeseries';
      const query = this.metaService.getQuery(source, 'TAG_KEYS_AND_VALUES', queryObj, false);
      return this.http.post(apiUrl, query, { headers, withCredentials: true })
                        .pipe(
                          map((res: any) => res && res.results[0].tagKeysAndValues[queryObj.tagkey] ?
                            res.results[0].tagKeysAndValues[queryObj.tagkey].values : []),
                        );
    }

    getTagKeysAndTagValuesByNamespace(queryObj: any, source = 'meta'): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
          });
        const apiUrl =  environment.metaApi + '/search/timeseries'; 
        const query = this.metaService.getQuery(source, 'BASIC', queryObj, false);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
                            .pipe(
                                map((res: any) => res && res.results[0] ? res.results[0] : {'tagKeysAndValues': {}})
                            );
    }

    // results should filter the lists from already selected filters
    getTagValues(queryObj: any): Observable<string[]> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const newQueryParams = {};
        const namespaces = queryObj.namespaces || [];
        for (let i = 0, len = namespaces.length; i < len; i++) {
            if (!newQueryParams[namespaces[i]]) {
                newQueryParams[namespaces[i]] = { 
                    tagkey: queryObj.tag.key, 
                    search: queryObj.tag.value, 
                    namespace: namespaces[i], 
                    metrics: [], 
                    tags: queryObj.tagsFilter };
            }
        }

        const metrics = queryObj.metrics || [];
        for (let i = 0, len = metrics.length; i < len; i++) {
            const res = metrics[i].match(this.regexMetricFormat);
            const namespace = res[1];
            const metric = res[2] + '.' + res[3];
            if (!newQueryParams[namespace]) {
                newQueryParams[namespace] = { 
                    tagkey: queryObj.tag.key, 
                    search: queryObj.tag.value, 
                    namespace: namespace, 
                    metrics: [],
                    tags: queryObj.tagsFilter };
            }
            newQueryParams[namespace].metrics.push(metric);
        }
        const apiUrl = environment.metaApi + '/search/timeseries';
        const query = this.metaService.getQuery('meta', 'TAG_KEYS_AND_VALUES', Object.values(newQueryParams), false);
        return this.http.post(apiUrl, query, { headers, withCredentials: true })
            .pipe(
                map((res: any) => {
                    // console.log('the res', res);
                    let tagvalues = [];
                    for (let i = 0; res && i < res.results.length; i++) {
                        if (Object.keys(res.results[i].tagKeysAndValues).length > 0 && res.results[i].tagKeysAndValues[queryObj.tag.key]) {
                            const keys = res.results[i].tagKeysAndValues[queryObj.tag.key].values
                                .filter(item => tagvalues.indexOf(item.name) === -1);
                            tagvalues = tagvalues.concat(keys.map(d => d.name));
                        }
                    }
                    return tagvalues.sort(this.utils.sortAlphaNum);
                })
            );
    }

    getDashboardByPath(path: string) {
        const apiUrl = environment.configdb + '/dashboard/' + path;
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        return this.http.get(apiUrl, httpOptions);
    }

    getDashboardById(id: string) {
        const apiUrl = environment.configdb + '/dashboard/file/' + id;
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        return this.http.get(apiUrl, httpOptions);
    }

    getDashboards() {
        const apiUrl = environment.configdb + '/object';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = { 'userId': 'user.arunmohzi', 'type': 'DASHBOARD' };
        // console.log("get dahboards params", apiUrl, params);
        return this.http.get(apiUrl, { params: params, headers, withCredentials: true });
    }

    // id is not use for now, but just carry it here
    saveDashboard(id, data) {
        const apiUrl = environment.configdb + '/dashboard/file';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        // console.log("save dahboard params", apiUrl, data);
        return this.http.put(apiUrl, data, httpOptions);
    }

    deleteDashboard(id) {
        /* This API call is an invalid endpoint */
        const apiUrl = environment.configdb + '/object/' + id;
        return this.http.delete(apiUrl, { withCredentials: true });
    }

    userNamespaces() {
        const apiUrl = environment.configdb + '/namespace/member';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        return this.http.get(apiUrl, httpOptions);
    }

    getUserFolderData() {
        const apiUrl = environment.configdb + '/dashboard/topFolders';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        // console.log('[API] getUserFolderData', apiUrl, httpOptions);
        return this.http.get(apiUrl, httpOptions);
    }

    getRecipients(namespace: string) {
        const apiUrl = environment.configdb + '/namespace/' + namespace + '/contact';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        return this.http.get(apiUrl, httpOptions);
    }

    postRecipient(data: any) {
        const apiUrl = environment.configdb + '/namespace/' + data.namespace + '/contact';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        // tslint:disable:prefer-const
        let serverData: any = {};
        serverData[data.type] = [];
        let recipient: any = {... data};
        delete recipient.type;
        delete recipient.namespace;
        serverData[data.type][0] = recipient;
        return this.http.post(apiUrl, serverData, httpOptions);
    }

    updateRecipient(data: any) {
        const apiUrl = environment.configdb + '/namespace/' + data.namespace + '/contact';
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        // tslint:disable:prefer-const
        let serverData: any = {};
        serverData[data.type] = [];
        let recipient: any = {... data};
        delete recipient.type;
        delete recipient.namespace;
        serverData[data.type][0] = recipient;
        return this.http.put(apiUrl, serverData, httpOptions);
    }

    deleteRecipient(data: any) {
        const apiUrl = environment.configdb + '/namespace/' + data.namespace + '/contact/delete';
        // tslint:disable-next-line:prefer-const
        let httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true,
            observe: 'response' as 'response'
        };
        // tslint:disable-next-line:prefer-const
        let serverData: any = {};
        serverData[data.type] = [];
        serverData[data.type][0] = { id: data.id };
        return this.http.put(apiUrl, serverData, httpOptions);
    }

    saveAlert(namespace, payload: any): Observable<any> {
        this.logger.api('saveAlert', {namespace, payload});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/namespace/' + namespace + '/alert';
        if ( !payload.data[0].id  ) {
            return this.http.post(apiUrl, payload.data, { headers, withCredentials: true });
        } else {
            // payload.data[0].id = payload.id;
            return this.http.put(apiUrl, payload.data, { headers, withCredentials: true });
        }
    }

    getAlertDetailsById(id: number): Observable<any> {
        this.logger.api('getAlertDetailsById', {id});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/alert/' + id;
        return this.http.get(apiUrl, { headers, withCredentials: true });
    }

    getAlerts(options): Observable<any> {
        // this.logger.api('getAlerts', {options});
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
          });

        const statusQuery = this.yamasService.buildStatusQuery(options);
        const apiUrl = environment.configdb + '/namespace/' + options.namespace + '/alert';
        const statusApiUrl = environment.tsdb_hosts[Math.floor(Math.random() * (environment.tsdb_hosts.length - 1))] + '/api/query/graph';
            return forkJoin([
                    this.http.get(apiUrl, { headers, withCredentials: true })
                            .pipe(catchError(error => of( { error : error } ) )),
                    this.http.post(statusApiUrl, statusQuery, { headers, withCredentials: true })
                            .pipe(catchError(error => of( { error : error } ) ))
                ]).pipe(
                    switchMap( (res: any) => {
                        if ( res[0].error ) {
                            return throwError(res[0].error);
                        }
                        const alertCounts = {};
                        if ( res[1].error === undefined && res[1].results ) {
                            const sData = res[1].results[0].data;
                            for ( let i = 0; i < sData.length; i++ ) {
                                const alertId = parseInt(sData[i].tags._alert_id, 10);
                                alertCounts[alertId] = sData[i].summary;
                            }
                        }
                        // set the status counts
                        const defCounts = { bad: 0, warn: 0, good: 0, unknown: 0, missing: 0 };
                        for ( let i = 0; i < res[0].length; i++ ) {
                            const alertId = res[0][i].id;
                            const counts = alertCounts[alertId] ? alertCounts[alertId] : {};
                            res[0][i] = { ...res[0][i], ...defCounts,  ...counts };
                        }
                        return of(res[0]);
                    })
                );
    }

    deleteAlerts(namespace, payload): Observable<any> {
        this.logger.api('deleteAlerts', {namespace, payload});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/namespace/' + namespace + '/alert/delete';
        // console.log("deleteA;lert", namespace, payload);
        return this.http.put(apiUrl, payload.data, { headers, withCredentials: true });
    }

    /** snooze */
    saveSnooze(namespace, payload: any): Observable<any> {
        this.logger.api('saveSnooze', {namespace, payload});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/namespace/' + namespace + '/snooze';
        if ( !payload.data[0].id  ) {
            return this.http.post(apiUrl, payload.data, { headers, withCredentials: true });
        } else {
            // payload.data[0].id = payload.id;
            return this.http.put(apiUrl, payload.data, { headers, withCredentials: true });
        }
    }

    getSnoozeDetailsById(id: number): Observable<any> {
        this.logger.api('getSnoozeDetailsById', {id});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/snooze/' + id;
        return this.http.get(apiUrl, { headers, withCredentials: true });
    }

    getSnoozes(options): Observable<any> {
        this.logger.api('getSnoozes', {options});
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
          });
        const apiUrl = environment.configdb + '/namespace/' + options.namespace + '/snooze';
        return this.http.get(apiUrl, { headers, withCredentials: true });
    }

    deleteSnoozes(namespace, payload): Observable<any> {
        this.logger.api('deleteSnoozes', {namespace, payload});
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.configdb + '/snooze/delete';
        return this.http.put(apiUrl, payload.data, { headers, withCredentials: true });
    }
    /** snooze */

    getEvents(wid: string, time: any, eventQueries: any[], limit) {
        let query = this.yamasService.buildEventsQuery(time, eventQueries, limit);
        // console.log(JSON.stringify(query, null, 2));
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const apiUrl = environment.tsdb_hosts[Math.floor(Math.random() * (environment.tsdb_hosts.length - 1))] + '/api/query/graph';

        return this.http.post(apiUrl, query, { headers, withCredentials: true }).pipe(
            map((res: any) => {
                let events = [], counts: any = {};
                counts.results = res && res.results.length ? res.results.filter(d =>  d.source.indexOf('count') !== -1 ) : [];
                for (let i = 0; res && i < res.results.length; i++) {
                    for (let j = 0; res.results[i] && j < res.results[i].data.length; j++) {
                        if (Object.keys(res.results[i].data[j]).length > 0 && res.results[i].data[j].EventsType) {
                            const event = res.results[i].data[j].EventsType;
                            // put tags at top-level
                            if (res.results[i].data[j].tags) {
                                event.tags = res.results[i].data[j].tags;
                            }
                            // time in milliseconds
                            if (String(event.timestamp).length === 10) {
                                event.timestamp = event.timestamp * 1000;
                            }
                            events.push(event);
                        }
                    }
                }
                return {events: events, counts: counts, wid: wid, time: time, eventQueries: eventQueries};
            })
        );
    }
}
