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

import { TemplatePortal } from '@angular/cdk/portal';
import { Component, HostBinding, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive } from '@angular/router';
import { Store } from '@ngxs/store';
import { CdkService } from '../../../core/services/cdk.service';
import { filter, findIndex } from 'rxjs/operators';

@Component({
    selector: 'app-admin-container',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
    @HostBinding('class') classAttribute: string = 'app-admin app-admin-container';

    // portal placeholders
    adminNavbarPortal: TemplatePortal;

    // portal templates
    @ViewChild('adminNavbarTmpl') adminNavbarTmpl: TemplateRef<any>;

    activeAdminSection: any = './';
    activeAdminSectionIndex = 0;

    // admin sections
    adminSectionLinks: any[] = [
        {
            label: 'Admin home',
            path: '',
            icon: 'd-home'
        },
        {
            label: 'Config',
            path: 'config',
            icon: 'd-setting'
        },
        {
            label: 'Themes',
            path: 'themes',
            altPath: 'theme',
            icon: 'd-palette'
        },
        {
            label: 'Users',
            path: 'users',
            altPath: 'user',
            icon: 'd-user-group'
        },
        {
            label: 'Namespaces',
            path: 'namespaces',
            altPath: 'namespace',
            icon: 'd-network-platform'
            // TODO: add some conditional flag so we can check config in UI
        }
    ];

    constructor(
        private store: Store,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private cdkService: CdkService,
    ) {
        // get some router events
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {

            const urlParts = event.urlAfterRedirects.split('?');
            const urlPath = (urlParts && urlParts.length > 0) ? urlParts[0].split('/') : [];

            //console.log('%cURL','color: white; background: purple;', urlPath);

            if (urlPath.length === 2) {
                // admin default
                this.activeAdminSectionIndex = 0;
            } else if (urlPath.length > 2) {
                let subPath = urlPath[2];
                let subIndex = this.adminSectionLinks.findIndex((link: any) => {
                    return link.path === subPath || link.altPath === subPath;
                });
                this.activeAdminSectionIndex = subIndex;
            } else {
                // should never get here
            }
        });

        this.router.isActive
    }

    ngOnInit() {
        // setup navbar portal
        this.adminNavbarPortal = new TemplatePortal(this.adminNavbarTmpl, undefined, {});
        this.cdkService.setNavbarPortal(this.adminNavbarPortal);
    }

    // nav click
    changeAdminSection(index: any) {
        let link = this.adminSectionLinks[index];

        this.activeAdminSection = link.path;
        this.activeAdminSectionIndex = index;

    }


}
