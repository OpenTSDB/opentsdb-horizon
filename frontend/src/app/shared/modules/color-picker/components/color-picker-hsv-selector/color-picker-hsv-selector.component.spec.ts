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

import { ColorPickerHsvSelectorComponent } from './color-picker-hsv-selector.component';
import { ColorService } from '../../services/color.service';
import { EMPTY_COLOR } from '../../color-picker';
import { ColorPickerService } from '../../services/color-picker.service';

describe('ColorPickerHsvSelectorComponent', () => {
    let component: ColorPickerHsvSelectorComponent;
    let fixture: ComponentFixture<ColorPickerHsvSelectorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerHsvSelectorComponent],
            providers: [
                ColorPickerService,
                ColorService,
                { provide: EMPTY_COLOR, useValue: 'none' }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerHsvSelectorComponent);
        component = fixture.componentInstance;

        // inputs
        component.selectedColor = '#000000';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
