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
import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TooltipComponentService } from '../services/tooltip-component.service';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ttBoundaryListener]'
})
export class TtBoundaryListenerDirective implements OnDestroy, OnInit {

    private _scrollListener: any;
    private _scrollTimeout: any;

    constructor(
        private ttCompSvc: TooltipComponentService,
        private elRef: ElementRef
    ) {}

    ngOnInit() {
        // scroll listener is also the boundary
        // so let ttCompSvc know what element to check against
        this.ttCompSvc.boundaryRegister(this.elRef.nativeElement);

        // watch for any scrolling, and disable tooltip if that happens
        this._scrollListener = this.elRef.nativeElement.addEventListener('scroll', (event: any) => {

            // tell ttCompSvc that scrolling is happening
            // so it can hide tooltip
            this.ttCompSvc.boundaryScroll(true);

            // clear old timeout
            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(() => {
                // tell ttCompSvc that scrolling stopped
                // so tooltips can show again
                this.ttCompSvc.boundaryScroll(false);
            }, 300);

        }, {capture: true, passive: true});
    }

    /* last */
    ngOnDestroy() {
        this.ttCompSvc.boundaryUnregister();
        if (this.elRef) {
            this.elRef.nativeElement.removeEventListener('scroll', this._scrollListener);
        }
    }

}
