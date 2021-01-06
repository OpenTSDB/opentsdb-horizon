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
import { NavigatorPanelItemDirective } from './directives/navigator-panel-item.directive';
import { NavigatorPanelComponent, NavigatorPanelItemElement } from './components/navigator-panel/navigator-panel.component';
import { NavigatorSidenavComponent } from './components/navigator-sidenav/navigator-sidenav.component';
import { GlobalNotificationBannerComponent } from './components/global-notification-banner/global-notification-banner.component';

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
        SharedcomponentsModule,
    ],
    declarations: [
        NavigatorPanelItemDirective,
        NavigatorPanelComponent,
        NavigatorPanelItemElement
    ],

    exports: [
        NavigatorPanelItemDirective,
        NavigatorPanelComponent
    ]
})
export class AppShellSharedModule { }
