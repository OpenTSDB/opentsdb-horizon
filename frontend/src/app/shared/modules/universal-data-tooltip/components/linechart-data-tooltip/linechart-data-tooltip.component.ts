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
import { ConsoleService } from '../../../../../core/services/console.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { TooltipDataService, TooltipData } from '../../services/tooltip-data.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'linechart-data-tooltip',
    templateUrl: './linechart-data-tooltip.component.html'
})
export class LinechartDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.linechart-data-tooltip') private _hostClass = true;

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
