import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';

/*@Injectable({
    providedIn: 'root'
})*/
export class TooltipDataService implements OnInit {

    /* STREAMS */
    private tooltipStream: Subject<any> = new Subject(); // tooltip data

    constructor(
        private logger: LoggerService
    ) {}

    ngOnInit() {
        //this.tooltipStream = new Subject();
    }

    ttStreamListen(): Observable<any> {
        return this.tooltipStream.asObservable();
    }

    ttDataPut(payload: any) {
        this.tooltipStream.next(payload);
    }

}
