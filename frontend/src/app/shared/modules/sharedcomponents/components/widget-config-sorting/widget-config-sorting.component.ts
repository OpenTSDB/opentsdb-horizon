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
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import {
    UntypedFormGroup,
    UntypedFormBuilder,
    Validators,
    ValidatorFn,
    AbstractControl,
    UntypedFormControl,
} from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'widget-config-sorting',
    templateUrl: './widget-config-sorting.component.html',
    styleUrls: ['./widget-config-sorting.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WidgetConfigSortingComponent implements OnInit {
    @HostBinding('class.widget-config-sorting') private _hostClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter();

    limitForm: UntypedFormGroup;
    searchField: UntypedFormControl;
    order: string;
    limit: number;
    decimals: number;

    constructor(private formBuilder: UntypedFormBuilder) {}

    ngOnInit() {
        this.limitForm = this.formBuilder.group({
            limitInput: [
                '',
                [
                    Validators.min(1),
                    Validators.max(1000),
                    Validators.required,
                    this.integerValidator(),
                ],
            ],
        });

        if (
            !this.widget.settings.sorting ||
            !this.widget.settings.sorting.order ||
            !this.widget.settings.sorting.limit
        ) {
            this.order = 'top';
            this.limitForm.setValue({ limitInput: 25 });
            this.limit = 25;
            this.widgetChange.emit({
                action: 'SetSorting',
                payload: { order: this.order, limit: this.limit },
            });
        } else {
            this.order = this.widget.settings.sorting.order;
            this.limit = this.widget.settings.sorting.limit;
            this.limitForm.setValue({ limitInput: this.limit });
        }

        this.decimals =
            this.widget.settings.visual.decimals !== undefined
                ? this.widget.settings.visual.decimals
                : 2;
    }

    // convenience getter for easy access to form fields
    get formFields() {
        return this.limitForm.controls;
    }

    limitInputChanged() {
        if (!this.formFields.limitInput.errors) {
            this.limit = this.limitForm.value.limitInput;
            this.widgetChange.emit({
                action: 'SetSorting',
                payload: { order: this.order, limit: this.limit },
            });
        }
    }

    setDecimals(e: Event) {
        const target = <HTMLInputElement>e.target;
        this.widgetChange.emit({
            action: 'UpdateQueryMetricVisual',
            payload: { visual: { decimals: target.value } },
        });
    }

    integerValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = true;
            if (Number.isInteger(control.value)) {
                forbidden = false;
            }
            return forbidden ? { format: { value: control.value } } : null;
        };
    }

    orderChanged(event) {
        this.order = event.value;
        this.widgetChange.emit({
            action: 'SetSorting',
            payload: { order: this.order, limit: this.limit },
        });
    }
}
