import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttScrollListener]'
})
export class TtScrollListenerDirective implements OnDestroy, OnInit {

    private _scrollListener: any;
    private _scrollTimeout: any;

    constructor(
        private service: UniversalDataTooltipService,
        private elRef: ElementRef
    ) {}

    ngOnInit() {
        this._scrollListener = this.elRef.nativeElement.addEventListener('scroll', (event: any) => {

            // tell service that scrolling is happening
            // so it can hide tooltip
            this.service.appScrolling(true);

            // clear old timeout
            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(() => {
                // tell service that scrolling stopped
                // so tooltips can show again
                this.service.appScrolling(false);
            }, 300);

        }, {capture: true, passive: true});
    }

    /* last */
    ngOnDestroy() {
        this.elRef.nativeElement.removeEvent
    }

}
