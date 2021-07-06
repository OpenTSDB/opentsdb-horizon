/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    Component,
    OnInit,
    HostBinding
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
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
