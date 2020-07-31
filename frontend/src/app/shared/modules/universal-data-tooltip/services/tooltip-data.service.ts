import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';

export interface TooltipData { data: any; position: any; };

/*@Injectable({
    providedIn: 'root'
})*/
export class TooltipDataService implements OnInit {

    /* STREAMS */
    //private tooltipStream: Subject<any> = new Subject(); // tooltip data

    private _tooltipStream: Subject<TooltipData | Boolean> = new Subject(); // tooltip data

    constructor(
        private logger: LoggerService
    ) {}

    ngOnInit() {}

    /*ttStreamListen(): Observable<any> {
        return this.tooltipStream.asObservable();
    }

    ttDataPut(payload: any) {
        this.tooltipStream.next(payload);
    }*/

    /* Testing New Stuff */

    _ttStreamListen(): Observable<TooltipData | Boolean> {
        return this._tooltipStream.asObservable();
    }

    _ttDataPut(data: TooltipData | Boolean) {
        this.logger.api('_ttDataPut', data);
        this._tooltipStream.next(data);
    }

}
