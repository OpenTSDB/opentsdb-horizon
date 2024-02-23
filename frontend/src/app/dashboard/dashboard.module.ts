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

// modules
import { MaterialModule } from '../shared/modules/material/material.module';
import { GridsterModule } from 'angular2gridster';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';
import { DynamicWidgetsModule } from '../shared/modules/dynamic-widgets/dynamic-widgets.module';

import { InfoIslandModule } from '../shared/modules/info-island/info-island.module';
import { UniversalClipboardModule } from '../shared/modules/universal-clipboard/universal-clipboard.module';

// services
import { DashboardService } from './services/dashboard.service';
import { DashboardConverterService } from '../core/services/dashboard-converter.service';

// store
import { NgxsModule } from '@ngxs/store';
import {
    DBState,
    DBSettingsState,
    WidgetsState,
    ClientSizeState,
    WidgetsRawdataState,
    UserSettingsState,
} from './state';

import { EventsState } from './state/events.state';

// components
import { DashboardComponent } from './containers/dashboard/dashboard.component';
import { DboardContentComponent } from './components/dboard-content/dboard-content.component';
import { WidgetLoaderComponent } from './components/widget-loader/widget-loader.component';

// directives
import { WidgetDirective } from './directives/widget.directive';
import { WidgetViewDirective } from './directives/widgetview.directive';
import {
    DashboardSettingsDialogComponent,
    DbsJsonComponent,
    DbsMetaComponent,
    DbsVariablesComponent,
    DbsVariableItemComponent,
} from './components/dashboard-settings-dialog';
import { DashboardSettingsToggleComponent } from './components/dashboard-settings-toggle/dashboard-settings-toggle.component';
import { NavbarDashboardActionsMenuComponent } from './components/navbar-dashboard-actions-menu/navbar-dashboard-actions-menu.component';
import { DashboardSaveDialogComponent } from './components/dashboard-save-dialog/dashboard-save-dialog.component';
import { DashboardDeleteDialogComponent } from './components/dashboard-delete-dialog/dashboard-delete-dialog.component';
import { WidgetDeleteDialogComponent } from './components/widget-delete-dialog/widget-delete-dialog.component';
import { TemplateVariablePanelComponent } from './components/template-variable-panel/template-variable-panel.component';
import { DashboardToAlertDialogComponent } from './components/dashboard-to-alert-dialog/dashboard-to-alert-dialog.component';

import { UniversalDataTooltipDirectivesModule } from '../shared/modules/universal-data-tooltip/universal-data-tooltip-directives.module';

import { DashboardFilesystemModule } from '../shared/modules/dashboard-filesystem/dashboard-filesystem.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        GridsterModule.forRoot(),
        SharedcomponentsModule,
        InfoIslandModule,
        DashboardRoutingModule,
        NgxsModule.forFeature([
            DBState,
            DBSettingsState,
            WidgetsState,
            ClientSizeState,
            WidgetsRawdataState,
            UserSettingsState,
            EventsState,
        ]),
        DynamicWidgetsModule,
        UniversalDataTooltipDirectivesModule,
        UniversalClipboardModule,
        DashboardFilesystemModule,
    ],
    declarations: [
        DashboardComponent,
        DboardContentComponent,
        WidgetLoaderComponent,
        WidgetDirective,
        WidgetViewDirective,
        DashboardSettingsDialogComponent,
        DashboardSettingsToggleComponent,
        DbsMetaComponent,
        DbsVariablesComponent,
        DbsJsonComponent,
        NavbarDashboardActionsMenuComponent,
        DashboardSaveDialogComponent,
        DashboardDeleteDialogComponent,
        DbsVariableItemComponent,
        WidgetDeleteDialogComponent,
        TemplateVariablePanelComponent,
        DashboardToAlertDialogComponent,
    ],
    providers: [DashboardService, DashboardConverterService],
    entryComponents: [
        DashboardSettingsDialogComponent,
        DashboardSaveDialogComponent,
        DashboardDeleteDialogComponent,
        DashboardToAlertDialogComponent,
        WidgetDeleteDialogComponent,
    ],
})
export class DashboardModule {}
