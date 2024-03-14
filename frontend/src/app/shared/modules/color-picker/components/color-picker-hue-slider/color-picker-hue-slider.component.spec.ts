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

import { ColorPickerHueSliderComponent } from './color-picker-hue-slider.component';
import { ColorService } from '../../services/color.service';
import { EMPTY_COLOR } from '../../color-picker';
import { ColorPickerService } from '../../services/color-picker.service';

describe('ColorPickerHueSliderComponent', () => {
    let component: ColorPickerHueSliderComponent;
    let fixture: ComponentFixture<ColorPickerHueSliderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerHueSliderComponent],
            providers: [
                ColorPickerService,
                ColorService,
                { provide: EMPTY_COLOR, useValue: 'none' }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerHueSliderComponent);
        component = fixture.componentInstance;

        // inputs
        component.selectedColor = '#000000';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
