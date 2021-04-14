import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {UserRoutingModule } from './user-routing.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';
import { DashboardFilesystemModule } from '../shared/modules/dashboard-filesystem/dashboard-filesystem.module';


// container
import { UserComponent } from './containers/user/user.component';
import { MaterialModule } from '../shared/modules/material/material.module';

@NgModule({
  declarations: [
    UserComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedcomponentsModule,
    DashboardFilesystemModule,
    UserRoutingModule
  ]
})
export class UserModule { }
