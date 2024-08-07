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

import { UniversalDataTooltipModule } from '../../universal-data-tooltip.module';

import { BarchartDataTooltipComponent } from './barchart-data-tooltip.component';

describe('BarchartDataTooltipComponent', () => {
    let component: BarchartDataTooltipComponent;
    let fixture: ComponentFixture<BarchartDataTooltipComponent>;

    let mockRenderer = jasmine.createSpyObj({
        removeClass: () => {},
        listen: () => {}
    })
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BarchartDataTooltipComponent],
            imports: [
                UniversalDataTooltipModule.forRoot()
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BarchartDataTooltipComponent);
        component = fixture.componentInstance;
        component.renderer = mockRenderer;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
