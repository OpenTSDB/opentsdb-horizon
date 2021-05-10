import { Directive, ElementRef, OnDestroy, OnInit, Input, } from '@angular/core';
//import { UniversalDataTooltipService } from '../services/universal-data-tooltip.service';
import { TooltipComponentService } from '../services/tooltip-component.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttMouseListener]'
})
export class TtMouseListenerDirective implements OnDestroy, OnInit {

    @Input() ttType: string = 'linechart'; // line is default
    @Input() ttMultigraph: boolean = false;

    // normal mouse listener
    private _mouseEnterListener: any;
    private _mouseOutListener: any;
    private _mouseMoveListener: any;

    // multigraph mouse listerns
    private _mouseListeners: any[] = [];

    private _mouseBoundaryEl: any;

    constructor(
        //private service: UniversalDataTooltipService,
        private ttCompSvc: TooltipComponentService,
        private elRef: ElementRef
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.setupMouseListener();
    }

    private setupMouseListener() {

        this._mouseEnterListener = this.elRef.nativeElement.addEventListener('mouseenter', (event: any) => {
            // find the outer boundary
            const el = this.elRef.nativeElement;
            let mBoundaryEl;

            if (this.ttMultigraph) {
                this._mouseMoveListener = this.elRef.nativeElement.addEventListener('mousemove', (e: any) => {
                    mBoundaryEl = e.target.closest('.graph-cell');
                    if (mBoundaryEl && this._mouseBoundaryEl !== mBoundaryEl) {
                        this._mouseBoundaryEl = mBoundaryEl;
                        // tell service we are entering an element that has tooltips
                        // so it can set up the correct tooltip layout
                        this.ttCompSvc.tooltipType(this.ttType, mBoundaryEl);
                    }
                }, {capture: true, passive: true});

            } else {
                if (el.closest('.gridster-stage')) {
                    mBoundaryEl = el.closest('.widget-loader');
                }
                else if (el.closest('.edit-view-container')) {
                    mBoundaryEl = this.elRef.nativeElement;
                }
                else if (el.closest('.alert-configuration-wrapper')) {
                    // alerts page with chart
                    mBoundaryEl = this.elRef.nativeElement;
                }
                // tell service we are entering an element that has tooltips
                // so it can set up the correct tooltip layout
                this.ttCompSvc.tooltipType(this.ttType, mBoundaryEl);
            }
        }, {capture: true, passive: true});

        this._mouseOutListener = this.elRef.nativeElement.addEventListener('mouseout', (event: any) => {

            if (this.ttMultigraph && this._mouseMoveListener) {
                this.elRef.nativeElement.removeEventListener('mousemove', this._mouseMoveListener)
            }
            // tell service we are exiting an element that has tooltips
            // we just hide it, in case the next one is the same type
            this.ttCompSvc.tooltipMute();

        }, {capture: true, passive: true});

    }

    private removeListeners() {
        this.elRef.nativeElement.removeEventListener('mouseenter', this._mouseEnterListener);
        this.elRef.nativeElement.removeEventListener('mouseout', this._mouseOutListener);
        if (this.ttMultigraph && this._mouseMoveListener) {
            this.elRef.nativeElement.removeEventListener('mousemove', this._mouseMoveListener);
        }
    }

    /* last */
    ngOnDestroy() {
        // remove events
        this.removeListeners();
    }
}
