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
import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { TooltipDataService } from '../../services/tooltip-data.service';

@Component({
    selector: 'topn-data-tooltip',
    templateUrl: './topn-data-tooltip.component.html',
    styleUrls: ['./topn-data-tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TopnDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.topn-data-tooltip') private _hostClass = true;

    @ViewChild('tooltipOutput', { read: ElementRef, static: false }) public ttOutputEl: ElementRef;

    positionStrategy: string = 'sticky';

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer
        );
    }

    ngOnInit() {
        super.ngOnInit();
        super._dataStreamSubscribe();
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
