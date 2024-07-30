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

import {
    APP_SHELL_TESTING_IMPORTS
} from '../app-shell-testing.utils';

import {
    APP_TESTING_CONFIG
} from '../../shared/mockdata/config/app-config';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';

import { Store } from '@ngxs/store';
import { AuthState } from '../../shared/state/auth.state';

import { AppShellComponent } from './app-shell.component';

import { AppConfigService } from '../../core/services/config.service';
import { AppNavbarComponent } from '../components/app-navbar/app-navbar.component';
import { NavigatorSidenavComponent } from '../components/navigator-sidenav/navigator-sidenav.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

xdescribe('AppShellComponent', () => {
    let component: AppShellComponent;
    let fixture: ComponentFixture<AppShellComponent>;

    let mockAppConfigService;

    let store: Store;

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [
                AppShellComponent,
                AppNavbarComponent,
                NavigatorSidenavComponent
            ],
            imports: [
                ...APP_SHELL_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {

        store = TestBed.inject(Store);

        fixture = TestBed.createComponent(AppShellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
