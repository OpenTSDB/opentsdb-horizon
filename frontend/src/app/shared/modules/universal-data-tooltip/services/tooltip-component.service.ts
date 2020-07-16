import {
    Injectable,
    ComponentRef,
    ElementRef,
    ApplicationRef,
    ComponentFactoryResolver,
    Injector,
    RendererFactory2,
    ComponentFactory,
    EmbeddedViewRef
} from '@angular/core';
import { LoggerService } from '../../../../core/services/logger.service';

import {
    HeatmapDataTooltipComponent,
    BarchartDataTooltipComponent,
    DonutDataTooltipComponent,
    LinechartDataTooltipComponent,
    TopnDataTooltipComponent
} from '../components';

const TOOLTIP_TYPES: any = {
    'barchart':     BarchartDataTooltipComponent,
    'donut':        DonutDataTooltipComponent,
    'heatmap':      HeatmapDataTooltipComponent,
    'linechart':    LinechartDataTooltipComponent,
    'topn':         TopnDataTooltipComponent
};

/*@Injectable({
    providedIn: 'root'
})*/
export class TooltipComponentService {

    /* ELEMENTS */
    private _componentRef: ComponentRef<any>;
    private _domElem: HTMLElement;
    private _boundaryElRef: ElementRef;

    /* VARIABLES */
    private _prevTtType: string;

    constructor(
        private appRef: ApplicationRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private rendererFactory: RendererFactory2,
        private logger: LoggerService
    ) { }

    /*
        Listeners for directive watchers
    */

    // comes from tt-scroll-listener
    boundaryRegister(elRef: ElementRef) {
        // this.logger.log('BOUNDARY REGISTER', elRef);
        this._boundaryElRef = elRef;
    }

    boundaryUnregister() {
        this._boundaryElRef = null;
    }

    boundaryScroll(scrolling: boolean = false) {
        // hide tooltip while scrolling
        if (this._componentRef) {
            if (scrolling) {
                this._componentRef.instance.hide();
            } else {
                this._componentRef.instance.show();
            }
        }
    }

    // comes from tt-mouse-listener
    tooltipType(type: string) {
        console.log('TOOLTIP TYPE', type);

        if (type !== this._prevTtType) {
            // destroy old component
            if (this._componentRef) {
                this.detachComponent();
            }
            this.createComponent(type);
        }

        this._componentRef.instance.show();
    }

    tooltipListen() {
        console.log('TOOLTIP LISTEN');
        if (this._componentRef) {
            this._componentRef.instance.show();
        }
    }

    tooltipMute() {
        console.log('TOOLTIP MUTE');
        if (this._componentRef) {
            this._componentRef.instance.hide();
        }
    }

    /**** PRIVATES ****/

    // tooltip component (type)

    private createComponent(type: string) {
        this.logger.success('CREATE COMPONENT', {type});
        // create new component
        this._prevTtType = type;
        const ttType = this.getTooltipToLoad(type);

        if (ttType) {
            const factory: ComponentFactory<any> =
                this.resolver.resolveComponentFactory(ttType);

            this._componentRef =
                factory.create(this.injector);

            //this._componentRef.instance.dataStream(this.ttStreamListen());

            this._domElem =
                (this._componentRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;

            console.group('COMPONENT CREATE');
            console.log('type', type);
            console.log('ref', this._componentRef);
            console.log('domEl', this._domElem);
            console.groupEnd();

            this.appRef.attachView(this._componentRef.hostView);
            document.body.appendChild(this._domElem);
        }

    }

    private detachComponent() {
        this.logger.error('DETACH COMPONENT', {});
        if (this._componentRef && this._domElem) {
            this.appRef.detachView(this._componentRef.hostView);
            document.body.removeChild(this._domElem);
            this._componentRef.destroy();
        }
    }

    private getTooltipToLoad(name: string): any {
        this.logger.log('GET TOOLTIP TO LOAD', {type: name});
        if (TOOLTIP_TYPES[name]) {
            return TOOLTIP_TYPES[name];
        } else {
            return TOOLTIP_TYPES['linechart']; // default
        }
        switch (name) {

            // each will have their own, but right now default to linechart
            case 'heatmap':
                return HeatmapDataTooltipComponent;
                break;
            case 'barchart':
            case 'donut':
            case 'topn':
            case 'linechart':
                return LinechartDataTooltipComponent;
                break;
            // these don't have tooltips?
            case 'bignumber':
            case 'markdown':
            case 'events':
            default:
                return false;
                break;
        }
    }
}
