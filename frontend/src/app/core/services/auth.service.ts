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
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { SetAuth } from '../../shared/state/auth.state';
import { Observable , of} from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DbfsState } from '../../shared/modules/dashboard-filesystem/state/dbfs.state';
import { AppConfigService } from './config.service';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient, private store: Store, private appConfig: AppConfigService ) {}

    /*
        renews the cookie.
        image.src follows the browser redirects and renews the auth cookies
    */
    canCookieRenewed() {
        const self = this;
        const authConfig = this.appConfig.getConfig().auth;
        return new Observable((observer) => {
            const image = new Image();
            image.src = authConfig.heartbeatImgURL + '?t=' + new Date().getTime();
            image.onload = function() {
                observer.next('cookie-renewed');
                self.store.dispatch(new SetAuth('valid'));
            };
            image.onerror = function(e) {
                observer.next('cookie-invalid');
                observer.complete();
                self.store.dispatch(new SetAuth('invalid'));
            };
        });
    }

    /*
        checks the login cookie. It will try to renew the cookie when the cookie is expired.
        returns Observable<string> cookie-valid | cookie-invalid | cookie-renewed | cookie-check-error
    */
    getCookieStatus(heartbeat= false) {
        const user = this.store.selectSnapshot(DbfsState.getUser());
        const self = this;
        const authConfig = this.appConfig.getConfig().auth;
        self.store.dispatch(new SetAuth('unknown'));
        if ( authConfig.heartbeatURL ) {
            return this.http.get( authConfig.heartbeatURL, { withCredentials: true } )
                .pipe(
                    map(
                        (res) => {
                            if ( !heartbeat ) {
                                self.store.dispatch(new SetAuth('valid'));
                            }
                            return 'cookie-valid';
                        }
                    ),
                    catchError(
                        error => {
                            if ( !heartbeat && error.status === 403 && authConfig.heartbeatImgURL ) {
                                return this.canCookieRenewed();
                            } else if ( !heartbeat && error.status === 403 && !authConfig.heartbeatImgURL ) {
                                self.store.dispatch(new SetAuth('invalid'));
                                return of('cookie-invalid');
                            }
                            return of('cookie-check-error');
                        }
                    )
                );
        } else {
            return of('cookie-check-error');
        }
    }
}
