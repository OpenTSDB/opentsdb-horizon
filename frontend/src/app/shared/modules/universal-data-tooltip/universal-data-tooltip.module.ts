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
        HeatmapDataTooltipComponent,
        //DataTooltipComponent
    ],
    exports: [],
    entryComponents: [
        LinechartDataTooltipComponent,
        TopnDataTooltipComponent,
        DonutDataTooltipComponent,
        BarchartDataTooltipComponent,
        HeatmapDataTooltipComponent,
        //DataTooltipComponent
    ]
})
export class UniversalDataTooltipModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: UniversalDataTooltipModule,
            providers: [
                TooltipDataService,
                TooltipComponentService
            ]
        }
    }
}

