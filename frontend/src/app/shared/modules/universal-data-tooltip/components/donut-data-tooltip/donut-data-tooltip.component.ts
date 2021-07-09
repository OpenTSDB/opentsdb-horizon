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
import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { ConsoleService } from '../../../../../core/services/console.service';

import { TooltipDataService } from '../../services/tooltip-data.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    selector: 'donut-data-tooltip',
    templateUrl: './donut-data-tooltip.component.html'
})
export class DonutDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.donut-data-tooltip') private _hostClass = true;
    // @HostBinding('class.hidden') public tooltipHidden = true;

    @ViewChild('tooltipOutput', {read: ElementRef}) public ttOutputEl: ElementRef;

    positionStrategy: string = 'sticky';

    private utils: UtilsService;

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        console: ConsoleService,
        _utils: UtilsService
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer,
            console
        );
        this.utils = _utils;
        // this.console.ng('DONUT CONSTRUCTOR');
    }

    ngOnInit() {
        super.ngOnInit();
        super._dataStreamSubscribe((data: any) => {
            const contrast = this.utils.findContrastColor(data.color);
            data.colorContrast = contrast.hex;
            return data;
        });
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
