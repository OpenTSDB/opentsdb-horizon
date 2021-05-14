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
