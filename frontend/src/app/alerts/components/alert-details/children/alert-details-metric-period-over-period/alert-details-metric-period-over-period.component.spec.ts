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

import { AlertDetailsMetricPeriodOverPeriodComponent } from './alert-details-metric-period-over-period.component';

describe('AlertDetailsMetricPeriodOverPeriodComponent', () => {
    let component: AlertDetailsMetricPeriodOverPeriodComponent;
    let fixture: ComponentFixture<AlertDetailsMetricPeriodOverPeriodComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlertDetailsMetricPeriodOverPeriodComponent],
            imports: ALERTS_TESTING_IMPORTS
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(
            AlertDetailsMetricPeriodOverPeriodComponent,
        );
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
