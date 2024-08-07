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

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { Store } from '@ngxs/store';

import { AuthState } from '../../../shared/state/auth.state';

import { DashboardSaveDialogComponent } from './dashboard-save-dialog.component';
import { DASHBOARD_TESTING_IMPORTS } from '../../dashboard-testing.utils';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog';

describe('DashboardSaveDialogComponent', () => {
    let component: DashboardSaveDialogComponent;
    let fixture: ComponentFixture<DashboardSaveDialogComponent>;

    let store: Store;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardSaveDialogComponent],
            imports: [
                ...DASHBOARD_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                { provide: MatLegacyDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.inject(Store);

        fixture = TestBed.createComponent(DashboardSaveDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
