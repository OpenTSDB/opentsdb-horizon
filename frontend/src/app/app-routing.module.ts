import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'd', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' },
  { path: 'snap', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' },
  { path: 'main', loadChildren: 'app/landing-page/landing-page.module#LandingPageModule' },
  { path: 'a', loadChildren: 'app/alerts/alerts.module#AlertsModule' },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: '**', redirectTo: 'main', pathMatch: 'full'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
