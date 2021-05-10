import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConsoleService } from '../../../../core/services/console.service';

export interface TooltipData { data: any; position: any; };

/*@Injectable({
    providedIn: 'root'
})*/
export class TooltipDataService implements OnInit {

    /* STREAMS */
    private _tooltipStream: Subject<TooltipData | Boolean> = new Subject(); // tooltip data

    constructor(
        private console: ConsoleService
    ) {}

    ngOnInit() {}



    /* Testing New Stuff */

    _ttStreamListen(): Observable<TooltipData | Boolean> {
        return this._tooltipStream.asObservable();
    }

    _ttDataPut(data: TooltipData | Boolean) {
        //this.console.api('_ttDataPut', data);
        this._tooltipStream.next(data);
    }

}
