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
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UtilsService } from '../../core/services/utils.service';
import { AppConfigService } from '../../core/services/config.service';

import { ConsoleService } from '../../core/services/console.service';

@Injectable()
export class AppShellService {

    constructor(
        private appConfig: AppConfigService,
        private console: ConsoleService,
        private http: HttpClient
    ) {}

    /* to handle error  with more info */
    // TODO : Better Error messaging?
    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.console.error('AppShellService :: An API error occurred', error.error.message);
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                `body was: ${error.error}`
            );
            return throwError(error);
        }
        return throwError(
            'Something bad happened; please try again later.'
        );
    }

    getUserProfile() {
        const apiUrl = this.appConfig.getConfig().configdb + '/user';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        this.console.api('AppShellService :: Get User Profile', {
            apiUrl
        });

        // put will get or create based on existing of user
        return this.http.put(apiUrl, null, {
            headers: headers,
            withCredentials: true,
            observe: 'response'
        }).pipe(
            catchError(this.handleError)
        );
    }

    createUser() {
        const apiUrl = this.appConfig.getConfig().configdb + '/user';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        this.console.api('AppShellService :: Create User', {
            apiUrl
        });

        return this.http.post(apiUrl, {}, {
            // headers: headers,
            withCredentials: true,
            observe: 'response'
        }).pipe(
            catchError(this.handleError)
        );
    }
}
