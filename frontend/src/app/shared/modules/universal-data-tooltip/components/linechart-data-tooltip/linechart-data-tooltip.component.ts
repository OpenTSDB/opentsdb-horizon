import {
    Component,
    OnInit,
    HostBinding,
    OnDestroy,
    Renderer2,
    ViewChild,
    ElementRef
} from '@angular/core';
import { DataTooltipComponent } from '../data-tooltip/data-tooltip';
import { LoggerService } from '../../../../../core/services/logger.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { TooltipDataService, TooltipData } from '../../services/tooltip-data.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'linechart-data-tooltip',
    templateUrl: './linechart-data-tooltip.component.html'
})
export class LinechartDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.linechart-data-tooltip') private _hostClass = true;
    // @HostBinding('class.hidden') public tooltipHidden = true;
    @ViewChild('tooltipOutput', {read: ElementRef}) public ttOutputEl: ElementRef;

    //positionStrategy: string = 'sticky';

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        logger: LoggerService,
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer,
            logger
        );
        // this.logger.ng('LINECHART CONSTRUCTOR');
    }

    ngOnInit() {

        super.ngOnInit();
        super._dataStreamSubscribe((data: any) => {
            // this.logger.log('LINECHART DATA CB', data);
            return this.dataFormatter(data);
        });
    }

    private dataFormatter(data: any): any {
        // this.logger.log('LINECHART DATA FORMATTER', data);
        return data;
    }

    /* LAST */
    ngOnDestroy() {
        super.ngOnDestroy();
    }

}
