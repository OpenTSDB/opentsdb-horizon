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
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../services/config.service';
import { Subject, Observable, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';


/*
    Checks the authentication failure and renews the authentication cookies if needed
*/
export class AuthInterceptor implements HttpInterceptor {

    loginCheckInProgress = false;
    loginCheckSource = new Subject();
    loginChecked$ = this.loginCheckSource.asObservable();

    constructor(private authService: AuthService, private appConfig: AppConfigService) {}

    /*
        handles more than one call to the login check.
        restricts only one call to the login api.  but  same response will be returned with the calls.
    */
    checkLoginExpiration() {
        if (this.loginCheckInProgress) {

            return new Observable(observer => {
                this.loginChecked$.subscribe((res) => {
                        observer.next(res);
                        observer.complete();
                });
            });
        } else {
            this.loginCheckInProgress = true;

            return this.authService.getCookieStatus()
                .pipe(
                    tap(
                        (res) => {
                            this.loginCheckInProgress = false;
                            this.loginCheckSource.next(res);
                        }
                    )
                );
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(request).pipe(
            catchError(error => {
                // we don't want to do  authentication check on the url:/heartbeat
                // url:/heartbeat is one that tells the failure is due to authentication
                const url = error.url ? error.url : error.error.currentTarget.__zone_symbol__xhrURL;
                const authConfig = this.appConfig.getConfig().auth;
                if ( url.indexOf('/config') === -1 && url.indexOf(authConfig.heartbeatURL) === -1 && [401, 403].includes(error.status)) {
                    return this.checkLoginExpiration()
                        .pipe(
                            switchMap(
                                (res) => {
                                    // re-try the request in case the cookie is renewed
                                    if ( res === 'cookie-renewed' || res === 'cookie-valid' ) {
                                        return next.handle(request);
                                    } else if (res === 'cookie-invalid') {
                                        // throw the authentication error
                                        return throwError('authentication error');
                                    } else {
                                        // we don't know the root cause.. so return the original error
                                        return throwError(error);
                                    }
                                }
                            )
                        );
                }
                return throwError(error);
            })
        );
    }
}
