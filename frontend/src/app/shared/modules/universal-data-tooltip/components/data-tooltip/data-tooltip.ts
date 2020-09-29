import { OnInit, HostBinding, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { LoggerService } from '../../../../../core/services/logger.service';
import { TooltipDataService } from '../../services/tooltip-data.service';

export abstract class DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.data-tooltip') private _baseClass = true;
    @HostBinding('style') positionStyles: SafeStyle = '';

    @HostBinding('class.move-position-strategy')
    get movePositionStrategy(): boolean {
        if (this.largeWidgetOverride !== undefined && this.largeWidgetOverride === true) {
            return true;
        }
        return this.positionStrategy === 'move';
    }

    @HostBinding('class.sticky-position-strategy')
    get stickyPositionStrategy(): boolean {
        if (this.largeWidgetOverride !== undefined && this.largeWidgetOverride === true) {
            return false;
        }
        return this.positionStrategy === 'sticky';
    }

    private _tooltipHidden: boolean;
    @HostBinding('class.hidden')
    private get tooltipHidden(): boolean {
        if (!this._ttData) {
            return true; // if no data, automatically hide it
        }
        return this._tooltipHidden;
    }

    private set tooltipHidden(val: boolean) {
        this._tooltipHidden = val;
    }

    private largeWidgetOverride;

    public ttOutputEl: ElementRef;
    public mouseBoundaryEl: HTMLElement;
    public scrollBoundaryEl: HTMLElement;

    // NEW STUFF
    public _ttData: any = false;
    public _ttPosition: any = {};

    // output shift direction (which direction the tooltip goes depending on edge proximity)
    public xShift: string = 'right'; // right || left
    public yShift: string = 'below'; // below || above

    public positionStrategy: string = 'move'; // move || sticky

    // placeholder for optional document mousemove listener
    private _positionListener: () => void;

    private _dataStream$: Observable<any>;

    private subscription: Subscription = new Subscription();

    constructor(
        public ttDataSvc: TooltipDataService,
        public renderer: Renderer2,
        public sanitizer: DomSanitizer,
        public logger: LoggerService,
    ) {}

    ngOnInit() {
        // start listening to tooltip data service
        this._dataStream$ = this.ttDataSvc._ttStreamListen();
    }

    _dataStreamSubscribe(dataFormatter?: Function, positionAdjuster?: Function) {
        this.subscription.add(this._dataStream$.subscribe((ttData: any) => {
            // this.logger.log('__DT STREAM DATA', ttData);
            if (!ttData) {
                this._ttData = false;
                this.hide();
            } else {
                // assign data, and run through formatter (if any)
                this._ttData = (dataFormatter) ? dataFormatter(ttData.data) : ttData.data;

                // if you didn't assign a position listener, assuming position coming from chart library
                // otherwise position coming from window level mouseevent
                if (!this._positionListener) {
                    this._ttPosition = (positionAdjuster) ? positionAdjuster(ttData.position) : ttData.position;
                    // position it
                    this._positioner();
                }
                // show it
                this.show();

            }
        }));
    }

    show() {
        // console.log('===> SHOW');
        this.tooltipHidden = false;
    }

    hide() {
        // console.log('===> HIDE');
        this.tooltipHidden = true;
        this.renderer.removeClass(this.mouseBoundaryEl, 'tooltip-mouse-boundary-hover');
        this.largeWidgetOverride = undefined;
    }

    getTooltipOutputDiv() {
        return this.ttOutputEl.nativeElement;
    }

    _removePositionListener() {
        this._positionListener();
    }

    // in case charting library doesn't provide full mousemove event coordinates from window level,
    // or it just does something weird... This at least captures window level mouse movement that we can use
    _addPositionListener() {
        this._positionListener = this.renderer.listen(window.document, 'mousemove', (event) => {
            const pos = {
                x: event.x,
                y: event.y
            }
            this._ttPosition = pos;
            this._positioner();
        });
    }
    /* POSITIONER */
    private _positioner() {
        // this.logger.ng('_POSITIONER', this.mouseBoundaryEl);

        if (!this.ttOutputEl || !this.ttOutputEl.nativeElement) {
            this.tooltipHidden = true;
        } else {
            if (this.tooltipHidden === true) {
                this.tooltipHidden = false;
            }
        }

        if (!this.tooltipHidden && this._ttData && this._ttPosition) {

            const wrapCoords = this.mouseBoundaryEl.getBoundingClientRect();
            const winSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // get dimensions of tooltip
            const outputCoords = this.ttOutputEl.nativeElement.getBoundingClientRect();

            // if strategy is sticky, check if we need large widget override
            if (this.largeWidgetOverride === undefined && this.positionStrategy === 'sticky') {

                //this.logger.action('CHECK FOR LARGE WIDGET');
                // check if widget is fairly large in comparison to window
                // if too large, skip sticky position strategy (if it is set)
                // and revert to normal tooltip behavior
                const widthRatio = (wrapCoords.width / winSize.width) * 100;
                const heightRatio = (wrapCoords.height / winSize.height) * 100;

                // ratio limit
                const ratioLimit = 40;

                // check if any of the ratio's are larger than max ratio
                if (widthRatio >= ratioLimit || heightRatio >= ratioLimit) {
                    this.largeWidgetOverride = true;
                } else {
                    this.largeWidgetOverride = false;
                }
            }

            /** POSITION STRATEGY :: STICKY **/
            if (this.positionStrategy === 'sticky' && !this.largeWidgetOverride) {
                const scrollBoundaryOffsets: any = {
                    x: this.scrollBoundaryEl.scrollLeft,
                    y: this.scrollBoundaryEl.scrollTop
                };

                let translate: any = {
                    x: 0,
                    y: 0
                };

                //const offset = 2; // for the box-shadow-border
                const offset = 0; // no box-shadow-border

                // start style string
                let styleString: string = 'min-width: ' + (wrapCoords.width + offset * 2) + 'px; height: 1px;';

                // detect window right edge proximity
                if ((wrapCoords.right + outputCoords.width) > winSize.width) {
                    this.xShift = 'left';
                } else {
                    this.xShift = 'right';
                }
                translate.x = wrapCoords.left - offset;

                // detect window bottom edge proximity
                if ((wrapCoords.bottom + outputCoords.height) > winSize.height) {
                    this.yShift = 'above';
                    translate.y = wrapCoords.top - (offset - 1);
                } else {
                    this.yShift = 'below';
                    translate.y = (wrapCoords.top + wrapCoords.height) + ( offset - 1);
                }

                if (outputCoords.width > wrapCoords.width) {
                    this.renderer.addClass(this.ttOutputEl.nativeElement, 'is-wider');
                } else {
                    this.renderer.removeClass(this.ttOutputEl.nativeElement, 'is-wider');
                }

                // position styles - use transform3d to get performant positioning
                styleString += 'transform: translate3d(' + translate.x + 'px, ' + translate.y + 'px, 0);';

                // tell angular to trust the styles
                this.positionStyles = this.sanitizer.bypassSecurityTrustStyle(styleString);

                this.renderer.addClass(this.mouseBoundaryEl, 'tooltip-mouse-boundary-hover');
                this.renderer.removeClass(this.mouseBoundaryEl, 'shift-' + ((this.yShift === 'above') ? 'below' : 'above'));
                this.renderer.addClass(this.mouseBoundaryEl, 'shift-' + this.yShift);

            }

            /** POSITION STRATEGY :: MOUSEMOVE **/
            if (this.positionStrategy === 'move' || this.largeWidgetOverride) {

                const offsetAmount = 20;

                // detect window right edge proximity
                if ((winSize.width - this._ttPosition.x) < (outputCoords.width + offsetAmount)) {
                    this.xShift = 'left';
                } else {
                    this.xShift = 'right';
                }

                // detect window bottom edge proximity
                if ((winSize.height - this._ttPosition.y) < (outputCoords.height + offsetAmount)) {
                    this.yShift = 'above';
                } else {
                    this.yShift = 'below';
                }

                // position styles - use transform3d to get performant positioning
                const styleString = 'transform: translate3d(' + this._ttPosition.x + 'px, ' + this._ttPosition.y + 'px, 0);';

                // tell angular to trust the styles
                this.positionStyles = this.sanitizer.bypassSecurityTrustStyle(styleString);
            }
        } else {
            this.renderer.removeClass(this.mouseBoundaryEl, 'tooltip-mouse-boundary-hover');
            this.renderer.addClass(this.mouseBoundaryEl, 'shift-above');
            this.renderer.addClass(this.mouseBoundaryEl, 'shift-below');
        }

    }

    /* Last */
    ngOnDestroy() {
        if (this._positionListener) {
            this._removePositionListener();
        }
        this.subscription.unsubscribe();
        if (this.positionStrategy === 'sticky') {
            this.renderer.removeClass(this.mouseBoundaryEl, 'tooltip-mouse-boundary-hover');
            this.renderer.removeClass(this.mouseBoundaryEl, 'shift-above');
            this.renderer.removeClass(this.mouseBoundaryEl, 'shift-below');
        }
    }

}
