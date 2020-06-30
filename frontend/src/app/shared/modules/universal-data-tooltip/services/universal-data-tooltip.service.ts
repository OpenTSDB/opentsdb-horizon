import { Injectable} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';
import { TooltipDispatcher } from '../components/tooltip-dispatcher/tooltip-dispatcher';
@Injectable({
    providedIn: 'root'
})
export class UniversalDataTooltipService {

    private tooltipStream: Subject<any>;

    constructor(
        private dispatcher: TooltipDispatcher,
        private logger: LoggerService,
    ) {
        this.logger.ng('UNIVERSAL DATA TOOLTIP SERVICE INIT');

        this.tooltipStream = new Subject();

        this.dispatcher.setService(this);
        this.dispatcher.attach();
    }

    // stream items
    ttStreamListen(): Observable<any> {
        return this.tooltipStream.asObservable();
    }

    ttDataPut(data: any) {
        this.tooltipStream.next(data);
    }

    //
    appScrolling(scrolling: boolean = false) {
        this.dispatcher.appScrolling(scrolling);
    }

    // privates

}


