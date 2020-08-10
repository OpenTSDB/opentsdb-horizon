import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';

import { TooltipDataService } from '../../services/tooltip-data.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    selector: 'barchart-data-tooltip',
    templateUrl: './barchart-data-tooltip.component.html'
})
export class BarchartDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.barchart-data-tooltip') private _hostClass = true;

    @ViewChild('tooltipOutput', { read: ElementRef }) public ttOutputEl: ElementRef;

    positionStrategy: string = 'sticky';

    private utils: UtilsService;

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        logger: LoggerService,
        _utils: UtilsService
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer,
            logger
        );
        this.utils = _utils;
    }

    ngOnInit() {
        super.ngOnInit();
        super._addPositionListener();
        super._dataStreamSubscribe((data: any) => {
            // this.logger.log('BAR CHART DATA CB', {data});
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
