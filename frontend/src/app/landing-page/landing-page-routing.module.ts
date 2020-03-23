import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { LandingPageComponent } from './containers/landing-page/landing-page.component';
import { UsersListContentComponent } from './components/users-list-content/users-list-content.component';
import { UserPageContentComponent } from './components/user-page-content/user-page-content.component';
import { NamespaceListContentComponent } from './components/namespace-list-content/namespace-list-content.component';
import { NamespacePageContentComponent } from './components/namespace-page-content/namespace-page-content.component';
import { LandingPageContentComponent } from './components/landing-page-content/landing-page-content.component';

// components

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        children: [
            {
                path: 'users',
                component: UsersListContentComponent
            },
            {
                path: 'user/:userid',
                component: UserPageContentComponent
            },
            {
                path: 'user',
                redirectTo: 'users',
                pathMatch: 'full'
            },
            {
                path: 'namespaces',
                component: NamespaceListContentComponent
            },
            {
                path: 'namespace/:nsalias',
                component: NamespacePageContentComponent
            },
            {
                path: 'namespace',
                redirectTo: 'namespaces',
                pathMatch: 'full'
            },
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
