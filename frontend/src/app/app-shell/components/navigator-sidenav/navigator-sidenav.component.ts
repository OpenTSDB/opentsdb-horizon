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
    Input,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navigator-sidenav',
    templateUrl: './navigator-sidenav.component.html',
    styleUrls: [ './navigator-sidenav.component.scss' ]
})
export class NavigatorSidenavComponent implements OnInit {

    @HostBinding('class.app-navigator-sidenav') private _hostClass = true;

    @Input() adminMember: boolean = false;
    @Input() activeNav: any = {};
    @Input() readonly = true;
    @Output() activeNavChange: EventEmitter<any> = new EventEmitter();

    // tslint:disable-next-line:no-inferrable-types
    @Input() drawerOpen: boolean = false;

    // tslint:disable-next-line:no-inferrable-types
    @Input() mediaQuery: string = '';

    navItems: any[] = [
        { section: 'dashboard', label: 'Dashboards', icon: 'd-dashboard-tile' },
        // { section: 'metric-explorer',   label: 'Metric Explorer',   icon: 'd-chart-line' },
        { section: 'alerts',            label: 'Alerts',            icon: 'd-notification'},
        // { section: 'test',              label: 'Toggle Test',       icon: 'd-setting' },
        { section: 'settings',          label: 'Settings',          icon: 'd-setting', spacerAfter: true},
        { section: 'admin',             label: 'Admin',             icon: 'd-user-secure', requiresUserAdmin: true }
    ];

    constructor(
        private router: Router
    ) { }

    ngOnInit() { }

    navigationClicked(obj: any) {
        if (this.activeNav === obj) {
            this.activeNav = { reset: true };
        } else {
            this.activeNav = obj;
        }
        this.activeNavChange.emit(this.activeNav);
    }

    resetActiveNav() {
        this.activeNav = {};
    }

    gotoMain() {
        this.router.navigate(['/main']);
    }

}
