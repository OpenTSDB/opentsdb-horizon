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
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';

// routing module
import { AdminRoutingModule } from './admin-routing.module';

// component modules
import { AdminComponent } from './containers/admin/admin.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminNamespacesComponent } from './components/admin-namespaces/admin-namespaces.component';
import { AdminConfigComponent } from './components/admin-config/admin-config.component';
import { AdminDefaultComponent } from './components/admin-default/admin-default.component';
import { AdminThemesComponent } from './components/admin-themes/admin-themes.component';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        SharedcomponentsModule,
        AdminRoutingModule
    ],
    declarations: [
        // container
        AdminComponent,

        // content components (and children)
        AdminUsersComponent,
        AdminNamespacesComponent,
        AdminConfigComponent,
        AdminDefaultComponent,
        AdminThemesComponent
    ]
})
export class AdminModule { }
