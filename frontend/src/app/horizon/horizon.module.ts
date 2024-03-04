import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DygraphsModule } from '../shared/modules/dygraphs/dygraphs.module';
import { HorizonComponent } from './horizon.component';
import { createCustomElement } from '@angular/elements';
import { UniversalDataTooltipModule } from '../shared/modules/universal-data-tooltip/universal-data-tooltip.module';
import { UniversalDataTooltipDirectivesModule } from '../shared/modules/universal-data-tooltip/universal-data-tooltip-directives.module';
import { UnitConverterService } from '../core/services/unit-converter.service';
import { TooltipDataService } from '../shared/modules/universal-data-tooltip/services/tooltip-data.service';
import { TooltipComponentService } from '../shared/modules/universal-data-tooltip/services/tooltip-component.service';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        DygraphsModule,
        UniversalDataTooltipModule,
        UniversalDataTooltipDirectivesModule,
    ],
    declarations: [HorizonComponent],
    providers: [
        UnitConverterService,
        TooltipDataService,
        TooltipComponentService,
    ]
})
export class HorizonModule implements DoBootstrap {
    constructor(private injector: Injector) {}
    ngDoBootstrap() {
        const el = createCustomElement(HorizonComponent, {
            injector: this.injector,
        });
        customElements.define('horizon-chart', el);
    }
}
