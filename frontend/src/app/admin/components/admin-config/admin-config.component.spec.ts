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

import { NO_ERRORS_SCHEMA } from '@angular/core';

import {
    ADMIN_TESTING_IMPORTS
} from '../../admin-testing.utils';

import {
    APP_TESTING_CONFIG
} from '../../../shared/mockdata/config/app-config';

import { AdminConfigComponent } from './admin-config.component';
import { AppConfigService } from '../../../core/services/config.service';

describe('AdminConfigComponent', () => {
    let component: AdminConfigComponent;
    let fixture: ComponentFixture<AdminConfigComponent>;

    let mockAppConfigService;

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [AdminConfigComponent],
            imports: ADMIN_TESTING_IMPORTS,
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
        fixture = TestBed.createComponent(AdminConfigComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
