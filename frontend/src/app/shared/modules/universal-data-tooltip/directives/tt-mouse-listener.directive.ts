import { Directive, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttMouseListener]'
})
export class TtMouseListenerDirective implements OnDestroy {

    constructor(
        private service: UniversalDataTooltipService,
        private elRef: ElementRef,
        private renderer: Renderer2
    ) { }

    /* last */
    ngOnDestroy() {

    }
}
