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

import { DbsVariablesComponent } from './dbs-variables.component';
import { DASHBOARD_TESTING_IMPORTS } from '../../../../dashboard-testing.utils';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DbsVariablesComponent', () => {
    let component: DbsVariablesComponent;
    let fixture: ComponentFixture<DbsVariablesComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DbsVariablesComponent],
            imports: [
                ...DASHBOARD_TESTING_IMPORTS
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DbsVariablesComponent);
        component = fixture.componentInstance;

        // inputs
        // NOTE: Probably need better test data with actual tpl var data
        // see: DbsVariablesComponent.addTemplateVariable for structure
        component.dbData = {
            variables: {
                enabled: true,
                tplVariables: []
            }
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
