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

import { KeypadComponent } from './keypad.component';
import { DATE_TIME_PICKER_TESTING_IMPORTS } from '../../date-time-picker-testing.utils';

describe('KeypadComponent', () => {
    let component: KeypadComponent;
    let fixture: ComponentFixture<KeypadComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [KeypadComponent],
            imports: [
                ...DATE_TIME_PICKER_TESTING_IMPORTS
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(KeypadComponent);
        component = fixture.componentInstance;

        // inputs
        component.preset = {
            name: 'month',
            buttonName: 'mo',
            abbr: 'mo',
        }

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
