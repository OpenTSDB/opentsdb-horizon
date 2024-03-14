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

import { WidgetConfigMultigraphComponent } from './widget-config-multigraph.component';
import { SHAREDCOMPONENTS_TESTING_IMPORTS } from '../../sharedcomponents-testing.utils';
import { MULTIGRAPH_LINECHART_WIDGET_MOCK_DATA } from '../../../../mockdata/dynamic-widgets/linechart-widget';

describe('WidgetConfigMultigraphComponent', () => {
    let component: WidgetConfigMultigraphComponent;
    let fixture: ComponentFixture<WidgetConfigMultigraphComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetConfigMultigraphComponent],
            imports: [
                ...SHAREDCOMPONENTS_TESTING_IMPORTS
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WidgetConfigMultigraphComponent);
        component = fixture.componentInstance;

        // inputs
        component.widget = MULTIGRAPH_LINECHART_WIDGET_MOCK_DATA;
        component.isDataLoaded = true;
        component.setupMultigraph();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
