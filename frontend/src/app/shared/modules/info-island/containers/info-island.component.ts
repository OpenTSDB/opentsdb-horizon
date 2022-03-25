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
import { Component, OnInit, Inject, OnDestroy, HostBinding,
    AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Subject, Observable, Subscription } from 'rxjs';
import { InfoIslandOptions } from '../services/info-island-options';
import { CdkDrag} from '@angular/cdk/drag-drop';
import { Portal } from '@angular/cdk/portal';
import { IntercomService } from '../../../../core/services/intercom.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'info-island',
    templateUrl: './info-island.component.html',
    styleUrls: ['./info-island.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('infoIslandAnimation', [
            state(
                'void',
                style({
                    // transform: 'translateY(100%)',
                    opacity: 0
                })
            ),
            state(
                '*',
                style({
                    // transform: 'translateY(0)',
                    opacity: 1
                })
            ),
            transition('* <=> void', animate(`400ms cubic-bezier(0.4, 0, 0.1, 1)`))
        ])
    ]
})
export class InfoIslandComponent implements OnInit, OnDestroy, AfterViewInit  {

    constructor(
        private hostEl: ElementRef,
        private interCom: IntercomService
    ) {}

    @HostBinding('class.info-island-component') private _hostClass = true;

    @ViewChild('islandContainer', { read: ElementRef, static: true }) private _islandContainer: ElementRef;

    @ViewChild('islandContainer', { read: CdkDrag, static: true }) _dragContainer: CdkDrag;

    @ViewChild('islandToolbar', { read: ViewContainerRef, static: true }) private _islandToolbar: ViewContainerRef;
    get islandToolbar(): ViewContainerRef {
        return this._islandToolbar;
    }

    // resizers Elements
    @ViewChildren('resizerEl', { read: ElementRef }) private _resizers: QueryList<ElementRef>;
    // resizers CdkDrag instances
    @ViewChildren('resizerEl', { read: CdkDrag }) private _dragHandles: QueryList<ElementRef>;

    private onCloseIsland = new Subject<void>();
    onCloseIsland$ = this.onCloseIsland.asObservable();

    animationState: '*' | 'void' = 'void';
    private durationTimeoutId: any;

    options: InfoIslandOptions = {
        originId: false,
        closable: false,
        draggable: true,
        width: 600,
        height: 300,
        showActions: false,
        outerWrap: '.app-dboard-content', // default outermost DOM element for dashboard,
    };

