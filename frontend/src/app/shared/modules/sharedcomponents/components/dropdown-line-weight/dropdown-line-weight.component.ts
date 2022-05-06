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
    selector: 'dropdown-line-weight',
    templateUrl: './dropdown-line-weight.component.html',
    styleUrls: ['./dropdown-line-weight.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DropdownLineWeightComponent {
    @HostBinding('class.dropdown-line-weight') private _hostClass = true;

    @Input() value;

    @Output()
    change = new EventEmitter<string>();

    lineWeightOptions: Array<any> = [
        {
            label: '0.5px',
            value: '0.5px'
        },
        {
            label: '1px',
            value: '1px'
        },
        {
            label: '2px',
            value: '2px'
        },
        {
            label: '3px',
            value: '3px'
        },
        {
            label: '4px',
            value: '4px'
        },
        {
            label: '5px',
            value: '5px'
        },
        {
            label: '6px',
            value: '6px'
        }
    ];

    changeLineWeight(weight) {
        this.change.emit(weight);
    }
}
