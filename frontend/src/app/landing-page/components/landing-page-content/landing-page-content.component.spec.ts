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
    LANDING_PAGE_TESTING_IMPORTS
} from '../../landing-page-testing.utils';

import {
    APP_TESTING_CONFIG
} from '../../../shared/mockdata/config/app-config';

import {
    DBFS_STATE_TESTING
} from '../../../shared/mockdata/dbfs/dbfs-state';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { Store } from '@ngxs/store';

import { AuthState } from '../../../shared/state/auth.state';

import { LandingPageContentComponent } from './landing-page-content.component';

import { AppConfigService } from '../../../core/services/config.service';
import { DbfsState, DbfsPanelsState, DbfsResourcesState } from '../../../shared/modules/dashboard-filesystem/state';


describe('LandingPageContentComponent', () => {
    let component: LandingPageContentComponent;
    let fixture: ComponentFixture<LandingPageContentComponent>;

    let mockAppConfigService;

    let store: Store;

    beforeEach(waitForAsync(() => {
        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [LandingPageContentComponent],
            imports: [
                ...LANDING_PAGE_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot(),
                NgxsModule.forFeature([DbfsState, DbfsPanelsState, DbfsResourcesState]),
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
        store = TestBed.inject(Store);

        store.reset({
            ...store.snapshot(),
            DBFS: DBFS_STATE_TESTING
        });

        fixture = TestBed.createComponent(LandingPageContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
