import { NgModule, ModuleWithProviders} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinechartDataTooltipComponent } from './components/linechart-data-tooltip/linechart-data-tooltip.component';

import { UniversalDataTooltipServiceProvider } from './services/universal-data-tooltip.provider';
import { TtMouseListenerDirective } from './directives/tt-mouse-listener.directive';
import { TtScrollListenerDirective } from './directives/tt-scroll-listener.directive';

@NgModule({
    declarations: [
        LinechartDataTooltipComponent,
        TtMouseListenerDirective,
        TtScrollListenerDirective
    ],
    exports: [
        TtMouseListenerDirective,
        TtScrollListenerDirective
    ],
    imports: [
        CommonModule
    ],
    entryComponents: [
        LinechartDataTooltipComponent
    ]
})
export class UniversalDataTooltipModule {
    public static forRoot(): ModuleWithProviders {
        return ({
            ngModule: UniversalDataTooltipModule,
            providers: [ UniversalDataTooltipServiceProvider ]
        });
    }
}

