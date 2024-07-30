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

import { WidgetLoaderComponent } from './widget-loader.component';
import { DASHBOARD_TESTING_IMPORTS } from '../../dashboard-testing.utils';
import { MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { InfoIslandService } from '../../../shared/modules/info-island/services/info-island.service';


import {
    APP_TESTING_CONFIG
} from '../../../shared/mockdata/config/app-config';

import {
    DASHBOARD_TESTING_WIDGET
} from '../../../shared/mockdata/dashboard/widget'

import { AppConfigService } from '../../../core/services/config.service';


xdescribe('WidgetLoaderComponent', () => {
    let component: WidgetLoaderComponent;
    let fixture: ComponentFixture<WidgetLoaderComponent>;

    let mockAppConfigService;

    beforeEach(waitForAsync(() => {
        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [WidgetLoaderComponent],
            imports: DASHBOARD_TESTING_IMPORTS,
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                },
                InfoIslandService,
                MatLegacyDialogRef
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WidgetLoaderComponent);
        component = fixture.componentInstance;

        // inputs
        component.widget = DASHBOARD_TESTING_WIDGET;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
