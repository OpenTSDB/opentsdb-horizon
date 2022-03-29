/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
@Injectable()
export class TooltipComponentService {

    /* ELEMENTS */
    private _componentRef: ComponentRef<any>;
    private _domElem: HTMLElement;
    private _boundaryElRef: HTMLElement;
    private _mouseElRef: HTMLElement;

    get mouseElRef(): HTMLElement {
        return this._mouseElRef;
    }

    /* VARIABLES */
    private _prevTtType: string;

    constructor(
        private appRef: ApplicationRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private rendererFactory: RendererFactory2
    ) { }

    /*
        Listeners for directive watchers
    */

    // comes from tt-scroll-listener
    boundaryRegister(elRef: HTMLElement) {
        this._boundaryElRef = elRef;
    }

    boundaryUnregister() {
        this._boundaryElRef = null;
    }

    boundaryScroll(scrolling: boolean = false) {
        // hide tooltip while scrolling
        if (this._componentRef) {
            if (scrolling) {
                this._componentRef.instance._ttData = false; // reset data
                this._componentRef.instance.hide();
            }
        }
    }

    // comes from tt-mouse-listener
    tooltipType(type: string, mouseBoundaryEl: HTMLElement) {
        if (this._mouseElRef !== mouseBoundaryEl) {
            this._mouseElRef = mouseBoundaryEl;
        }

        // destroy old component
        if (this._componentRef) {
            this.detachComponent();
        }
        // bring in the new
        this.createComponent(type);
    }

    tooltipListen() {
        if (this._componentRef) {
            this._componentRef.instance.show();
        }
    }

    tooltipMute() {
        if (this._componentRef) {
            this._componentRef.instance.hide();
        }
    }

    /**** PRIVATES ****/

    // tooltip component (type)

    private createComponent(type: string) {
        // create new tooltip component
        this._prevTtType = type;
        const ttType = this.getTooltipToLoad(type);

        if (ttType) {
            const factory: ComponentFactory<any> =
                this.resolver.resolveComponentFactory(ttType);

            this._componentRef =
                factory.create(this.injector);

            this._componentRef.instance.mouseBoundaryEl = this._mouseElRef;
            this._componentRef.instance.scrollBoundaryEl = this._boundaryElRef;

            this._domElem =
                (this._componentRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;

            this.appRef.attachView(this._componentRef.hostView);
            document.body.appendChild(this._domElem);
        }
    }

    private detachComponent() {
        if (this._componentRef && this._domElem) {
            // remove dom from body befreo appRef
            document.body.removeChild(this._domElem);
            this.appRef.detachView(this._componentRef.hostView);
            this._componentRef.destroy();
        }
    }

    private getTooltipToLoad(name: string): any {
        if (TOOLTIP_TYPES[name]) {
            return TOOLTIP_TYPES[name];
        } else {
            return false;
        }
    }
}
