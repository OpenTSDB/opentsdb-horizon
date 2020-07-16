import { OnInit, HostBinding, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { LoggerService } from '../../../../../core/services/logger.service';
import { TooltipDataService } from '../../services/tooltip-data.service';

export abstract class DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.data-tooltip') private _baseClass = true;
    @HostBinding('style') positionStyles: SafeStyle = '';

    public tooltipHidden: boolean;
    public ttOutputEl: ElementRef;
    public tooltipData: any = {};

    // output shift direction (which direction the tooltip goes depending on edge proximity)
    public xShift: string = 'right';
    public yShift: string = 'below';

    // placeholder for document mousemove listener
    private positionListener: () => void;

    private dataStream$: Observable<any>;

    private subscription: Subscription = new Subscription();

    constructor(
        public ttDataSvc: TooltipDataService,
        public renderer: Renderer2,
        public sanitizer: DomSanitizer,
        public logger: LoggerService,
    ) {}

    ngOnInit() {
        // start listening to tooltip data service
        this.dataStream$ = this.ttDataSvc.ttStreamListen();
        // start watching mouse position
        this.addPositionListener();
    }

    dataStreamSubscribe(dataFormatter?: Function) {
        this.subscription.add(this.dataStream$.subscribe((data: any) => {
            // this.logger.log('DT STREAM DATA', data);
            if (data === false) {
                this.hide();
            } else {
                this.show();
            }
            this.tooltipData = (dataFormatter) ? dataFormatter(data) : data;
        }));
    }

    show() {
        // console.log('===> SHOW');
        this.tooltipHidden = false;
    }

    hide() {
        // console.log('===> HIDE');
        this.tooltipHidden = true;
    }

    getTooltipOutputDiv() {
        return this.ttOutputEl.nativeElement;
    }

    addPositionListener() {
        this.positionListener = this.renderer.listen(window.document, 'mousemove', (event) => {
            if (!this.tooltipHidden) {
                const winSize = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };

                // get dimensions of tooltip
                const outputCoords = this.ttOutputEl.nativeElement.getBoundingClientRect();
                const offsetAmount = 20;

                // detect window right edge proximity
                if ((winSize.width - event.x) < (outputCoords.width + offsetAmount)) {
                    this.xShift = 'left';
                } else {
                    this.xShift = 'right';
                }

                // detect window bottom edge proximity
                if ((winSize.height - event.y) < (outputCoords.height + offsetAmount)) {
                    this.yShift = 'above';
                } else {
                    this.yShift = 'below';
                }

                // position styles - use transform3d to get performant positioning
                const styleString = 'transform: translate3d(' + event.x + 'px, ' + event.y + 'px, 0);';

                // tell angular to trust the styles
                this.positionStyles = this.sanitizer.bypassSecurityTrustStyle(styleString);
            }
        });
    }

    removePositionListener() {
        this.positionListener();
    }

    /* Last */
    ngOnDestroy() {
        if (this.positionListener) {
            this.removePositionListener();
        }
    }

}
