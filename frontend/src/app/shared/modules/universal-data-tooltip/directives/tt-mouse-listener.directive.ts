import { Directive, ElementRef, OnDestroy, OnInit, Input } from '@angular/core';
import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttMouseListener]'
})
export class TtMouseListenerDirective implements OnDestroy, OnInit {

    @Input('ttType') tooltipType: string = 'linechart'; // line is default

    private _mouseEnterListener: any;
    private _mouseOutListener: any;

    private _mouseMoveListener: any;

    constructor(
        private service: UniversalDataTooltipService,
        private elRef: ElementRef
    ) {
        console.log('***** MOUSE LISTENER *****');
    }

    ngOnInit() {
        this._mouseEnterListener = this.elRef.nativeElement.addEventListener('mouseenter', (event: any) => {

            // tell service we are entering an element that has tooltips
            this.service.tooltipListen(this.tooltipType);

        }, {capture: true, passive: true});

        this._mouseOutListener = this.elRef.nativeElement.addEventListener('mouseout', (event: any) => {

            // tell service we are exiting an element that has tooltips
            this.service.tooltipMute();

        }, {capture: true, passive: true});
    }

    /* last */
    ngOnDestroy() {
        // remove events
        this.elRef.nativeElement.removeEvent('mouseenter', this._mouseEnterListener);
        this.elRef.nativeElement.removeEvent('mouseenter', this._mouseOutListener);
    }
}
