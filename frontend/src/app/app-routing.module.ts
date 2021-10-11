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

const routes: Routes =  [
  { path: 'd', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' },
  { path: 'snap', loadChildren: 'app/dashboard/dashboard.module#DashboardModule', canLoad: [ AuthGuardService ] },
  { path: 'main', loadChildren: 'app/landing-page/landing-page.module#LandingPageModule', canLoad: [ AuthGuardService ]  },
  { path: 'a', loadChildren: 'app/alerts/alerts.module#AlertsModule', canLoad: [ AuthGuardService ]  },
  { path: 'user', loadChildren: 'app/user/user.module#UserModule', canLoad: [ AuthGuardService ]  },
  { path: 'namespace', loadChildren: 'app/namespace/namespace.module#NamespaceModule', canLoad: [ AuthGuardService ]  },
  { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule', canLoad: [ AuthGuardService ] },
  { path: '', redirectTo: 'main', pathMatch: 'full', canLoad: [ AuthGuardService ]  },
  { path: 'error', loadChildren:'app/error/error.module#ErrorModule'},
  { path: '**', redirectTo: 'main', pathMatch: 'full', canLoad: [ AuthGuardService ] }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [ AuthGuardService ]
})
export class AppRoutingModule { }
