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

import { TableWidgetComponent } from './table-widget.component';
import { AppConfigService } from '../../../../../core/services/config.service';

import {
    WidgetModel,
} from '../../../../../dashboard/state/widgets.state';

import {
    TABLE_WIDGET_MOCK_DATA
} from '../../../../mockdata/dynamic-widgets/table-widget';

import { DYNAMIC_WIDGETS_TESTING_IMPORTS } from '../../dynamic-widgets-testing.utils';
import { TooltipComponentService } from '../../../universal-data-tooltip/services/tooltip-component.service';

describe('TableWidgetComponent', () => {
    let component: TableWidgetComponent;
    let fixture: ComponentFixture<TableWidgetComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TableWidgetComponent],
            imports: [
                ...DYNAMIC_WIDGETS_TESTING_IMPORTS
            ],
            providers: [
                AppConfigService,
                TooltipComponentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TableWidgetComponent);
        component = fixture.componentInstance;

        // inputs
        const widget: WidgetModel = TABLE_WIDGET_MOCK_DATA;

        component.widget = widget;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
