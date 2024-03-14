
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../../../shared/modules/sharedcomponents/sharedcomponents.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DygraphsModule } from '../dygraphs/dygraphs.module';
import { D3Module } from '../d3/d3.module';
import { ChartjsModule } from '../chartjs/chartjs.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UniversalDataTooltipDirectivesModule } from '../universal-data-tooltip/universal-data-tooltip-directives.module';
import { UniversalDataTooltipModule } from '../universal-data-tooltip/universal-data-tooltip.module';


export const DYNAMIC_WIDGETS_TESTING_IMPORTS = [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedcomponentsModule,
    FlexLayoutModule,
    DygraphsModule,
    D3Module,
    ChartjsModule,
    UniversalDataTooltipDirectivesModule,
    UniversalDataTooltipModule,
    MarkdownModule.forRoot({
        markedOptions: {
            provide: MarkedOptions,
            useValue: {},
        },
    })
];


