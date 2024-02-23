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

/**
 * NOTE: this component doesn't appear to be used or do anything it.
 * Maybe remove it?
 */

import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'pin-panel',
    templateUrl: './pin-panel.component.html',
    styleUrls: ['./pin-panel.component.scss'],
})
export class PinPanelComponent implements OnInit {
    @HostBinding('class.pin-panel') private _hostClass = true;

    constructor() {}

    ngOnInit() { /* do nothing */ }
}
