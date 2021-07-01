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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// store
import { NgxsModule } from '@ngxs/store';

import {
    AppShellState,
    NavigatorState
 } from './state';

// modules
import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';
import {
  MarkdownModule,
  MarkedOptions
} from 'ngx-markdown';
import { UniversalClipboardModule } from '../shared/modules/universal-clipboard/universal-clipboard.module';
import { DashboardFilesystemModule } from '../shared/modules/dashboard-filesystem/dashboard-filesystem.module';

// services
import { AppShellService } from './services/app-shell.service';
import { NotificationService } from './services/notification.service';

// components
import { AppShellComponent } from './containers/app-shell.component';
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component';
import { TestNavigatorComponent } from './components/test-navigator/test-navigator.component';
import { NavigatorSidenavComponent } from './components/navigator-sidenav/navigator-sidenav.component';
import { GlobalNotificationBannerComponent } from './components/global-notification-banner/global-notification-banner.component';

import { AppShellSharedModule } from './app-shell-shared.module';

import {
    SettingsPanelComponent,
    SettingsThemeComponent
} from './components/settings-panel';

import {
    AdminPanelComponent,
    NotificationPanelComponent,
    NotificationListComponent,
    NotificationEditorComponent
} from './components/admin-panel';

import { DashboardService } from '../dashboard/services/dashboard.service';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        SharedcomponentsModule,
        MarkdownModule.forRoot({
          markedOptions: {
            provide: MarkedOptions,
            useValue: {
              sanitize: true,
            }
          }
        }),
        NgxsModule.forFeature([
            AppShellState,
            NavigatorState
        ]),
        UniversalClipboardModule,
        DashboardFilesystemModule,
        AppShellSharedModule,
        RouterModule
    ],
    declarations: [
        AppShellComponent,
        AppNavbarComponent,
        TestNavigatorComponent,
        NavigatorSidenavComponent,
        SettingsThemeComponent,
        SettingsPanelComponent,
        GlobalNotificationBannerComponent,
        NotificationEditorComponent,
        AdminPanelComponent,
        NotificationListComponent,
        NotificationPanelComponent
    ],
    providers: [
        AppShellService,
        DashboardService,
        NotificationService,
        { provide: 'WINDOW', useFactory: getBrowserWindow } // this is used to open dashboards in new tab
    ],
    exports: [
        AppShellComponent
    ]
})
export class AppShellModule { }

// function for WINDOW provider factory to return browser window object
export function getBrowserWindow() {
    return (typeof window !== 'undefined') ? window : null;
}
