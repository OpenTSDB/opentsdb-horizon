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
import { TestBed } from '@angular/core/testing';

import { NgxsModule, Store } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { AuthState } from '../../../state/auth.state';

import { ClipboardService } from './clipboard.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';

import { UNIVERSAL_CLIPBOARD_SERVICES_TESTING_IMPORTS } from '../universal-clipboard-testing.utils';

describe('ClipboardService', () => {

    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...UNIVERSAL_CLIPBOARD_SERVICES_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                ClipboardService,
                DashboardService
            ]
        });
        store = TestBed.inject(Store);
    });

    it('should be created', () => {
        const service: ClipboardService = TestBed.inject(ClipboardService);
        expect(service).toBeTruthy();
    });
});
