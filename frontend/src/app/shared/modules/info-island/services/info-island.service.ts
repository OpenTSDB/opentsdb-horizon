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
    Injector,
    ElementRef,
    Type,
    ViewContainerRef
} from '@angular/core';

import { ComponentPortal, PortalInjector, Portal, TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef, OriginConnectionPosition, OverlayConnectionPosition, ConnectionPositionPair } from '@angular/cdk/overlay';

/** Island Wrapper */
import { InfoIslandComponent } from '../containers/info-island.component';
import { InfoIslandOptions } from './info-island-options';
import { ISLAND_DATA } from '../info-island.tokens';

/** Possible Island Components */
import { IslandTestComponent } from '../components/island-test/island-test.component';
import { EventStreamComponent } from '../components/event-stream/event-stream.component';
import { IntercomService } from '../../../../core/services/intercom.service';
import { TimeseriesLegendComponent } from '../components/timeseries-legend/timeseries-legend.component';
import { HeatmapBucketDetailComponent } from '../components/heatmap-bucket-detail/heatmap-bucket-detail.component';
import { Subscription } from 'rxjs';

@Injectable()
export class InfoIslandService {

    private overlayRef: OverlayRef;
    private islandComp: InfoIslandComponent;

    private originId: any = false;

    private readonly DEFAULT_OPTIONS: InfoIslandOptions = {
        originId: false,
        closable: true,
        draggable: true,
        width: 600,
        height: 450
    };

    private portalOutlet: ComponentPortal<any>;
    private compSub: Subscription;

    constructor(
        private injector: Injector,
        private overlay: Overlay,
        private interCom: IntercomService
    ) {}

    getComponentToLoad(name: string) {
        let retComp: any;
        switch (name) {
            case 'EventStreamComponent':
                retComp = EventStreamComponent;
                break;
            case 'TimeseriesLegendComponent':
                retComp = TimeseriesLegendComponent;
                break;
            case 'HeatmapBucketDetailComponent':
                retComp = HeatmapBucketDetailComponent;
                break;
            case 'IslandTestComponent':
            default:
                retComp = IslandTestComponent;
                break;
        }

        return retComp;
    }

    get islandToolbarRef() {
        if (this.islandComp) {
            return <ViewContainerRef>this.islandComp.islandToolbar;
        }
        return null;
    }

    /** ISLAND CREATION  */

    // new version... work in progress to simplify creation
    openIsland2(componentName: string, widgetContainerRef: ElementRef, windowOptions: Partial<InfoIslandOptions>, dataToInject: any) {
        if (this.overlayRef) {
            this.closeIsland(); // in case there is one open
        }

        // merge options
        const optionsToPass = JSON.parse(JSON.stringify(this.DEFAULT_OPTIONS));
        Object.assign(optionsToPass, windowOptions);

        this.originId = windowOptions.originId;

        const compRef = this.getComponentToLoad(componentName);
        let componentToLoad = new ComponentPortal(compRef, null, this.createInjector(dataToInject));

        // more to come
    }

    openIsland(widgetContainerRef: ElementRef, portalRef: any, options: Partial<InfoIslandOptions>) {
        if (this.overlayRef) {
            this.closeIsland(); // in case there is one open
        }

        // merge options
        const optionsToPass = JSON.parse(JSON.stringify(this.DEFAULT_OPTIONS));
        Object.assign(optionsToPass, options);
        optionsToPass.service = this;
        optionsToPass.widgetContainerRef = widgetContainerRef;

        this.originId = options.originId;

        // create overlay reference
        this.createOverlayRef(widgetContainerRef, optionsToPass);

        this.portalOutlet = new ComponentPortal(InfoIslandComponent);
        const componentRef = this.overlayRef.attach(this.portalOutlet);

        this.islandComp = componentRef.instance;

        /* Dynamic width from the opening widget - commented out for now
        const containerDims = widgetContainerRef.nativeElement.getBoundingClientRect();

        if (containerDims.width > this.DEFAULT_OPTIONS.width && containerDims.width < window.innerWidth) {
            optionsToPass.width = containerDims.width;
        }
        */

        portalRef.component.prototype.islandRef = this.islandComp;

        this.islandComp.open(<Portal<any>>portalRef, optionsToPass);
        this.compSub = this.islandComp.onCloseIsland$.subscribe(() => {
            this.overlayRef.detach();
            this.interCom.responsePut({
                id: options.originId,
                action: 'InfoIslandClosed'
            });
        });
    }

