import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardModule } from '../../../dashboard/dashboard.module';
import { RightDrawerComponent } from './container/right-drawer/right-drawer.component';


@NgModule({
  declarations: [    RightDrawerComponent
  ],
  imports: [
    CommonModule,
    DashboardModule
  ],
  exports: [     RightDrawerComponent
  ]
})
export class RightDrawerModule { }
