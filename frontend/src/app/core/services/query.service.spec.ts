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

import {
    APP_TESTING_CONFIG
} from '../../shared/mockdata/config/app-config';

import { QueryService } from './query.service';
import { CORE_SERVICES_TESTING_IMPORTS } from '../core-testing.utils';
import { OpenTSDBService } from './opentsdb.service';
import { AppConfigService } from './config.service';

describe('QueryService', () => {
    let mockAppConfigService;

    beforeEach(() => {
        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            imports: CORE_SERVICES_TESTING_IMPORTS,
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                },
                OpenTSDBService,
                QueryService
            ]
        });
    });

    it('should be created', () => {
        const service: QueryService = TestBed.inject(QueryService);
        expect(service).toBeTruthy();
    });
});
