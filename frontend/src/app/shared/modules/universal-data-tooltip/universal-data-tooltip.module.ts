import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

// services
import { UniversalDataTooltipService } from './services/universal-data-tooltip.service';

// Directives
////import { TtMouseListenerDirective } from './directives/tt-mouse-listener.directive';
import { TtBoundaryListenerDirective } from './directives/tt-boundary-listener.directive';

// Tooltip layouts
import { LinechartDataTooltipComponent } from './components/linechart-data-tooltip/linechart-data-tooltip.component';



@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        LinechartDataTooltipComponent,
        //TtMouseListenerDirective,
        //TtBoundaryListenerDirective
    ],
    exports: [
        //TtMouseListenerDirective,
        //TtBoundaryListenerDirective
    ],
    entryComponents: [
        LinechartDataTooltipComponent
    ]
})
export class UniversalDataTooltipModule {}

