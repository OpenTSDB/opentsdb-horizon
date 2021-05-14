import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { LandingPageComponent } from './containers/landing-page/landing-page.component';
import { LandingPageContentComponent } from './components/landing-page-content/landing-page-content.component';

// components

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        children: [
            {
                path: '',
                component: LandingPageContentComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LandingPageRoutingModule { }
