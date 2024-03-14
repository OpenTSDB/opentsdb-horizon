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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MaterialModule } from '../../../material/material.module';
import { AppShellSharedModule } from '../../../../../app-shell/app-shell-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { AuthState } from './shared/state/auth.state';

import { AuthState } from '../../../../state/auth.state';

import { DbfsMiniNavComponent } from './dbfs-mini-nav.component';
import { DbfsService } from '../../services/dbfs.service';

describe('DbfsMiniNavComponent', () => {
    let component: DbfsMiniNavComponent;
    let fixture: ComponentFixture<DbfsMiniNavComponent>;

    let store: Store;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DbfsMiniNavComponent],
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                MaterialModule,
                AppShellSharedModule,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                DbfsService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.inject(Store);

        store.reset({
            ...store,
            DBFS: {
                NavPanels: {
                    'panelTab': 'personal',
                    'personalTab': {
                        'curPanel': 0,
                        'panels': [
                            {
                                'index': 0,
                                'folderResource': ':panel-root:',
                                'root': true,
                                'synthetic': true,
                                'locked': true
                            }
                        ]
                    },
                    'favoritesTab': {
                        'curPanel': 0,
                        'panels': [
                            {
                                'index': 0,
                                'folderResource': ':user-favorites:',
                                'root': true,
                                'dynamic': true,
                                'synthetic': true,
                                'locked': true
                            }
                        ]
                    },
                    'recentTab': {
                        'curPanel': 0,
                        'panels': [
                            {
                                'index': 0,
                                'folderResource': ':user-recent:',
                                'root': true,
                                'dynamic': true,
                                'synthetic': true,
                                'locked': true
                            }
                        ]
                    },
                    'usersTab': {
                        'curPanel': 0,
                        'panels': [
                            {
                                'index': 0,
                                'folderResource': ':list-users:',
                                'root': true,
                                'dynamic': true,
                                'synthetic': true,
                                'locked': true
                            }
                        ]
                    },
                    'namespacesTab': {
                        'curPanel': 0,
                        'panels': [
                            {
                                'index': 0,
                                'folderResource': ':list-namespaces:',
                                'root': true,
                                'dynamic': true,
                                'synthetic': true,
                                'locked': true
                            }
                        ]
                    },
                    'panelAction': {},
                    'initialized': true
                }
            }
        });

        fixture = TestBed.createComponent(DbfsMiniNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