    closeIsland() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
            this.compSub.unsubscribe();
            this.interCom.responsePut({
                id: this.originId ,
                action: 'InfoIslandClosed'
            });
        }
    }

    private createOverlayRef(elRef: ElementRef, options: any) {

        const positionStrategy = this.getPositionStrategy(elRef, options.positionStrategy || 'flexible');

        this.overlayRef = this.overlay.create({
            hasBackdrop: false,
            scrollStrategy: this.overlay.scrollStrategies.noop(),
            // positionStrategy: this.getPositionStrategy(elRef)
            positionStrategy: positionStrategy
        });

    }

    updatePositionStrategy(elRef: ElementRef, strategyType: string = 'flexible') {
        if (!this.overlayRef) {
            return;
        }
        // WIP to update position strategy
        const positionStrategy = this.getPositionStrategy(elRef, strategyType);
        this.overlayRef.updatePositionStrategy(positionStrategy);
        this.overlayRef.updatePosition();

        // this.console.ng('[iiService] updatePositionStrategy', this.islandComp._dragContainer);

        // reset the drag container (resets the active transform, in case they had dragged before changing charts)
        this.islandComp._dragContainer.reset();
    }

    private getPositionStrategy(elRef: ElementRef, strategyType: string = 'flexible') {

        const origin = {
            topLeft: { originX: 'start', originY: 'top' } as OriginConnectionPosition,
            topRight: { originX: 'end', originY: 'top' } as OriginConnectionPosition,
            bottomLeft: { originX: 'start', originY: 'bottom' } as OriginConnectionPosition,
            bottomRight: { originX: 'end', originY: 'bottom' } as OriginConnectionPosition,
            topCenter: { originX: 'center', originY: 'top' } as OriginConnectionPosition,
            bottomCenter: { originX: 'center', originY: 'bottom' } as OriginConnectionPosition,
            center: { originX: 'center', originY: 'center' } as OriginConnectionPosition
        };
        const overlay = {
            topLeft: { overlayX: 'start', overlayY: 'top' } as OverlayConnectionPosition,
            topRight: { overlayX: 'end', overlayY: 'top' } as OverlayConnectionPosition,
            bottomLeft: { overlayX: 'start', overlayY: 'bottom' } as OverlayConnectionPosition,
            bottomRight: { overlayX: 'end', overlayY: 'bottom' } as OverlayConnectionPosition,
            topCenter: { overlayX: 'center', overlayY: 'top' } as OverlayConnectionPosition,
            bottomCenter: { overlayX: 'center', overlayY: 'bottom' } as OverlayConnectionPosition,
            center: { overlayX: 'center', overlayY: 'center' } as OverlayConnectionPosition
        };

        let positionStrategy: any;

        if (strategyType === 'global') {
            positionStrategy = this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically();
        } else if (strategyType === 'connected') {
            positionStrategy = this.overlay.position()
                .flexibleConnectedTo(elRef)
                .withFlexibleDimensions(false)
                .withPush(true)
                .withPositions([
                    // new ConnectionPositionPair(origin.topCenter, overlay.bottomCenter),
                    // new ConnectionPositionPair(origin.bottomCenter, overlay.topCenter),
                    new ConnectionPositionPair(origin.bottomLeft, overlay.topLeft),
                    new ConnectionPositionPair(origin.topLeft, overlay.bottomLeft),
                    new ConnectionPositionPair(origin.bottomRight, overlay.topRight),
                    new ConnectionPositionPair(origin.topRight, overlay.bottomRight)
                ]);
        } else {
            // ELSE, it's Flexible
            positionStrategy = this.overlay.position()
                .flexibleConnectedTo(elRef)
                .withFlexibleDimensions(false)
                .withPush(true)
                .withPositions([
                    new ConnectionPositionPair(origin.bottomLeft, overlay.topLeft),
                    //  new ConnectionPositionPair(origin.topLeft, overlay.topLeft),
                    new ConnectionPositionPair(origin.center, overlay.center)
                ]);
        }

        return positionStrategy;
    }

    createInjector(dataToPass): PortalInjector {
        const injectorTokens = new WeakMap();
        injectorTokens.set(ISLAND_DATA, dataToPass);
        return new PortalInjector(this.injector, injectorTokens);
    }
}
