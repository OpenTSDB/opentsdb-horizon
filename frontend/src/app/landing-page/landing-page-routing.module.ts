/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
