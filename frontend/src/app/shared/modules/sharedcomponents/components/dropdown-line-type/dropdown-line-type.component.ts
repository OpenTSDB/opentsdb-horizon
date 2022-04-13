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
import { Component, HostBinding, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dropdown-line-type',
  templateUrl: './dropdown-line-type.component.html',
  styleUrls: ['./dropdown-line-type.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DropdownLineTypeComponent {
    @HostBinding('class.dropdown-line-type') private _hostClass = true;

    @Input() value = 'solid';

    @Output()
    change = new EventEmitter<string>();

    lineTypeOptions: Array<object> = [
        {
            label: 'Solid',
            value: 'solid'
        },
        {
            label: 'Dotted',
            value: 'dotted'
        },
        {
            label: 'Dashed',
            value: 'dashed'
        },
        {
            label: 'Dot-Dashed',
            value: 'dot-dashed'
        }
    ];

    defaultLineType = 'solid';

    constructor() { }

    changeLineType(type) {
        this.change.emit(type);
    }
}
