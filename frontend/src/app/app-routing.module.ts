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
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
    {
        path: 'd',
        loadChildren: () =>
            import('app/dashboard/dashboard.module').then(
                (m) => m.DashboardModule,
            ),
    },
    {
        path: 'snap',
        loadChildren: () =>
            import('app/dashboard/dashboard.module').then(
                (m) => m.DashboardModule,
            ),
        canLoad: [AuthGuardService],
    },
    {
        path: 'main',
        loadChildren: () =>
            import('app/landing-page/landing-page.module').then(
                (m) => m.LandingPageModule,
            ),
        canLoad: [AuthGuardService],
    },
    {
        path: 'a',
        loadChildren: () =>
            import('app/alerts/alerts.module').then((m) => m.AlertsModule),
        canLoad: [AuthGuardService],
    },
    {
        path: 'user',
        loadChildren: () =>
            import('app/user/user.module').then((m) => m.UserModule),
        canLoad: [AuthGuardService],
    },
    {
        path: 'namespace',
        loadChildren: () =>
            import('app/namespace/namespace.module').then(
                (m) => m.NamespaceModule,
            ),
        canLoad: [AuthGuardService],
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('app/admin/admin.module').then((m) => m.AdminModule),
        canLoad: [AuthGuardService],
    },
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
        canLoad: [AuthGuardService],
    },
    {
        path: 'error',
        loadChildren: () =>
            import('app/error/error.module').then((m) => m.ErrorModule),
    },
    {
        path: '**',
        redirectTo: 'main',
        pathMatch: 'full',
        canLoad: [AuthGuardService],
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    ],
    exports: [RouterModule],
    providers: [AuthGuardService],
})
export class AppRoutingModule {}
