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
import { LandingPageRoutingModule } from './landing-page-routing.module';

// containers
import { LandingPageComponent } from './containers/landing-page/landing-page.component';
import { LandingPageContentComponent } from './components/landing-page-content/landing-page-content.component';

// components
import { SearchResultsContentComponent } from './components/search-results-content/search-results-content.component';


import { ActivityPanelComponent } from './components/activity-panel/activity-panel.component';
import { PinPanelComponent } from './components/pin-panel/pin-panel.component';

// components


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedcomponentsModule,
    LandingPageRoutingModule
  ],
  declarations: [
    // container
    LandingPageComponent,

    // content components (and children)
    SearchResultsContentComponent,
    LandingPageContentComponent,
    ActivityPanelComponent,
    PinPanelComponent
  ]
})
export class LandingPageModule { }
