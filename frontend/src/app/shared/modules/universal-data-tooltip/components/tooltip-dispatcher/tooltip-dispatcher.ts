import {
    Injectable,
    ComponentRef,
    ApplicationRef,
    ComponentFactoryResolver,
    Injector,
    ComponentFactory,
    EmbeddedViewRef,
    Renderer2,
    RendererFactory2,
    OnDestroy,
    //Inject,
    //OnInit
} from '@angular/core';
//import { DOCUMENT } from '@angular/common';

import { LinechartDataTooltipComponent } from '../linechart-data-tooltip/linechart-data-tooltip.component';
import { LoggerService } from '../../../../../core/services/logger.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { UniversalDataTooltipService } from '../../services/universal-data-tooltip.service';

@Injectable({
  providedIn: 'root'
})
export class TooltipDispatcher implements OnDestroy {

    // private references
    private _componentRef: ComponentRef<any>;
    private _domElem: HTMLElement;
    private _service: UniversalDataTooltipService;

    // placeholder for document mousemove listener
    //private positionListener: () => void;

    // placeholder for renderer
    //private renderer: Renderer2;

    // Subscriptions
    private ttStreamSub: Subscription;
    //private ttPositionSub: Subscription;

    // observable stream for positioning
    //private positionStream: Subject<any>;

    constructor(
        private appRef: ApplicationRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private rendererFactory: RendererFactory2,
        //@Inject(DOCUMENT) private document,
        private logger: LoggerService
    ) {
        //this.renderer = this.rendererFactory.createRenderer(null, null);
        //this.positionStream = new Subject();
        this.createComponent();
    }

    attach() {
        this.appRef.attachView(this._componentRef.hostView);
        document.body.appendChild(this._domElem);
    }

    detach() {
        this.appRef.detachView(this._componentRef.hostView);
        document.body.removeChild(this._domElem);
        this._componentRef.destroy();
    }

    setService(service: UniversalDataTooltipService) {
        this._service = service;

        // listen to data from service
        this.ttStreamSub = this._service.ttStreamListen().subscribe((data: any) => {
            this.ttDispatcher({
                type: 'stream',
                data: data
            });
        });
    }

    appScrolling(scroll: boolean) {

    }

    private createComponent() {
        const factory: ComponentFactory<any> = this.resolver
                            .resolveComponentFactory(LinechartDataTooltipComponent);

        this._componentRef = factory.create(this.injector);

        this._domElem = (this._componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

    }

    private ttDispatcher(msg: any) {
        this.logger.log('TT DISPATCHER', msg);
        // do stuff here
    }

    /* last */
    ngOnDestroy() {

    }

}
