import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';

// components
import { NavigatorPanelItemDirective } from './directives/navigator-panel-item.directive';
import { NavigatorPanelComponent, NavigatorPanelItemElement } from './components/navigator-panel/navigator-panel.component';

@NgModule({
    imports: [
        CommonModule,
        SharedcomponentsModule,
    ],
    declarations: [
        NavigatorPanelItemDirective,
        NavigatorPanelComponent,
        NavigatorPanelItemElement
    ],

    exports: [
        NavigatorPanelItemDirective,
        NavigatorPanelComponent
    ]
})
export class AppShellSharedModule { }
