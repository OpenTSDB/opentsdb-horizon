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
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../core/services/config.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-navigator-sidenav',
    templateUrl: './navigator-sidenav.component.html',
    styleUrls: ['./navigator-sidenav.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NavigatorSidenavComponent implements OnInit {
    @HostBinding('class.app-navigator-sidenav') private _hostClass = true;

    @Input() adminMember = false;
    @Input() activeNav: any = {};
    @Input() readonly = true;
    @Output() activeNavChange: EventEmitter<any> = new EventEmitter();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() drawerOpen: boolean = false;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() mediaQuery: string = '';

    navItems: any[] = [
        { section: 'dashboard', label: 'Dashboards', icon: 'd-dashboard-tile' },
        // { section: 'metric-explorer',   label: 'Metric Explorer',   icon: 'd-chart-line' },
        { section: 'alerts', label: 'Alerts', icon: 'd-notification' },
        // { section: 'test',              label: 'Toggle Test',       icon: 'd-setting' },
        {
            section: 'settings',
            label: 'Settings',
            icon: 'd-setting',
            spacerAfter: true,
        },
        {
            section: 'admin',
            label: 'Admin',
            icon: 'd-user-secure',
            requiresUserAdmin: true,
        },
    ];

    brandingImageUrl: any = '/assets/horizon-logo-icon-only.png'; // path to the image file. We will default to one in public assets folder
    private brandingHomeUrl = '/main'; // href path that you go to if you click on the logo. We default to main

    constructor(
        private router: Router,
        private appConfig: AppConfigService,
        private domSanitizer: DomSanitizer,
    ) {
        const config = this.appConfig.getConfig();
        if (config.uiBranding && config.uiBranding.logo) {
            const brandingConfig = config.uiBranding.logo;
            if (brandingConfig.imageUrl) {
                this.brandingImageUrl = brandingConfig.imageUrl;
            }
            if (brandingConfig.homeUrl) {
                this.brandingHomeUrl = brandingConfig.homeUrl;
            }
        }
        this.brandingImageUrl =
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.brandingImageUrl,
            );
    }

    ngOnInit() { /* do nothing */ }

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
        this.router.navigate([this.brandingHomeUrl]);
    }

    getBrandLogo() {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(
            this.brandingImageUrl,
        );
    }
}
