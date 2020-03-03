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
    templateUrl: './simple-dashboard-list.component.html',
    styleUrls: ['./simple-dashboard-list.component.scss']
})
export class SimpleDashboardListComponent implements OnInit {
    @HostBinding('class.simple-dashboard-list') private _hostClass = true;

    dashboards: Observable<object[]>;
    dashboardsSub: Subscription;

    constructor(
        private http: HttpService
    ) { }

    ngOnInit() {
        this.dashboardsSub = this.http.getDashboards()
            .subscribe( data => {
                this.dashboards = <Observable<object[]>>data;
            });


    }

}
