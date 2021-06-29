import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AppConfigService } from '../../core/services/config.service';
import { catchError, map, tap } from 'rxjs/operators';

import { ConsoleService } from '../../core/services/console.service';
import { UtilsService } from '../../core/services/utils.service'

@Injectable()
export class AlertsService {

    version = 1;
    constructor(
        private console: ConsoleService,
        private http: HttpClient,
        private utils: UtilsService,
        private appConfig: AppConfigService
    ) { }

    /**
     * Error Handler
     *
     * to handle error with more info
     */

    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.console.error('AlertsService :: An API error occurred', error.error.message);
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

    /**
     * API METHODS
     */

    getUserNamespaces() {

        const apiUrl = this.appConfig.getConfig().configdb + '/namespace/member';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        // this.console.api('AlertsService :: Get Namespaces I Belong to', apiUrl);

        return this.http.get(apiUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    getNamespaces(): Observable<any> {
        const apiUrl = this.appConfig.getConfig().configdb + '/namespace';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        // this.console.api('AlertsService :: Get All Namespaces', apiUrl);

        return this.http.get(apiUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }
}
