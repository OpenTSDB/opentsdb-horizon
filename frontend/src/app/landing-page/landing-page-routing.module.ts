import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { LandingPageComponent } from './containers/landing-page/landing-page.component';

// components

const routes: Routes = [{
  path: '',
  component: LandingPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingPageRoutingModule { }
