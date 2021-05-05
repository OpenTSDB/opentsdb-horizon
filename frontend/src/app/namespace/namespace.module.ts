import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NamespaceRoutingModule } from './namespace-routing.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';
import { DashboardFilesystemModule } from '../shared/modules/dashboard-filesystem/dashboard-filesystem.module';

import { NamespaceComponent } from './containers/namespace/namespace.component';
import { MaterialModule } from '../shared/modules/material/material.module';

@NgModule({
  declarations: [
    NamespaceComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedcomponentsModule,
    DashboardFilesystemModule,
    NamespaceRoutingModule,
  ]
})
export class NamespaceModule { }
