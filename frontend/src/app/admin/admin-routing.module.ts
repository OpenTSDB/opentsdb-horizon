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

import { AdminComponent } from './containers/admin/admin.component';
import { AdminConfigComponent } from './components/admin-config/admin-config.component';
import { AdminDefaultComponent } from './components/admin-default/admin-default.component';
import { AdminNamespacesComponent } from './components/admin-namespaces/admin-namespaces.component';
import { AdminThemesComponent } from './components/admin-themes/admin-themes.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'config',
                component: AdminConfigComponent
            },
            {
                path: 'themes',
                component: AdminThemesComponent
            },
            {
                path: 'theme/:themeid',
                component: AdminThemesComponent
            },
            {
                path: 'themes/:themeid',
                redirectTo: 'theme/:themeid'
            },
            {
                path: 'theme',
                redirectTo: 'themes',
                pathMatch: 'full'
            },
            {
                path: 'users',
                component: AdminUsersComponent
            },
            {
                path: 'user/:userid',
                component: AdminUsersComponent
            },
            {
                path: 'users/:userid',
                redirectTo: 'user/:userid'
            },
            {
                path: 'user',
                redirectTo: 'users',
                pathMatch: 'full'
            },
            {
                path: 'namespaces',
                component: AdminNamespacesComponent
            },
            {
                path: 'namespace/:nsalias',
                component: AdminNamespacesComponent
            },
            {
                path: 'namespaces/:nsalias',
                redirectTo: 'namespace/:nsalias',
            },
            {
                path: 'namespace',
                redirectTo: 'namespaces',
                pathMatch: 'full'
            },
            {
                path: '',
                component: AdminDefaultComponent
            }
        ]
    }
];

// NOTE: not sure how yet, but we need to put a check here to see if user is actually an admin
// TODO: AUTHCHECK NEEDED

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
