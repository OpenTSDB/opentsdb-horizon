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
