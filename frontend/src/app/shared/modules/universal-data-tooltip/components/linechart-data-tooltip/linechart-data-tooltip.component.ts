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
    Component,
    OnInit,
    HostBinding,
    OnDestroy,
    Renderer2,
    ViewChild,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';
import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { TooltipDataService, TooltipData } from '../../services/tooltip-data.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'linechart-data-tooltip',
    templateUrl: './linechart-data-tooltip.component.html',
    styleUrls: ['./linechart-data-tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LinechartDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.linechart-data-tooltip') private _hostClass = true;

    @ViewChild('tooltipOutput', { read: ElementRef, static: true }) public ttOutputEl: ElementRef;

    positionStrategy: string = 'sticky';

    private utils: UtilsService;

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        _utils: UtilsService
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer
        );
        this.utils = _utils;
    }

    ngOnInit() {

        super.ngOnInit();
        super._dataStreamSubscribe((data: any) => {
            return this.dataFormatter(data);
        });
    }

    dataFormatter(data: any) {

        // get color contrast
        const contrast = this.utils.findContrastColor(data.color);
        data.colorContrast = contrast.hex;
        //this.console.api('LINE CHART DATA FORMATTER', data);
        return data;
    }

    /* LAST */
    ngOnDestroy() {
        super.ngOnDestroy();
    }

}
