import { Directive, ElementRef, OnDestroy, OnInit, Input } from '@angular/core';
//import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';
import { TooltipComponentService } from '../services/tooltip-component.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttMouseListener]'
})
export class TtMouseListenerDirective implements OnDestroy, OnInit {

    @Input() ttType: string = 'linechart'; // line is default

    private _mouseEnterListener: any;
    private _mouseOutListener: any;

    private _mouseMoveListener: any;

    constructor(
        //private service: UniversalDataTooltipService,
        private ttCompSvc: TooltipComponentService,
        private elRef: ElementRef
    ) {
        console.log('***** MOUSE LISTENER *****');
    }

    ngOnInit() {
        this._mouseEnterListener = this.elRef.nativeElement.addEventListener('mouseenter', (event: any) => {

            // find the outer boundary
            const el = this.elRef.nativeElement;
            let mBoundaryEl;
            if (el.closest('.gridster-stage')) {
                mBoundaryEl = el.closest('.widget-loader');
            }
            else if (el.closest('.edit-view-container')) {
                mBoundaryEl = this.elRef.nativeElement;
            }

            // tell service we are entering an element that has tooltips
            // so it can set up the correct tooltip layout
            this.ttCompSvc.tooltipType(this.ttType, mBoundaryEl);

        }, {capture: true, passive: true});

        this._mouseOutListener = this.elRef.nativeElement.addEventListener('mouseout', (event: any) => {

            // tell service we are exiting an element that has tooltips
            // we just hide it, in case the next one is the same type
            this.ttCompSvc.tooltipMute();

        }, {capture: true, passive: true});
    }

    /*
    tooltipData(data: any) {
        this.service.ttDataPut(data);
    }
    */

    /* last */
    ngOnDestroy() {
        // remove events
        this.elRef.nativeElement.removeEvent('mouseenter', this._mouseEnterListener);
        this.elRef.nativeElement.removeEvent('mouseenter', this._mouseOutListener);
    }
}
