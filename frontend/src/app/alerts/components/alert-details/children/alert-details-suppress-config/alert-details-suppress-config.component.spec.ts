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
} from '../../../../alerts-testing.utils';

import { AlertDetailsSuppressConfigComponent } from './alert-details-suppress-config.component';
import { InfoIslandService } from '../../../../../shared/modules/info-island/services/info-island.service';

describe('AlertDetailsSuppressConfigComponent', () => {
    let component: AlertDetailsSuppressConfigComponent;
    let fixture: ComponentFixture<AlertDetailsSuppressConfigComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlertDetailsSuppressConfigComponent],
            imports: ALERTS_TESTING_IMPORTS,
            providers: [InfoIslandService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertDetailsSuppressConfigComponent);
        component = fixture.componentInstance;

        // inputs

        component.config = {
            metricId: 'metricId',
            comparisonOperator: 'missing',
            threshold: 0,
            timeSampler: 'all_of_the_times',
            reportingInterval: 60
        };

        component.data = {
            threshold: {
                singleMetric: {
                    slidingWindow: '300'
                }
            }
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
