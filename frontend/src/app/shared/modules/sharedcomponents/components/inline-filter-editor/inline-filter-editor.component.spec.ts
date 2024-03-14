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

import { InlineFilterEditorComponent } from './inline-filter-editor.component';
import { SHAREDCOMPONENTS_TESTING_IMPORTS } from '../../sharedcomponents-testing.utils';
import { LINECHART_WIDGET_MOCK_DATA } from '../../../../mockdata/dynamic-widgets/linechart-widget';
import {
    APP_TESTING_CONFIG
} from '../../../../mockdata/config/app-config';

import { AppConfigService } from '../../../../../core/services/config.service';
import { HttpService } from '../../../../../core/http/http.service';

describe('InlineFilterEditorComponent', () => {
    let component: InlineFilterEditorComponent;
    let fixture: ComponentFixture<InlineFilterEditorComponent>;

    let mockAppConfigService;

    const MOCK_DATA = LINECHART_WIDGET_MOCK_DATA;

    const MOCK_OPTIONS = {
        "deleteQuery": true,
        "toggleQuery": true,
        "cloneQuery": true,
        "enableAlias": true,
        "enableMetric": true,
        "toggleMetric": true,
        "enableGroupBy": true,
        "enableSummarizer": false,
        "enableMultiMetricSelection": true,
        "enableExplicitTagMatch": true,
        "showNamespaceBar": true,
        "enableNamespace": true
    }

    const MOCK_TPLVARIABLES = {
        "namespaces": [
            "namespace1",
            "namespace2"
        ],
        "tvars": [
            {
                "tagk": "colo",
                "alias": "colo",
                "filter": "",
                "mode": "auto",
                "display": "",
                "applied": 7,
                "isNew": 0
            }
        ]
    };

    beforeEach(waitForAsync(() => {

        // mocked app config
        const configValues = APP_TESTING_CONFIG;

        mockAppConfigService = jasmine.createSpyObj(['getConfig']);
        mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [InlineFilterEditorComponent],
            imports: [
                ...SHAREDCOMPONENTS_TESTING_IMPORTS
            ],
            providers: [
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService
                },
                HttpService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InlineFilterEditorComponent);
        component = fixture.componentInstance;

        component.query = MOCK_DATA.queries[0];
        component.options = MOCK_OPTIONS;
        component.tplVariables = MOCK_TPLVARIABLES;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
