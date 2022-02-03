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
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-visual-type',
  templateUrl: './dropdown-visual-type.component.html',
  styleUrls: ['./dropdown-visual-type.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DropdownVisualTypeComponent {
    @HostBinding('class.dropdown-visual-type') private _hostClass = true;

    @Input() value = 'line';

    @Output()
    valueChange = new EventEmitter<string>();

    visualTypeOptions: Array<any> = [
        {
            label: 'Line',
            value: 'line',
            icon: 'd-chart-line'
        },
        {
            label: 'Bar',
            value: 'bar',
            icon: 'd-chart-bar-vertical'
        },
        {
            label: 'Area',
            value: 'area',
            icon: 'd-chart-area-solid'
        }
    ];

    changeVisualType(type) {
        this.valueChange.emit(type);
    }
}
