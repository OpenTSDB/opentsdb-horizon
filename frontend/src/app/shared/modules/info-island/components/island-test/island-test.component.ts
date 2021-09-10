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
import { Component, OnInit, Input, Output, Inject } from '@angular/core';
import { ISLAND_DATA } from '../../info-island.tokens';

@Component({
// tslint:disable-next-line: component-selector
    selector: 'island-test',
    templateUrl: './island-test.component.html',
    styleUrls: []
})
export class IslandTestComponent implements OnInit {

    @Input() data: any = {};

    constructor(
        @Inject(ISLAND_DATA) private _data: any // injection as private, to give you opportunity to do whatever you want first
    ) {
        if (_data) {
            this.data = _data;
        }
    }

    ngOnInit() {
    }

}