    minimum_size = {x: 500, y: 200};
    origDims: any = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        // mouse_x: 0,
        // mouse_y: 0,
        pointerPosition: { x: 0, y: 0},
        transformMatrix: [0, 0, 0]
    };

    hostPosition: any;

    _mouseMoveEvent: any;
    _mouseUpEvent: any;

    portalRef: Portal<any>; // item to be displayed in island

    ngOnInit() { }

    ngAfterViewInit() {
        this.hostPosition = this.hostEl.nativeElement.getBoundingClientRect();
    }

    open(portalRef: Portal<any>, options: any) {
        // merge options
        Object.assign(this.options, options);

        this.hostEl.nativeElement.style.width = options.width + 'px';
        this.hostEl.nativeElement.style.height = options.height + 'px';
        this.hostPosition = this.hostEl.nativeElement.getBoundingClientRect();

        this.portalRef = portalRef;
        this.animationState = '*';
    }

    close() {
        this.animateClose();
    }

    animateClose() {
        this.animationState = 'void';
        clearTimeout(this.durationTimeoutId);
    }

    animationDone() {
        if (this.animationState === 'void') {
            this.hostEl.nativeElement.style.width = this.hostPosition.width;
            this.hostEl.nativeElement.style.height = this.hostPosition.height;
            this.onCloseIsland.next();
        }
    }

    updateSize(size: DOMRect) {
        if (size.width > this.options.width) {

            // check against outermost div content size
            const dbContent = document.querySelector(this.options.outerWrap);
            const dbSize = dbContent.getBoundingClientRect();

            this.options.width = (size.width + 24 < dbSize.width - 24) ? size.width + 24 : dbSize.width - 24;
            this.hostEl.nativeElement.style.width = this.options.width + 'px';
            this.hostPosition = this.hostEl.nativeElement.getBoundingClientRect();
        }
    }

    /** window dragging */

    dragIslandWindow(event: any) { }

    /** Corner Resizing */
    private getTransformMatrix(el: any) {
        const transArr = [];
        if (!window.getComputedStyle) {
            return;
        }
        const elStyle = window.getComputedStyle(el),

        // tslint:disable-next-line: deprecation
        transform = elStyle.transform || elStyle.webkitTransform;

        if (transform === 'none') {
            return [0, 0, 0];
        }

        let mat = transform.match(/^matrix3d\((.+)\)$/);
        if (mat) {
            return parseFloat(mat[1].split(', ')[13]);
        }

        mat = transform.match(/^matrix\((.+)\)$/);
        transArr.push( mat ? parseFloat(mat[1].split(', ')[4]) : 0);
        transArr.push( mat ? parseFloat(mat[1].split(', ')[5]) : 0);
        transArr.push(0);
        return transArr;
    }

    dragResizeStart(e: any) {

        const element = this._islandContainer.nativeElement;
        this.origDims.width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        this.origDims.height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        this.origDims.x = element.getBoundingClientRect().left;
        this.origDims.y = element.getBoundingClientRect().top;
        this.origDims.pointerPosition = e.source._pickupPositionOnPage;

        const transformMatrix = this.getTransformMatrix(element);
        this.origDims.transformMatrix = transformMatrix;
    }

    dragResizeMove(e: any) {
        const currentResizer = e.source.element.nativeElement;
        const element = this._islandContainer.nativeElement;

        let width: any;
        let height: any;
        const transform: any = [...this.origDims.transformMatrix];
        let triggerTransform = false;
        let diff: any;

        if (currentResizer.classList.contains('top')) {
            height = this.origDims.height - (e.pointerPosition.y - this.origDims.pointerPosition.y);

            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
                diff = (e.pointerPosition.y - this.origDims.pointerPosition.y);
                transform[1] = (e.delta.y === 1) ? transform[1] + diff : transform[1] - (diff * e.delta.y);
                triggerTransform = true;
            }
        } else if (currentResizer.classList.contains('bottom')) {
            height = this.origDims.height + (e.pointerPosition.y - this.origDims.pointerPosition.y);
            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
            }
        } else if (currentResizer.classList.contains('left')) {
            width = this.origDims.width - (e.pointerPosition.x - this.origDims.pointerPosition.x);
            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
                diff = (e.pointerPosition.x - this.origDims.pointerPosition.x);
                transform[0] = (e.delta.x === 1) ? transform[0] + diff : transform[0] - (diff * e.delta.x);
                triggerTransform = true;
            }
        } else if (currentResizer.classList.contains('right')) {
            width = this.origDims.width + (e.pointerPosition.x - this.origDims.pointerPosition.x);
            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
            }
        } else if (currentResizer.classList.contains('bottom-right')) {

            width = this.origDims.width + (e.pointerPosition.x - this.origDims.pointerPosition.x);
            height = this.origDims.height + (e.pointerPosition.y - this.origDims.pointerPosition.y);

            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
            }
            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
            }

        } else if (currentResizer.classList.contains('bottom-left')) {
            width = this.origDims.width - (e.pointerPosition.x - this.origDims.pointerPosition.x);
            height = this.origDims.height + (e.pointerPosition.y - this.origDims.pointerPosition.y);

            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
            }
            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
                diff = (e.pointerPosition.x - this.origDims.pointerPosition.x);
                transform[0] = (e.delta.x === 1) ? transform[0] + diff : transform[0] - (diff * e.delta.x);
                triggerTransform = true;
            }
        } else if (currentResizer.classList.contains('top-right')) {
            width = this.origDims.width + (e.pointerPosition.x - this.origDims.pointerPosition.x);
            height = this.origDims.height - (e.pointerPosition.y - this.origDims.pointerPosition.y);

            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
            }

            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
                diff = (e.pointerPosition.y - this.origDims.pointerPosition.y);
                transform[1] = (e.delta.y === 1) ? transform[1] + diff : transform[1] - (diff * e.delta.y);
                triggerTransform = true;
            }
        } else {

            width = this.origDims.width - (e.pointerPosition.x - this.origDims.pointerPosition.x);
            height = this.origDims.height - (e.pointerPosition.y - this.origDims.pointerPosition.y);
            let diffX: any;
            let diffY: any;

            if (width > this.minimum_size.x) {
                element.style.width = width + 'px';
                diff = (e.pointerPosition.x - this.origDims.pointerPosition.x);
                diffX = diff;
                transform[0] = (e.delta.x === 1) ? transform[0] + diff : transform[0] - (diff * e.delta.x);
                triggerTransform = true;
            }
            if (height > this.minimum_size.y) {
                element.style.height = height + 'px';
                diff = (e.pointerPosition.y - this.origDims.pointerPosition.y);
                diffY = diff;
                transform[1] = (e.delta.y === 1) ? transform[1] + diff : transform[1] - (diff * e.delta.y);
                triggerTransform = true;
            }
        }
        if (triggerTransform) {
            element.style.transform = 'translate3d(' + transform.join('px,') + 'px)';
        }

        currentResizer.style.transform = 'translate3d(0, 0, 0)';
    }

    dragResizeRelease(e: any) {
        // do something?
        this.interCom.responsePut({
            action: 'islandResizeComplete',
            payload: true
        });
    }

    /** On Destroy */

    ngOnDestroy() {
        this.onCloseIsland.unsubscribe();
    }

}
