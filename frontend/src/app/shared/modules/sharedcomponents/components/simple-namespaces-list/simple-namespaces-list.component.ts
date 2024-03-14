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
    ViewEncapsulation,
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'simple-namespaces-list',
    templateUrl: './simple-namespaces-list.component.html',
    styleUrls: ['./simple-namespaces-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimpleNamespacesListComponent implements OnInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-namespaces-list') private _componentClass = true;

    constructor() {}

    ngOnInit() {
        // do nothing
    }
}
