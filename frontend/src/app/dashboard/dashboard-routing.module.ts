import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { DashboardComponent } from './containers/dashboard/dashboard.component';
import { DashboardCanDeactivateGuardService } from './containers/dashboard/dashboard-can-deactivate-guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  // this setup to let the url path thru to DashboardComponent
  // since we dont want to manually define every possible path with folder tree
  { path: '**', component: DashboardComponent, canDeactivate: [DashboardCanDeactivateGuardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DashboardCanDeactivateGuardService]
})
export class DashboardRoutingModule { }
