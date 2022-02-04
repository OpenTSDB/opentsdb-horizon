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

import { Component, OnInit, HostBinding, OnDestroy, ViewEncapsulation} from '@angular/core';
import { AuthState } from './shared/state/auth.state';
import { Observable, interval, Subscription } from 'rxjs';
import { MatDialog} from '@angular/material';
import { Router,  NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AppConfigService } from './core/services/config.service';
import { LoginExpireDialogComponent } from './core/components/login-expire-dialog/login-expire-dialog.component';
import { Select } from '@ngxs/store';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
    @HostBinding('class.app-root') hostClass = true;
    @Select(AuthState.getAuth) auth$: Observable<string>;

    /** Local variables */
    title = 'app';
    fullUrlPath: string;
    authCheckSub: Subscription;

    constructor(
        private dialog: MatDialog,
        private router: Router,
        private authService: AuthService,
        public configService: AppConfigService
    ) {
        // register this router events to capture url changes
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            // after resolve path, this is the url the app uses
            this.fullUrlPath = event.urlAfterRedirects;
          }
        });
    }

    ngOnInit() {
        this.auth$.subscribe(auth => {
            if (auth === 'invalid') {
                this.dialog.open(LoginExpireDialogComponent, {
                    disableClose: true
                });
            } else if (auth === 'valid') {
                this.dialog.closeAll();
            }
        });
        // store last heartbeat check to localStorage
        if (!localStorage.getItem('lastHeartBeat')) {
            localStorage.setItem('lastHeartBeat', new Date().getTime().toString());
        }
        // interval for 1 min
        const authCheck = interval(60 * 1000);
        const authConfig = this.configService.getConfig().auth;
        const heartbeatInverval = authConfig.heartbeatInterval !== undefined ? authConfig.heartbeatInterval * 1000 : 600000;
        if ( heartbeatInverval > 0 ) {
            this.authCheckSub = authCheck.subscribe(val => {
                const now = new Date().getTime();
                const lastHB = parseInt(localStorage.getItem('lastHeartBeat'), 10);
                // only active tab and > heartbeatInverval
                if (!document.hidden && (now - lastHB >= heartbeatInverval)) {
                    return this.authService.getCookieStatus(true)
                        .subscribe(
                            (res) => {
                                localStorage.setItem('lastHeartBeat', new Date().getTime().toString());
                            }
                        );
                }
            });
        }
    }

    ngOnDestroy() {
        this.authCheckSub.unsubscribe();
    }
}
