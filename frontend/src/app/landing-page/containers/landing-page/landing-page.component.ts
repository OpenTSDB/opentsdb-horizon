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
    HostBinding,
    ViewChild,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { CdkService } from '../../../core/services/cdk.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements OnInit {
    @HostBinding('class.landing-page-main') private _hostClass = true;

    // portal templates
    @ViewChild('landingpageNavbarTmpl', { static: true })
    landingpageNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    landingpageNavbarPortal: TemplatePortal;

    constructor(
        private cdkService: CdkService,
        private router: Router,
    ) {}

    ngOnInit() {
        // setup navbar portal
        this.landingpageNavbarPortal = new TemplatePortal(
            this.landingpageNavbarTmpl,
            undefined,
            {}
        );
        this.cdkService.setNavbarPortal(this.landingpageNavbarPortal);
    }

    createDashboard(): void {
        this.router.navigate(['dashboard', '_new_']);
    }
}
