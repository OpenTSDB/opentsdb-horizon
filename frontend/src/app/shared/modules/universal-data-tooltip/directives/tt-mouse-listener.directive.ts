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
    ) {
        //console.log('***** MOUSE LISTENER *****');
    }

    ngOnInit() {}

    ngAfterViewInit() {
        this.setupMouseListener();
    }

    private setupMouseListener() {
        // console.log('%c[[[[ SETUP MOUSE LISTENER ]]]]]', 'color: white; background: red; padding: 4px;');

        this._mouseEnterListener = this.elRef.nativeElement.addEventListener('mouseenter', (event: any) => {
            // console.log('===> ME EVENT', event);
            // find the outer boundary
            const el = this.elRef.nativeElement;
            let mBoundaryEl;

            if (this.ttMultigraph) {
                // console.log('%cHAS MULTIGRAPH', 'color: white; background: green;');
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
                // console.log('%cNOT MULTIGRAPH', 'color: white; background: red;');
                if (el.closest('.gridster-stage')) {
                    // console.log('===> DASHBOARD');
                    mBoundaryEl = el.closest('.widget-loader');
                }
                else if (el.closest('.edit-view-container')) {
                    // console.log('===> EDIT DASHBOARD');
                    mBoundaryEl = this.elRef.nativeElement;
                }
                else if (el.closest('.alert-configuration-wrapper')) {
                    // console.log('===> EDIT ALERT');
                    // alerts page with chart
                    mBoundaryEl = this.elRef.nativeElement;
                }
                // tell service we are entering an element that has tooltips
                // so it can set up the correct tooltip layout
                this.ttCompSvc.tooltipType(this.ttType, mBoundaryEl);
            }

            // console.log('%cTT MOUSE BOUNDARY', 'color: white; background: purple; padding: 2px 3px;', mBoundaryEl, this.elRef.nativeElement);

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
        //console.log('%c[[[[ REMOVE LISTENERS ]]]]]', 'color: white; background: red; padding: 4px;', this._mouseListeners);

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
