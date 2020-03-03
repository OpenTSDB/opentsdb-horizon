import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// container
import { AlertsComponent } from './containers/alerts.component';

// routes
const routes: Routes = [
    //{ path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: '**', component: AlertsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertsRoutingModule { }
