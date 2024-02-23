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
import { TemplatePortal } from '@angular/cdk/portal';
import {
    Component,
    HostBinding,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CdkService } from '../../../core/services/cdk.service';
import { IntercomService } from '../../../core/services/intercom.service';
import {
    DbfsLoadTopFolder,
    DbfsLoadUsersList,
    DbfsResourcesState,
    DbfsState,
} from '../../../shared/modules/dashboard-filesystem/state';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class UserComponent implements OnInit, OnDestroy {
    @HostBinding('class.app-user') private hostClass = true;

    @Select(DbfsResourcesState.getResourcesLoaded)
    dbfsReady$: Observable<boolean>;
    @Select(DbfsResourcesState.getDynamicLoaded)
    dynamicLoaded$: Observable<any>;

    userListMode = false;
    dbfsReady = false;
    usersLoaded = false;

    userAlias = '';
    userDbfs: any = {};
    userData: any = {};
    userDbfsLoaded = false;

    private subscription: Subscription = new Subscription();

    // portal templates
    @ViewChild('userListNavbarTmpl', { static: true })
    userListNavbarTmpl: TemplateRef<any>;
    @ViewChild('userDetailNavbarTmpl', { static: true })
    userDetailNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    userNavbarPortal: TemplatePortal;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdkService: CdkService,
        private interCom: IntercomService,
        private store: Store,
    ) {
        const userList = false;

        this.subscription.add(
            this.dbfsReady$.subscribe((value) => {
                this.dbfsReady = value;
            }),
        );

        this.subscription.add(
            this.router.events
                .pipe(
                    filter((event) => event instanceof NavigationEnd),
                    map(() => {
                        if (this.activatedRoute.snapshot.data['userList']) {
                            return this.activatedRoute.snapshot.data[
                                'userList'
                            ];
                        }
                        return userList;
                    }),
                )
                .subscribe((nsList: boolean) => {
                    this.userListMode = nsList;

                    if (this.userListMode) {
                        this.userNavbarPortal = new TemplatePortal(
                            this.userListNavbarTmpl,
                            undefined,
                            {},
                        );
                        // intercom here to go to user list page
                        this.interCom.requestSend({
                            action: 'changeToSpecificUserView',
                            payload: 'userList',
                        });
                    } else {
                        this.userNavbarPortal = new TemplatePortal(
                            this.userDetailNavbarTmpl,
                            undefined,
                            {},
                        );
                    }
                    this.cdkService.setNavbarPortal(this.userNavbarPortal);
                }),
        );
    }

    ngOnInit(): void {
        this.subscription.add(
            this.dynamicLoaded$.subscribe((data) => {
                if (!data.users) {
                    this.loadUserList();
                } else {
                    this.usersLoaded = data.users;
                }
            }),
        );

        this.subscription.add(
            this.activatedRoute.params.subscribe((params) => {
                // this.console.log('ROUTE PARAMS', params);
                if (params && params['useralias']) {
                    this.userAlias = params['useralias'];
                    if (!this.usersLoaded) {
                        this.loadUserList().subscribe(() => {
                            setTimeout(() => {
                                this.loadUserData();
                                // intercom here to open navigator to specific page
                                this.interCom.requestSend({
                                    action: 'changeToSpecificUserView',
                                    payload: this.userAlias,
                                });
                            }, 100);
                        });
                    } else {
                        this.loadUserData();
                        // intercom here to open navigator to specific page
                        this.interCom.requestSend({
                            action: 'changeToSpecificUserView',
                            payload: this.userAlias,
                        });
                    }
                }
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private loadUserList(): Observable<any> {
        return this.store.dispatch(new DbfsLoadUsersList({}));
    }

    private loadUserData(): void {
        this.store
            .dispatch(new DbfsLoadTopFolder('user', this.userAlias, {}))
            .subscribe(() => {
                setTimeout(() => {
                    this.userData = this.store.selectSnapshot(
                        DbfsState.getUser(this.userAlias),
                    );
                    this.userDbfs[':userroot:'] = this.store.selectSnapshot(
                        DbfsResourcesState.getFolderResource(
                            '/user/' + this.userAlias,
                        ),
                    );
                    this.userDbfsLoaded = true;
                }, 200);
            });
    }
}
