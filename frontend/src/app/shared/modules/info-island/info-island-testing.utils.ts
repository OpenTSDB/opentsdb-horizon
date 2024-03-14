
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../../../shared/modules/sharedcomponents/sharedcomponents.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ISLAND_DATA } from './info-island.tokens';
import { InfoIslandService } from './services/info-island.service';
import { D3Module } from '../d3/d3.module';
import { TooltipDataService } from '../universal-data-tooltip/services/tooltip-data.service';

export const INFO_ISLAND_TESTING_IMPORTS = [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedcomponentsModule,
    FlexLayoutModule,
    D3Module
];

export const INFO_ISLAND_TESTING_PROVIDERS = [
    InfoIslandService,
    TooltipDataService
]


