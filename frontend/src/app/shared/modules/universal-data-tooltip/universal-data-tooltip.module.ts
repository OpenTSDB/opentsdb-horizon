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
import { NgModule, ModuleWithProviders, Injector, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';

// services
import { TooltipDataService } from './services/tooltip-data.service';
import { TooltipComponentService } from './services/tooltip-component.service';

// Tooltip layouts
import { LinechartDataTooltipComponent } from './components/linechart-data-tooltip/linechart-data-tooltip.component';
import { TopnDataTooltipComponent } from './components/topn-data-tooltip/topn-data-tooltip.component';
import { DonutDataTooltipComponent } from './components/donut-data-tooltip/donut-data-tooltip.component';
import { BarchartDataTooltipComponent } from './components/barchart-data-tooltip/barchart-data-tooltip.component';
import { HeatmapDataTooltipComponent } from './components/heatmap-data-tooltip/heatmap-data-tooltip.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        LinechartDataTooltipComponent,
        TopnDataTooltipComponent,
        DonutDataTooltipComponent,
        BarchartDataTooltipComponent,
        HeatmapDataTooltipComponent
    ],
    exports: [],
    entryComponents: [
        LinechartDataTooltipComponent,
        TopnDataTooltipComponent,
        DonutDataTooltipComponent,
        BarchartDataTooltipComponent,
        HeatmapDataTooltipComponent
    ]
})
export class UniversalDataTooltipModule {
    static forRoot(): ModuleWithProviders<UniversalDataTooltipModule> {
        return {
            ngModule: UniversalDataTooltipModule,
            providers: [
                TooltipDataService,
                TooltipComponentService
            ]
        }
    }
}

