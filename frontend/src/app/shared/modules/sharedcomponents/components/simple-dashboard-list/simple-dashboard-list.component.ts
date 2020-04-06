import {
    Component,
    OnInit,
    HostBinding
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from '../../../../../core/http/http.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'simple-dashboard-list',
    templateUrl: './simple-dashboard-list.component.html'
})
export class SimpleDashboardListComponent implements OnInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-dashboard-list') private _componentClass = true;

    dashboards: Observable<object[]>;
    dashboardsSub: Subscription;

    constructor(
        private http: HttpService
    ) { }

    ngOnInit() {
        /* Will fetch data from another place
        this.dashboardsSub = this.http.getDashboards()
            .subscribe( data => {
                this.dashboards = <Observable<object[]>>data;
            });
        */

    }

}
