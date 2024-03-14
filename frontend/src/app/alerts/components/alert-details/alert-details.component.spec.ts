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
} from '../../alerts-testing.utils';

import {
    APP_TESTING_CONFIG
} from '../../../shared/mockdata/config/app-config';

import {
    ALERT_DETAILS_TESTING_DATA
} from '../../../shared/mockdata/alerts/alert-details';

import { AlertDetailsComponent } from './alert-details.component';
import { QueryService } from '../../../core/services/query.service';
import { InfoIslandService } from '../../../shared/modules/info-island/services/info-island.service';
import { AppConfigService } from '../../../core/services/config.service';

describe('AlertConfigurationDialogComponent', () => {
    let component: AlertDetailsComponent;
    let fixture: ComponentFixture<AlertDetailsComponent>;

    let mockAppConfigService;

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig','getDefaultNamespace']);
        mockAppConfigService.getConfig.and.returnValue(configValues);
        mockAppConfigService.getDefaultNamespace.and.returnValue(configValues.namespace.default);

        TestBed.configureTestingModule({
            declarations: [AlertDetailsComponent],
            imports: ALERTS_TESTING_IMPORTS,
            providers: [
                InfoIslandService,
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                }
            ],
            // providers: [QueryService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertDetailsComponent);
        component = fixture.componentInstance;

        // inputs
        component.data = ALERT_DETAILS_TESTING_DATA;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
