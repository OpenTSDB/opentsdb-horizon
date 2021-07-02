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
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxsModule } from '@ngxs/store';

import { MaterialModule } from '../material/material.module';
import { SharedcomponentsModule } from '../sharedcomponents/sharedcomponents.module';
import { AppShellSharedModule } from '../../../app-shell/app-shell-shared.module';

import {
    DbfsComponent,
    DbfsMiniNavComponent
} from './components';

import {
    DbfsState,
    DbfsPanelsState,
    DbfsResourcesState
 } from './state';

@NgModule({

  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedcomponentsModule,
    AppShellSharedModule,
    NgxsModule.forFeature([
        DbfsState,
        DbfsPanelsState,
        DbfsResourcesState
    ]),
    RouterModule
  ],
  declarations: [
    DbfsComponent,
    DbfsMiniNavComponent
  ],
  exports: [
    DbfsComponent,
    DbfsMiniNavComponent
  ]
})
export class DashboardFilesystemModule { }
