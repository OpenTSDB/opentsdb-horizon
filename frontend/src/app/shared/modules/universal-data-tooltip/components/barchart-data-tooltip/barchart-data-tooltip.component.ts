import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';

import { TooltipDataService } from '../../services/tooltip-data.service';

@Component({
    selector: 'barchart-data-tooltip',
    templateUrl: './barchart-data-tooltip.component.html'
})
export class BarchartDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.barchart-data-tooltip') private _hostClass = true;
    @HostBinding('class.hidden') public tooltipHidden = true;

    @ViewChild('tooltipOutput', { read: ElementRef }) public ttOutputEl: ElementRef;

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
        this.logger.ng('BARCHART CONSTRUCTOR');
    }

    ngOnInit() {
        super.ngOnInit();
        super.dataStreamSubscribe((data: any) => {
            this.logger.log('BC DATA', data);
            if (!data) {
                this.hide();
                return false;
            } else {
                this.show();
                return data;
            }

        });
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
