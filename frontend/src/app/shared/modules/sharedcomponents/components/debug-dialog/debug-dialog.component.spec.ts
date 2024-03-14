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

import { DebugDialogComponent } from './debug-dialog.component';
import { SHAREDCOMPONENTS_TESTING_IMPORTS } from '../../sharedcomponents-testing.utils';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog';

describe('DebugDialogComponent', () => {
    let component: DebugDialogComponent;
    let fixture: ComponentFixture<DebugDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DebugDialogComponent],
            imports: [
                ...SHAREDCOMPONENTS_TESTING_IMPORTS
            ],
            providers: [
                { provide: MatLegacyDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {
                        log: [
                            'test debug message 1'
                        ]
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DebugDialogComponent);
        component = fixture.componentInstance;

        component.dialogRef.disableClose = false;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
