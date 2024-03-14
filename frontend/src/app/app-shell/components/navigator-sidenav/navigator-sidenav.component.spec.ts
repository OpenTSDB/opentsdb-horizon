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
    APP_TESTING_CONFIG
} from '../../../shared/mockdata/config/app-config';


import {
    APP_SHELL_TESTING_IMPORTS
} from '../../app-shell-testing.utils';

import { NavigatorSidenavComponent } from './navigator-sidenav.component';

import { AppConfigService } from '../../../core/services/config.service';

describe('NavigatorSidenavComponent', () => {
    let component: NavigatorSidenavComponent;
    let fixture: ComponentFixture<NavigatorSidenavComponent>;

    let mockAppConfigService;

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [NavigatorSidenavComponent],
            imports: [
                ...APP_SHELL_TESTING_IMPORTS
            ],
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigatorSidenavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
