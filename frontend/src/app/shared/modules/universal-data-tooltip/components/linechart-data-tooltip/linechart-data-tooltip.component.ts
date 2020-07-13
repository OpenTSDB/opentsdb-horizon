import {
    Component,
    OnInit,
    HostBinding,
    OnDestroy,
    Renderer2,
    ViewChild,
    ElementRef
} from '@angular/core';
import { LoggerService } from '../../../../../core/services/logger.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'universal-data-tooltip',
    templateUrl: './linechart-data-tooltip.component.html',
    styleUrls: ['./linechart-data-tooltip.component.scss']
})
export class LinechartDataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.linechart-data-tooltip') private _hostClass = true;
    @HostBinding('class.hidden') private _tooltipHidden = true;
    @HostBinding('style') private positionStyles: SafeStyle = '';

    @ViewChild('tooltipOutput', {read: ElementRef}) private ttOutputEl;

    // output shift direction (which direction the tooltip goes depending on edge proximity)
    xShift: string = 'right';
    yShift: string = 'below';

    // placeholder for document mousemove listener
    private positionListener: () => void;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // local private variables
    private scrollTimeout: any;
    private scrollListener: any;

    constructor(
        // private logger: LoggerService,
        private renderer: Renderer2,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
        // this.logger.ng('UNIVERSAL DATA TOOLTIP INIT');
        this.addPositionListener();
    }

    show() {
        this._tooltipHidden = false;
    }

    hide() {
        this._tooltipHidden = true;
    }

    private addPositionListener() {
        this.positionListener = this.renderer.listen(window.document, 'mousemove', (event) => {
            if (!this._tooltipHidden) {
                const winSize = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };

                // detect window right edge proximity
                if ((winSize.width - event.x) < 200) {
                    this.xShift = 'left';
                } else {
                    this.xShift = 'right';
                }

                // detect window bottom edge proximity
                if ((winSize.height - event.y) < 200) {
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

    private removePositionListener() {
        this.positionListener();
    }

    /* LAST */
    ngOnDestroy() {
        if (this.positionListener) {
            this.removePositionListener();
        }
        this.subscription.unsubscribe();
    }

}
