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

import { NgxsModule, Store } from '@ngxs/store';
import { NgxsLoggerPluginModule, NgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { AuthState } from '../../../../state/auth.state';

import { NavbarClipboardMenuComponent } from './navbar-clipboard-menu.component';
import { UNIVERSAL_CLIPBOARD_TESTING_IMPORTS } from '../../universal-clipboard-testing.utils';
import { ClipboardService } from '../../services/clipboard.service';
import { DashboardService } from '../../../../../dashboard/services/dashboard.service';

describe('NavbarClipboardMenuComponent', () => {
    let component: NavbarClipboardMenuComponent;
    let fixture: ComponentFixture<NavbarClipboardMenuComponent>;

    let store: Store;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavbarClipboardMenuComponent],
            imports: [
                ...UNIVERSAL_CLIPBOARD_TESTING_IMPORTS,
                NgxsModule.forRoot([AuthState], { developmentMode: false }),
                NgxsLoggerPluginModule.forRoot()
            ],
            providers: [
                ClipboardService,
                DashboardService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.inject(Store);
        fixture = TestBed.createComponent(NavbarClipboardMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
