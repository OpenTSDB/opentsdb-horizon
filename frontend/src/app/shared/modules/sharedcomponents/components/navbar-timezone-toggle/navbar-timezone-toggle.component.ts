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
import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'navbar-timezone-toggle',
    templateUrl: './navbar-timezone-toggle.component.html',
    styleUrls: []
})
export class NavbarTimezoneToggleComponent {

    @HostBinding('class.navbar-timezone-toggle') private _hostClass = true;

    // tslint:disable-next-line:no-inferrable-types
    @Input() timezone: string = 'local';

    @Output() change = new EventEmitter;

    constructor() {}

    changeTimezone(tz: string) {
        if (this.timezone !== tz) {
            this.change.emit(tz);
        }
    }

}
