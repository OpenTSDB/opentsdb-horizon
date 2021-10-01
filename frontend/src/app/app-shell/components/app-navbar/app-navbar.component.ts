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
import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';

import { Router, NavigationStart } from '@angular/router';

import { CdkService } from '../../../core/services/cdk.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.scss']
})
export class AppNavbarComponent implements OnInit {

    @HostBinding('class.app-navbar') private _hostClass = true;

    // tslint:disable-next-line:no-inferrable-types
    @Input() mediaQuery: string = '';

    @Input() theme: string;
    @Output() themeChange = new EventEmitter<string>();

    @Output() sidenavToggle: EventEmitter<any> = new EventEmitter();

    snapshot = false;

    constructor(
        private router: Router,
        public cdkService: CdkService
    ) { }

    ngOnInit() { 
        this.router.events.subscribe((event) => {
            if ( event instanceof NavigationStart ) {
                this.snapshot = event.url.indexOf('snap') === 1;
            }
          });
    }

    toggleSidenav() {
        this.sidenavToggle.emit(true);
    }

}
