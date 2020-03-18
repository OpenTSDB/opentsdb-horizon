import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// store
import { NgxsModule } from '@ngxs/store';
import {
    AppShellState,
    NavigatorState,
    DbfsState,
    DbfsPanelsState,
    DbfsResourcesState
 } from './state';


// modules
import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';
import {
  MarkdownModule,
  MarkedOptions
} from 'ngx-markdown';

// services
import { AppShellService } from './services/app-shell.service';
import { DbfsUtilsService } from './services/dbfs-utils.service';
import { DbfsService } from './services/dbfs.service';
import { LocalStorageService } from './services/local-storage.service';
import { ThemeService } from './services/theme.service';

// components
import { AppShellComponent } from './containers/app-shell.component';
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component';
import { TestNavigatorComponent } from './components/test-navigator/test-navigator.component';
import { NavigatorPanelItemDirective } from './directives/navigator-panel-item.directive';
import { NavigatorPanelComponent, NavigatorPanelItemElement } from './components/navigator-panel/navigator-panel.component';
import { NavigatorSidenavComponent } from './components/navigator-sidenav/navigator-sidenav.component';
import { GlobalNotificationBannerComponent } from './components/global-notification-banner/global-notification-banner.component';

import {
    DbfsComponent,
    DbfsMiniNavComponent
} from './components/dbfs';

import {
    SettingsPanelComponent,
    SettingsThemeComponent
} from './components/settings-panel';
import {
    AdminPanelComponent,
    NotificationEditorComponent
} from './components/admin-panel';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
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
            NavigatorState,
            DbfsState,
            DbfsPanelsState,
            DbfsResourcesState,
        ]),
        RouterModule
    ],
    declarations: [
        AppShellComponent,
        AppNavbarComponent,
        TestNavigatorComponent,
        NavigatorPanelItemDirective,
        NavigatorPanelComponent,
        NavigatorPanelItemElement,
        NavigatorSidenavComponent,
        DbfsComponent,
        DbfsMiniNavComponent,
        SettingsPanelComponent,
        SettingsThemeComponent,
        GlobalNotificationBannerComponent,
        NotificationEditorComponent,
        AdminPanelComponent
    ],
    providers: [
        AppShellService,
        DbfsService,
        DbfsUtilsService,
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
