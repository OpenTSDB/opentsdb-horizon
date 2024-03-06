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
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';

@Component({
    selector: 'metric-function',
    templateUrl: './metric-function.component.html',
    styleUrls: ['./metric-function.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MetricFunctionComponent implements OnInit, AfterViewInit {
    @HostBinding('class.metric-function-component') private _hostClass = true;

    @Input() fx: any; // { id: '123', fxCall: 'CounterToRate', val: 'enter val'};
    @Input() metricId: string; // metric that contains these functions
    @Input() errorMessage: string; // OPTIONAL
    @Input() regexValidator: RegExp; // OPTIONAL
    @Input() options: any = {};
    @Input() optionalData: any = {};
    @Output() fxOut = new EventEmitter();
    @Output() fxDel = new EventEmitter();
    inputVal: UntypedFormControl;
    isEdit = false;
    groupBy: any = { aggregator: '', tags: [] };
    tagAggregatorIconMap: any = {
        sum: 'd-value-sum',
        min: 'd-value-minimum',
        max: 'd-value-maximum',
        avg: 'd-value-average',
        count: 'd-value-all',
    };

    // this is to ensure that the input does not have any covered values.
    // makes width expand depending on length of label and value
    // minimum is 200px
    get controlWidth(): number {
        if (this.inputVal && this.inputVal.value) {
            const fxCallLen = this.fx.fxCall.length + 1;
            const fxValLen = this.inputVal.value.length + 1;
            const calcWidth = (fxCallLen + fxValLen) * 8;

            return calcWidth > 200 ? calcWidth : 200;
        }
        return 200;
    }

    @ViewChild(MatFormField, { read: ElementRef })
    private formFieldEl: ElementRef;

    constructor() {}

    ngOnInit() {
        this.isEdit = false;
        // this.isEdit = this.fx.val === '' ? true : false;
        // for now set the default value to rate function
        // we can set default value by fx type later
        if (!this.options.noVal && this.fx.val === '') {
            this.fx.val = '1s';
        }
        if (!this.errorMessage) {
            this.errorMessage = 'Error';
        }
        if (this.options.groupByFx) {
            const arr = this.fx.val.split(',');
            this.groupBy.aggregator = arr[0];
            this.groupBy.tags = arr.slice(1);
        } else {
            this.inputVal = new UntypedFormControl(this.fx.val);
        }
    }

    ngAfterViewInit() {
        // NOTE: this is for the autosizing of the function inputs
        // NOTE: css uses the data-value attribute to correctly size item
        // set the initial data-value
        // needs to live on the .mat-form-field-infix
        // aka, the wrapper around the actual input field
        const formFieldInfix: HTMLElement = this.formFieldEl
            ? this.formFieldEl.nativeElement.querySelector(
                '.mat-form-field-infix',
            )
            : null;
        if (formFieldInfix) {
            formFieldInfix.dataset.value = this.fx.val;
        }
    }

    saveInput() {
        if (!this.inputVal.errors) {
            this.isEdit = false;
            this.fx.val = this.inputVal.value;
            this.fxOut.emit({ metricId: this.metricId, fx: this.fx });
        }
    }

    setGroupBy(type, e) {
        this.groupBy[type] = e;
        const arr = [this.groupBy.aggregator].concat(this.groupBy.tags);
        this.fx.val = arr.join(',');
        this.fxOut.emit({ metricId: this.metricId, fx: this.fx });
    }

    editInput() {
        this.isEdit = true;
        this.updateValidators();
    }

    delFx(funcId: string) {
        this.fxDel.emit({ metricId: this.metricId, funcId });
    }

    getErrorMessage() {
        return this.errorMessage;
    }
    forbiddenNameValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = false;
            if (
                this.regexValidator &&
                !this.regexValidator.test(control.value)
            ) {
                forbidden = true;
            }
            return forbidden
                ? { forbiddenName: { value: control.value } }
                : null;
        };
    }
    updateValidators() {
        this.inputVal = new UntypedFormControl(this.inputVal.value, [
            this.forbiddenNameValidator(),
        ]);
    }
}
