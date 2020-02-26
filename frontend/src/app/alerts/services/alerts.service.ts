import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

import { LoggerService } from '../../core/services/logger.service';
import { UtilsService } from '../../core/services/utils.service'

@Injectable()
export class AlertsService {

    version = 1;
    constructor(
        private logger: LoggerService,
        private http: HttpClient,
        private utils: UtilsService
    ) { }

    /**
     * Error Handler
     *
     * to handle error with more info
     */

    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.logger.error('AlertsService :: An API error occurred', error.error.message);
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

        const apiUrl = environment.configdb + '/namespace/member';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        // this.logger.api('AlertsService :: Get Namespaces I Belong to', apiUrl);

        return this.http.get(apiUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    getNamespaces(): Observable<any> {
        const apiUrl = environment.configdb + '/namespace';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        // this.logger.api('AlertsService :: Get All Namespaces', apiUrl);

        return this.http.get(apiUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }
}
