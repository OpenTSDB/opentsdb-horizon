import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';

// routing
import { AlertsRoutingModule } from './alerts-routing.module';

// services
import { AlertsService } from './services/alerts.service';

// store
import { NgxsModule } from '@ngxs/store';
import { AlertState, AlertsState, RecipientsState, SnoozeState } from './state';

// components
import { AlertsComponent } from './containers/alerts.component';
import { SnoozeDetailsComponent } from './components/snooze-details/snooze-details.component';
import { NameAlertDialogComponent } from './components/name-alert-dialog/name-alert-dialog.component';
import { AlertDetailsComponent } from './components/alert-details/alert-details.component';
import { ResizableDirective } from '../shared/modules/directives/resizable.directive';
import { DygraphsModule } from '../shared/modules/dygraphs/dygraphs.module';
// tslint:disable:max-line-length
import { AlertConfigurationContactsComponent } from './components/alert-details/children/recipients-manager/recipients-manager.component';
import { AlertDetailsMetricPeriodOverPeriodComponent } from './components/alert-details/children/alert-details-metric-period-over-period/alert-details-metric-period-over-period.component';
import { AlertDetailsMetricPeriodOverPeriodPreviewComponent } from './components/alert-details/children/alert-details-metric-period-over-period-preview/alert-details-metric-period-over-period-preview.component';
import { AlertDetailsTransitionsComponent } from './components/alert-details/children/alert-details-transitions/alert-details-transitions.component';
import { InfoIslandModule } from '../shared/modules/info-island/info-island.module';
import { AlertDetailsCountComponent } from './components/alert-details/children/alert-details-count/alert-details-count.component';

// directives
import { UniversalDataTooltipDirectivesModule } from '../shared/modules/universal-data-tooltip/universal-data-tooltip-directives.module';


@NgModule({
    imports: [
        InfoIslandModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedcomponentsModule,
        DygraphsModule,
        AlertsRoutingModule,
        UniversalDataTooltipDirectivesModule,
        NgxsModule.forFeature([
            AlertState,
            AlertsState,
            SnoozeState,
            RecipientsState
        ])
    ],
    declarations: [
        AlertsComponent,
        SnoozeDetailsComponent,
        NameAlertDialogComponent,
        AlertDetailsComponent,
        AlertConfigurationContactsComponent,
        AlertDetailsMetricPeriodOverPeriodComponent,
        AlertDetailsMetricPeriodOverPeriodPreviewComponent,
        AlertDetailsTransitionsComponent,
        AlertDetailsCountComponent
    ],
    providers: [
        AlertsService
    ],
    entryComponents: [
        NameAlertDialogComponent
    ]
})
export class AlertsModule { }
