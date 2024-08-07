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

import { DbsVariableItemComponent } from './dbs-variable-item.component';
import { DASHBOARD_TESTING_IMPORTS } from '../../../../dashboard-testing.utils';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DbsVariableItemComponent', () => {
    let component: DbsVariableItemComponent;
    let fixture: ComponentFixture<DbsVariableItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DbsVariableItemComponent],
            imports: DASHBOARD_TESTING_IMPORTS,
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DbsVariableItemComponent);
        component = fixture.componentInstance;

        // TODO: move this to mockdata
        const dbVarItem = {
            tagk: new UntypedFormControl(''),
            alias: new UntypedFormControl(''),
            allowedValues: new UntypedFormArray([]),
            filter: new UntypedFormArray([]),
            enabled: new UntypedFormControl(true),
            type: new UntypedFormControl('literalor')
        };

        const fg = new UntypedFormGroup(dbVarItem);

        component.formGroup = fg;
        component.formGroupName = 0;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
