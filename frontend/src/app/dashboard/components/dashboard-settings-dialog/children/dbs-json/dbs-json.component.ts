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
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dbs-json',
    templateUrl: './dbs-json.component.html',
    styleUrls: ['./dbs-json.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DbsJsonComponent implements OnInit {

    @HostBinding('class.dbs-json-component') private _hostClass = true;
    @HostBinding('class.dbs-settings-tab') private _tabClass = true;

    /** Inputs */
    @Input() dbData: any = {};

    /** Outputs */
    @Output() dataUpdated: any = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
