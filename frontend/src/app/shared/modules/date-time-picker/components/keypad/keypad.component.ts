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
    Output,
    EventEmitter,
    Input,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'keypad',
    templateUrl: './keypad.component.html',
    styleUrls: ['./keypad.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class KeypadComponent implements OnInit {
    @HostBinding('class.dtp-keypad') private _hostClass = true;

    @Output() amountSelected = new EventEmitter<string>();
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() disableKeysAt3: boolean = false;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() disableKeysAt9: boolean = false;

    @Input() preset: any;

    constructor() {}

    ngOnInit() { /* do nothing */ }

    clicked(amount: string): void {
        this.amountSelected.emit(amount);
    }
}
