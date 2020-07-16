import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';

import { TooltipDataService } from '../../services/tooltip-data.service';


@Component({
    selector: 'heatmap-data-tooltip',
    templateUrl: './heatmap-data-tooltip.component.html'
})
export class HeatmapDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.heatmap-data-tooltip') private _hostClass = true;
    @HostBinding('class.hidden') public tooltipHidden = true;

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
        this.logger.ng('HEATMAP CONSTRUCTOR');
    }

    ngOnInit() {
        super.ngOnInit();
        super.dataStreamSubscribe();
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
