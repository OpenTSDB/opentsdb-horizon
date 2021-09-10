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
/** Angular items */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Other modules */
import { MaterialModule } from '../material/material.module';
import { DygraphsModule } from '../dygraphs/dygraphs.module';
import { D3Module } from '../d3/d3.module';
import { ChartjsModule } from '../chartjs/chartjs.module';

import { SharedcomponentsModule } from '../sharedcomponents/sharedcomponents.module';
import { RouterModule} from '@angular/router';
import { PlaceholderWidgetComponent } from './components/placeholder-widget/placeholder-widget.component';
import { LinechartWidgetComponent } from './components/linechart-widget/linechart-widget.component';
import { DeveloperWidgetComponent } from './components/developer-widget/developer-widget.component';
import {
    MarkdownModule,
    MarkedOptions
} from 'ngx-markdown';

import {
    BignumberWidgetComponent,
    BignumberVisualAppearanceComponent,
} from './components/bignumber-widget';

import {
    DonutWidgetComponent,
    DonutchartLegendComponent
} from './components/donut-widget';

import {
    BarchartWidgetComponent
} from './components/barchart-widget';

import { StatusWidgetComponent } from './components/status-widget/status-widget.component';
import { MarkdownWidgetComponent } from './components/markdown-widget/markdown-widget.component';
// tslint:disable-next-line:max-line-length
import { MarkdownWidgetVisualAppearanceComponent } from './components/markdown-widget/children/markdown-widget-visual-appearance/markdown-widget-visual-appearance.component';
import { TopnWidgetComponent } from './components/topn-widget/topn-widget.component';
import { HeatmapWidgetComponent } from './components/heatmap-widget/heatmap-widget.component';
import { EventsWidgetComponent } from './components/events-widget/events-widget.component';
import { TableWidgetComponent } from './components/table-widget/table-widget.component';

import { UniversalDataTooltipDirectivesModule } from '../universal-data-tooltip/universal-data-tooltip-directives.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        DygraphsModule,
        ChartjsModule,
        D3Module,
        RouterModule,
        SharedcomponentsModule,
        UniversalDataTooltipDirectivesModule,
        MarkdownModule.forRoot({
            markedOptions: {
              provide: MarkedOptions,
              useValue: {
                sanitize: true,
              }
            }
          })
    ],
    exports: [
        PlaceholderWidgetComponent,
        LinechartWidgetComponent,
        BarchartWidgetComponent,
        DeveloperWidgetComponent,
        BignumberWidgetComponent,
        BignumberVisualAppearanceComponent,
        DonutWidgetComponent,
        TopnWidgetComponent,
        StatusWidgetComponent,
        DonutchartLegendComponent,
        MarkdownWidgetComponent,
        MarkdownWidgetVisualAppearanceComponent,
        EventsWidgetComponent,
        TableWidgetComponent
    ],
    declarations: [
        PlaceholderWidgetComponent,
        LinechartWidgetComponent,
        DeveloperWidgetComponent,
        BignumberWidgetComponent,
        BignumberVisualAppearanceComponent,
        DonutWidgetComponent,
        TopnWidgetComponent,
        StatusWidgetComponent,
        BarchartWidgetComponent,
        DonutchartLegendComponent,
        MarkdownWidgetComponent,
        MarkdownWidgetVisualAppearanceComponent,
        TopnWidgetComponent,
        HeatmapWidgetComponent,
        EventsWidgetComponent,
        TableWidgetComponent
    ],
    entryComponents: [
        PlaceholderWidgetComponent,
        LinechartWidgetComponent,
        HeatmapWidgetComponent,
        BarchartWidgetComponent,
        DeveloperWidgetComponent,
        BignumberWidgetComponent,
        DonutWidgetComponent,
        TopnWidgetComponent,
        StatusWidgetComponent,
        MarkdownWidgetComponent,
        EventsWidgetComponent,
        TableWidgetComponent
    ]
})
export class DynamicWidgetsModule { }
