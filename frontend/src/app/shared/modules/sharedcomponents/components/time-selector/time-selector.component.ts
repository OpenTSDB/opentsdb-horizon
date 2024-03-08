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
    ElementRef,
    ViewChild,
    Input,
    Output,
    EventEmitter,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'time-selector',
    templateUrl: './time-selector.component.html',
    styleUrls: ['./time-selector.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TimeSelectorComponent implements OnInit {
    constructor() {}

    @HostBinding('class.time-selector-component') private _hostClass = true;
    @ViewChild('customTime') customTimeInput: ElementRef;
    @ViewChild(MatMenuTrigger) private menuTrigger: MatMenuTrigger;

    timeInSecondsAsNumber: number;

    @Input() set timeInSeconds(time: string) {
        this.timeInSecondsAsNumber = time !== null ? parseInt(time, 10) : null;
    }
    @Input() isViewMode: boolean;
    @Input() presets: number[] = []; // in seconds  // optional
    @Input() maxSeconds: number; // optional
    @Input() minSeconds: number; // optional
    @Input() empty = false;

    @Output() newTimeInSeconds = new EventEmitter();

    regexValidator = /^\d+\s*(min|h|d)$/i;
    inputVal: UntypedFormControl;

    ngOnInit() {
        if (!this.presets.length) {
            this.presets = [
                60,
                300,
                600,
                900,
                1800,
                3600,
                3600 * 2,
                3600 * 4,
                3600 * 6,
                3600 * 12,
                3600 * 24,
                3600 * 48,
            ];
        }

        if (!this.maxSeconds || this.maxSeconds < 60) {
            this.maxSeconds = 60 * 60 * 24 * 7; // 1 week
        }

        if (
            !this.minSeconds ||
            this.minSeconds < 0 ||
            this.minSeconds > this.maxSeconds
        ) {
            this.minSeconds = 60; // 1 minute
        }

        if (
            !this.empty &&
            (this.timeInSecondsAsNumber === undefined ||
                this.timeInSecondsAsNumber < 0 ||
                !Number.isInteger(this.timeInSecondsAsNumber))
        ) {
            this.timeInSecondsAsNumber = 300;
        }
        this.inputVal = new UntypedFormControl();
    }

    menuOpened() {
        if (!this.presets.includes(this.timeInSecondsAsNumber)) {
            this.inputVal = new UntypedFormControl(
                this.secondsToLabel(this.timeInSecondsAsNumber),
            );
        } else {
            this.inputVal = new UntypedFormControl();
        }
    }

    selectedPreset(num: number) {
        this.timeInSecondsAsNumber = num;
        this.newTimeInSeconds.emit(
            num !== null ? this.timeInSecondsAsNumber.toString() : null,
        );
    }

    validateTimeWindow(input) {
        return this.regexValidator.test(input);
    }

    keyedOnUnitInputBox(value: string) {
        this.customTimeInput.nativeElement.focus();
        this.updateValidators();

        if (!this.inputVal.errors) {
            this.timeInSecondsAsNumber = this.labelToSeconds(value);
            this.newTimeInSeconds.emit(this.timeInSecondsAsNumber.toString());
        }
    }

    customTimeEntered() {
        if (!this.inputVal.errors) {
            this.menuTrigger.closeMenu();
        }
    }

    secondsToLabel(numInSeconds: number) {
        const minute = 60;
        const hour = 60 * 60;
        const day = 60 * 60 * 24;
        if (numInSeconds === null) {
            return '';
        } else if (numInSeconds % day === 0 && numInSeconds !== day) {
            return numInSeconds / day + ' d';
        } else if (numInSeconds % hour === 0) {
            return numInSeconds / hour + ' h';
        } else if (numInSeconds % minute === 0) {
            return numInSeconds / minute + ' min';
        } else {
            return numInSeconds + ' sec';
        }
    }

    labelToSeconds(label: string) {
        let numOfSeconds = 0;
        const minute = 60;
        const hour = 60 * 60;
        const day = 60 * 60 * 24;
        const timeAmountRegEx = /\d+/;
        const timeUnitRegEx = /[a-zA-Z]/;
        const timeAmount = parseInt(label.match(timeAmountRegEx)[0], 10);
        const timeUnit = label.match(timeUnitRegEx)[0].toLowerCase();
        if (timeUnit === 'd') {
            numOfSeconds = timeAmount * day;
        } else if (timeUnit === 'h') {
            numOfSeconds = timeAmount * hour;
        } else if (timeUnit === 'm') {
            numOfSeconds = timeAmount * minute;
        } else {
            // timeUnit === 's'
            numOfSeconds = timeAmount;
        }
        return numOfSeconds;
    }

    forbiddenNameValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = false;

            // check valid regex
            if (!this.regexValidator.test(control.value)) {
                forbidden = true;
            }

            return forbidden
                ? { forbiddenName: { value: control.value } }
                : null;
        };
    }

    minValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = false;

            if (this.labelToSeconds(control.value) < this.minSeconds) {
                forbidden = true;
            }

            return forbidden ? { tooSmall: { value: control.value } } : null;
        };
    }

    maxValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = false;

            if (this.labelToSeconds(control.value) > this.maxSeconds) {
                forbidden = true;
            }

            return forbidden ? { tooLarge: { value: control.value } } : null;
        };
    }

    updateValidators() {
        this.inputVal = new UntypedFormControl(this.inputVal.value, [
            this.forbiddenNameValidator(),
            this.maxValidator(),
            this.minValidator(),
        ]);
    }
}
