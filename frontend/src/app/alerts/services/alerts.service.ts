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
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AppConfigService } from '../../core/services/config.service';
import { catchError, map, tap } from 'rxjs/operators';

import { UtilsService } from '../../core/services/utils.service';

@Injectable()
export class AlertsService {
    version = 1;
    constructor(
        private http: HttpClient,
        private utils: UtilsService,
        private appConfig: AppConfigService,
    ) {}

    /**
     * Error Handler
     *
     * to handle error with more info
     */

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            console.group(
                '%cERROR%cAlertsService :: An API error occurred',
                'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
                'color: #ff0000; padding: 4px 8px; font-weight: bold',
            );
            console.log(
                '%cErrorMsg',
                'font-weight: bold;',
                error.error.message,
            );
            console.groupEnd();
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                    `body was: ${error.error}`,
            );
        }
        return throwError('Something bad happened; please try again later.');
    }

    /**
     * API METHODS
     */

    getUserNamespaces() {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/namespace/member';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .get(apiUrl, httpOptions)
            .pipe(catchError(this.handleError));
    }

    getNamespaces(): Observable<any> {
        const apiUrl = this.appConfig.getConfig().configdb + '/namespace';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .get(apiUrl, httpOptions)
            .pipe(catchError(this.handleError));
    }
}
