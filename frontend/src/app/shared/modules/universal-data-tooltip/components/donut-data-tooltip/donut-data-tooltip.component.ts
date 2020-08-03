import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';

import { TooltipDataService } from '../../services/tooltip-data.service';

@Component({
    selector: 'donut-data-tooltip',
    templateUrl: './donut-data-tooltip.component.html'
})
export class DonutDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.donut-data-tooltip') private _hostClass = true;
    // @HostBinding('class.hidden') public tooltipHidden = true;

    @ViewChild('tooltipOutput', {read: ElementRef}) public ttOutputEl: ElementRef;

    positionStrategy: string = 'sticky';

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        logger: LoggerService
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer,
            logger
        );
        // this.logger.ng('DONUT CONSTRUCTOR');
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
