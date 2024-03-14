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
    Input,
    Output,
    EventEmitter,
    forwardRef,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

interface JoinTypeOptionData {
    label: string;
    value: string;
}
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dropdown-join-type',
    templateUrl: './dropdown-join-type.component.html',
    styleUrls: ['./dropdown-join-type.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownJoinTypeComponent),
            multi: true,
        },
    ],
})
export class DropdownJoinTypeComponent implements OnInit {
    @HostBinding('class.dropdown-join-type') private _hostClass = true;

    @Input() value;

    @Output()
    valueChange = new EventEmitter<string>();

    joinOptions: Array<JoinTypeOptionData> = [
        { value: 'INNER', label: 'inner' },
        { value: 'LEFT', label: 'left' },
        { value: 'LEFT_DISJOINT', label: 'left disjoint' },
        { value: 'NATURAL_OUTER', label: 'natural' },
        { value: 'OUTER', label: 'outer' },
        { value: 'OUTER_DISJOINT', label: 'outer disjoint' },
        { value: 'RIGHT', label: 'right' },
        { value: 'RIGHT_DISJOINT', label: 'right disjoint' },
        { value: 'CROSS', label: 'cross' },
    ];

    aggregatorControl: UntypedFormControl;
    defaultJoin = 'NATURAL_OUTER';
    selectedLabel = 'NATURAL';
    selectedIndex = -1;

    subscription: Subscription;

    constructor() {}

    ngOnInit() {
        if (!this.value) {
            this.value = this.defaultJoin;
        }
        this.selectedLabel = this.joinOptions.find(
            (d) => d.value === this.value,
        ).label;
    }

    selectOption(value): void{
        this.value = value;
        this.selectedLabel = this.joinOptions.find(
            (d) => d.value === this.value,
        ).label;
        this.valueChange.emit(this.value);
    }
}
