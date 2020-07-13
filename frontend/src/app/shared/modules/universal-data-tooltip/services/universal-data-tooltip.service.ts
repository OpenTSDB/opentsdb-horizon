import {
    Injectable,
    ApplicationRef,
    ComponentFactoryResolver,
    Injector,
    RendererFactory2,
    ComponentFactory,
    EmbeddedViewRef,
    ComponentRef,
    ElementRef
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';
//import { TooltipDispatcher } from '../components/tooltip-dispatcher/tooltip-dispatcher';

import { LinechartDataTooltipComponent } from '../components/linechart-data-tooltip/linechart-data-tooltip.component';
import { NumberFormatStyle } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class UniversalDataTooltipService {

    /* ELEMENTS */
    private _componentRef: ComponentRef<any>;
    private _domElem: HTMLElement;
    private _boundaryElRef: ElementRef;

    /* VARIABLES */
    private _prevTtType: string;

    /* STREAMS */
    private tooltipStream: Subject<any>; // tooltip data

    constructor(
        private appRef: ApplicationRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private rendererFactory: RendererFactory2,
        private logger: LoggerService,
    ) {
        this.logger.ng('UNIVERSAL DATA TOOLTIP SERVICE INIT');

        this.tooltipStream = new Subject();

        //this.dispatcher.setService(this);
        //this.dispatcher.attach();

        // for now....
        // this.createComponent('linechart');
    }

    // stream methods
    ttStreamListen(): Observable<any> {
        return this.tooltipStream.asObservable();
    }

    ttDataPut(data: any) {
        this.tooltipStream.next(data);
    }

    /*
        Listeners for directive watchers
    */

    // comes from tt-scroll-listener
    boundaryRegister(elRef: ElementRef) {
        this.logger.log('BOUNDARY REGISTER', elRef);
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
    tooltipListen(type: string) {
        console.log('TOOLTIP LISTEN', type);

        if (type !== this._prevTtType) {
            // destroy old component
            if (this._componentRef) {
                this.detachComponent();
            }
            this.createComponent(type);
        }

        this._componentRef.instance.show();
    }

    tooltipMute() {
        console.log('TOOLTIP MUTE');
        this._componentRef.instance.hide();
    }

    /**** PRIVATES ****/

    // tooltip component (type)

    private createComponent(type: string) {

        // create new component
        this._prevTtType = type;
        const ttType = this.getTooltipToLoad(type);

        if (ttType) {
            const factory: ComponentFactory<any> =
                this.resolver.resolveComponentFactory(LinechartDataTooltipComponent);

            this._componentRef =
                factory.create(this.injector);

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
        if (this._componentRef && this._domElem) {
            this.appRef.detachView(this._componentRef.hostView);
            document.body.removeChild(this._domElem);
            this._componentRef.destroy();
        }
    }

    private getTooltipToLoad(name: string) {
        switch (name) {

            // each will have their own, but right now default to linechart
            case 'heatmap':
            case 'barchart':
            case 'donut':
            case 'topn':
            case 'linechart':
                return LinechartDataTooltipComponent;
            // these don't have tooltips?
            case 'bignumber':
            case 'markdown':
            case 'events':
            default:
                return false;
        }
    }
}


