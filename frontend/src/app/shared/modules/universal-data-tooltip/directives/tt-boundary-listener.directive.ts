import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttBoundaryListener]'
})
export class TtBoundaryListenerDirective implements OnDestroy, OnInit {

    private _scrollListener: any;
    private _scrollTimeout: any;

    constructor(
        private service: UniversalDataTooltipService,
        private elRef: ElementRef
    ) {
        console.log('************ BOUNDARY LISTENER *************');
    }

    ngOnInit() {

        // scroll listener is also the boundary
        // so let service know what element to check against
        this.service.boundaryRegister(this.elRef);

        // watch for any scrolling, and disable tooltip if that happens
        this._scrollListener = this.elRef.nativeElement.addEventListener('scroll', (event: any) => {

            // tell service that scrolling is happening
            // so it can hide tooltip
            this.service.boundaryScroll(true);

            // clear old timeout
            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(() => {
                // tell service that scrolling stopped
                // so tooltips can show again
                this.service.boundaryScroll(false);
            }, 300);

        }, {capture: true, passive: true});
    }

    /* last */
    ngOnDestroy() {
        this.service.boundaryUnregister();
        this.elRef.nativeElement.removeEvent('scroll', this._scrollListener);
    }

}
