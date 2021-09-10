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
import { Component, OnInit, Input, Output, EventEmitter, forwardRef, HostBinding } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dropdown-join-type',
    templateUrl: './dropdown-join-type.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DropdownJoinTypeComponent),
        multi: true,
    }]
})
export class DropdownJoinTypeComponent implements OnInit {

    @HostBinding('class.dropdown-join-type') private _hostClass = true;

    @Input() value;

    @Output()
    change = new EventEmitter<string>();

    joinOptions: Array<any> = [
      { value: 'INNER', label: 'inner' },
      { value: 'LEFT', label: 'left' },
      { value: 'LEFT_DISJOINT', label: 'left disjoint' },
      { value: 'NATURAL_OUTER', label: 'natural' },
      { value: 'OUTER', label: 'outer' },
      { value: 'OUTER_DISJOINT', label: 'outer disjoint' },
      { value: 'RIGHT', label: 'right' },
      { value: 'RIGHT_DISJOINT', label: 'right disjoint' },
      { value: 'CROSS', label: 'cross' }
    ];

    aggregatorControl: FormControl;
    defaultJoin = 'NATURAL_OUTER';
    selectedLabel = 'NATURAL';
    selectedIndex = -1;

    subscription: Subscription;

    constructor() { }

    ngOnInit() {
        if (!this.value) {
            this.value = this.defaultJoin;
        }
        this.selectedLabel = this.joinOptions.find(d => d.value === this.value ).label;
    }

    selectOption(value) {
        this.value = value;
        this.selectedLabel = this.joinOptions.find(d => d.value === this.value ).label;
        this.change.emit(this.value);
    }

}

