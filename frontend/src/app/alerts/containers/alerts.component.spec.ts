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
    ALERTS_TESTING_IMPORTS
} from '../alerts-testing.utils';

import {
    APP_TESTING_CONFIG
} from '../../shared/mockdata/config/app-config';


import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';

import { AlertsComponent } from './alerts.component';
import { Store } from '@ngxs/store';

import { AuthState } from '../../shared/state/auth.state';

import { InfoIslandService } from '../../shared/modules/info-island/services/info-island.service';
import { AppConfigService } from '../../core/services/config.service';

xdescribe('AlertsComponent', () => {
    let component: AlertsComponent;
    let fixture: ComponentFixture<AlertsComponent>;

    let mockAppConfigService;

    let store: Store;

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [AlertsComponent],
            imports: [
                ...ALERTS_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                },
                InfoIslandService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        store = TestBed.inject(Store);

        fixture = TestBed.createComponent(AlertsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
