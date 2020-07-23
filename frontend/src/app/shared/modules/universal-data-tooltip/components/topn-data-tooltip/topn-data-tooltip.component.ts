import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';

import { TooltipDataService } from '../../services/tooltip-data.service';

@Component({
    selector: 'topn-data-tooltip',
    templateUrl: './topn-data-tooltip.component.html'
})
export class TopnDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.topn-data-tooltip') private _hostClass = true;
    // @HostBinding('class.hidden') public tooltipHidden = true;

    @ViewChild('tooltipOutput', {read: ElementRef}) public ttOutputEl: ElementRef;

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
        this.logger.ng('TOPN CONSTRUCTOR');
    }

    ngOnInit() {
        super.ngOnInit();
        super.dataStreamSubscribe((data: any) => {
            this.logger.log('TOPN DATA', data);
            return data;
        });
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
