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
import { DBState, DBSettingsState, WidgetsState, ClientSizeState,
         WidgetsConfigState, WidgetsRawdataState, UserSettingsState,  } from './state';

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
    DbsVariableItemComponent
} from './components/dashboard-settings-dialog';
import { DashboardSettingsToggleComponent } from './components/dashboard-settings-toggle/dashboard-settings-toggle.component';
import { NavbarDashboardActionsMenuComponent } from './components/navbar-dashboard-actions-menu/navbar-dashboard-actions-menu.component';
import { DashboardSaveDialogComponent } from './components/dashboard-save-dialog/dashboard-save-dialog.component';
import { DashboardDeleteDialogComponent } from './components/dashboard-delete-dialog/dashboard-delete-dialog.component';
import { WidgetDeleteDialogComponent } from './components/widget-delete-dialog/widget-delete-dialog.component';
import { TemplateVariablePanelComponent } from './components/template-variable-panel/template-variable-panel.component';
import { DashboardToAlertDialogComponent } from './components/dashboard-to-alert-dialog/dashboard-to-alert-dialog.component';

import { UniversalDataTooltipDirectivesModule } from '../shared/modules/universal-data-tooltip/universal-data-tooltip-directives.module';
import { AppShellModule } from '../app-shell/app-shell.module';

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
            EventsState
        ]),
        DynamicWidgetsModule,
        UniversalDataTooltipDirectivesModule,
        UniversalClipboardModule,
        AppShellModule
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
        DashboardToAlertDialogComponent
    ],
    providers: [
        DashboardService,
        DashboardConverterService
    ],
    entryComponents: [
        DashboardSettingsDialogComponent,
        DashboardSaveDialogComponent,
        DashboardDeleteDialogComponent,
        DashboardToAlertDialogComponent,
        WidgetDeleteDialogComponent
    ]
})
export class DashboardModule { }
