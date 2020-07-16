import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
//import { UniversalDataTooltipttCompSvc } from '../ttCompSvcs/universal-data-tooltip.ttCompSvc';
import { TooltipComponentService } from '../services/tooltip-component.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttBoundaryListener]'
})
export class TtBoundaryListenerDirective implements OnDestroy, OnInit {

    private _scrollListener: any;
    private _scrollTimeout: any;

    constructor(
        //private ttCompSvc: UniversalDataTooltipttCompSvc,
        private ttCompSvc: TooltipComponentService,
        private elRef: ElementRef
    ) {
        console.log('************ BOUNDARY LISTENER *************');
    }

    ngOnInit() {

        // scroll listener is also the boundary
        // so let ttCompSvc know what element to check against
        this.ttCompSvc.boundaryRegister(this.elRef);

        // watch for any scrolling, and disable tooltip if that happens
        this._scrollListener = this.elRef.nativeElement.addEventListener('scroll', (event: any) => {

            // tell ttCompSvc that scrolling is happening
            // so it can hide tooltip
            this.ttCompSvc.boundaryScroll(true);

            // clear old timeout
            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(() => {
                // tell ttCompSvc that scrolling stopped
                // so tooltips can show again
                this.ttCompSvc.boundaryScroll(false);
            }, 300);

        }, {capture: true, passive: true});
    }

    /* last */
    ngOnDestroy() {
        this.ttCompSvc.boundaryUnregister();
        this.elRef.nativeElement.removeEvent('scroll', this._scrollListener);
    }

}
