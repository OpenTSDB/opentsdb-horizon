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

import { UserComponent } from './user.component';
import { USER_TESTING_IMPORTS } from '../../user-testing.utils';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { Store } from '@ngxs/store';

import { AuthState } from '../../../shared/state/auth.state';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;

    let store: Store;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [UserComponent],
            imports: [
                ...USER_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.inject(Store);

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
