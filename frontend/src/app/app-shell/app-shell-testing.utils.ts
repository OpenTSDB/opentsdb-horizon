import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';

import {RouterTestingModule} from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppShellSharedModule } from './app-shell-shared.module';

import { AppShellService } from './services/app-shell.service';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { AppConfigService } from '../core/services/config.service';

export const APP_SHELL_TESTING_IMPORTS = [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedcomponentsModule,
    AppShellSharedModule
];

export const APP_SHELL_TESTING_PROVIDERS = [
    AppShellService,
    AppConfigService,
    DashboardService
];
