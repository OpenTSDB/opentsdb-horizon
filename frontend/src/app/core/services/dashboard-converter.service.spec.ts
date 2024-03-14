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

import { DashboardConverterService } from './dashboard-converter.service';
import { CORE_SERVICES_TESTING_IMPORTS } from '../core-testing.utils';

describe('DashboardConverterService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: CORE_SERVICES_TESTING_IMPORTS,
        providers: [DashboardConverterService]
    }));

    it('should be created', () => {
        const service: DashboardConverterService = TestBed.inject(
            DashboardConverterService,
        );
        expect(service).toBeTruthy();
    });
});
