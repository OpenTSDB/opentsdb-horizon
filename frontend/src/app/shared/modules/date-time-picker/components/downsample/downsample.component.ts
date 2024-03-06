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
    OnDestroy,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';

import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
    UntypedFormControl,
} from '@angular/forms';

import {
    MAT_MOMENT_DATE_FORMATS,
    MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
} from '@angular/material/core';

import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'downsample',
    templateUrl: './downsample.component.html',
    styleUrls: ['./downsample.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ],
})
export class DownsampleComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('class.time-downsample-component') private _hostClass = true;
    @HostBinding('class.widget-config-tab') private _extendClass = true;
    @HostBinding('class.has-columns') private _modifierClass = true;
    @HostBinding('class.advanced-open') private _advancedClass = false;

    /** Inputs */
    @Input() downsample: any;
    @Input() tot: any;

    /** Outputs */
    @Output() downsampleChange = new EventEmitter();
    @Output() totChange = new EventEmitter();

    /** Local Variables */

    /** Form Group */
    widgetConfigTime: UntypedFormGroup;

    // subscriptions
    selectedDownsample_Sub: Subscription; // check formcontrol value change to see if it is 'custom'
    widgetConfigTimeSub: Subscription;
    customDownsampleUnitSub: Subscription;

    selectedAggregators: any = [''];
    selectedDownsample: any = 'auto';
    customDownsampleValue: any = 10;
    customDownsampleUnit: any = 'm';

    openMoreSettings = false;
    overrideResolution = false;
    overrideAggregator = false;

    timeAggregatorOptions: Array<any> = [
        {
            label: 'Select one',
            value: '',
        },
        {
            label: 'Sum',
            value: 'sum',
        },
        {
            label: 'Min',
            value: 'min',
        },
        {
            label: 'Max',
            value: 'max',
        },
        {
            label: 'Avg',
            value: 'avg',
        },
        {
            label: 'Last',
            value: 'last',
        },
        {
            label: 'Count',
            value: 'count',
        },
    ];

    timeDownsampleOptions: Array<any> = [
        {
            label: 'Auto',
            value: 'auto',
        },
        {
            label: '1 min',
            value: '1m',
        },
        {
            label: '5 min',
            value: '5m',
        },
        {
            label: '15 min',
            value: '15m',
        },
        {
            label: '30 min',
            value: '30m',
        },
        {
            label: '1 hr',
            value: '1h',
        },
        {
            label: '1 day',
            value: '1d',
        },
        {
            label: 'custom',
            value: 'custom',
        },
    ];

    timeOverTimePeriodOptions: Array<any> = [
        {
            label: 'None',
            value: '',
        },
        {
            label: 'Hours',
            value: 'h',
        },
        {
            label: 'Days',
            value: 'd',
        },
        {
            label: 'Weeks',
            value: 'w',
        },
        {
            label: '30 days',
            value: '30d',
        },
    ];
    totPeriod = '';
    totValue = '0';
    constructor(
        private fb: UntypedFormBuilder,
        private cdRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.selectedAggregators =
            this.downsample.aggregators || this.selectedAggregators;
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.downsample && this.widgetConfigTime) {
            // we need to update form as soon as it changes
            this.widgetConfigTime.controls.downsample.setValue(
                changes.downsample.currentValue.value,
                { emitEvent: false },
            );
            // set to prev is they change to custom
            if (changes.downsample.currentValue.value === 'custom') {
                // can be load from save dashboard
                if (
                    changes.downsample.currentValue.customValue !== '' &&
                    changes.downsample.currentValue.customUnit !== ''
                ) {
                    this.widgetConfigTime.controls.customDownsampleValue.setValue(
                        changes.downsample.currentValue.customValue,
                        { emitEvent: false },
                    );
                    this.widgetConfigTime.controls.customDownsampleUnit.setValue(
                        changes.downsample.currentValue.customUnit,
                        { emitEvent: false },
                    );
                } else {
                    this.setCustomDownsample(
                        changes.downsample.previousValue.value,
                    );
                }
            }

            this.selectedAggregators =
                changes.downsample.currentValue.aggregators;
            this.widgetConfigTime.controls.aggregators.setValue(
                changes.downsample.currentValue.aggregators,
                { emitEvent: false },
            );
            this.overrideResolution =
                changes.downsample.currentValue.value === 'auto' ? false : true;
            this.overrideAggregator =
                changes.downsample.currentValue.aggregators[0] !== ''
                    ? true
                    : false;

            if (this.overrideResolution || this.overrideAggregator) {
                this.openMoreSettings = true;
            } else {
                this.openMoreSettings = false;
            }
        }
        if (changes.tot && changes.tot.currentValue) {
            this.tot = changes.tot.currentValue;
            this.totPeriod = this.tot.period || '';
            this.totValue = this.tot.value || '0';
        }
    }

    ngOnDestroy() {
        // destroy our form control subscription
        if (this.selectedDownsample_Sub) {
            this.selectedDownsample_Sub.unsubscribe();
        }
        if (this.widgetConfigTimeSub) {
            this.widgetConfigTimeSub.unsubscribe();
        }
        if (this.customDownsampleUnitSub) {
            this.customDownsampleUnitSub.unsubscribe();
        }
    }

    get selectedDownsampleValue(): string {
        if (!this.widgetConfigTime) {
            return '';
        } else {
            return this.widgetConfigTime.get('downsample').value;
        }
    }

    setCustomDownsample(ds: string = '10m') {
        let customValue: any = ds.slice(0, -1);
        let customUnit = ds.slice(-1);
        if (customUnit === 'd') {
            customValue = customValue * 24;
            customUnit = 'h';
        }
        this.widgetConfigTime.controls.customDownsampleValue.setValue(
            customValue,
            { emitEvent: false },
        );
        this.widgetConfigTime.controls.customDownsampleUnit.setValue(
            customUnit,
            { emitEvent: false },
        );
    }

    createForm() {
        // ?INFO: these are mapped to the form variables set at top
        const isCustomDownsample =
            this.downsample.value === 'custom' ? true : false;
        const customUnit = this.downsample.customUnit;

        this.widgetConfigTime = this.fb.group({
            aggregators: new UntypedFormControl(this.selectedAggregators),
            downsample: new UntypedFormControl(
                this.downsample.value || this.selectedDownsample,
            ),
            customDownsampleValue: new UntypedFormControl(this.downsample.customValue),
            customDownsampleUnit: new UntypedFormControl(customUnit),
        });
        this.customDownsampleUnitSub =
            this.widgetConfigTime.controls.customDownsampleUnit.valueChanges
                .pipe(distinctUntilChanged())
                .subscribe(
                    function (unit) {
                        this.widgetConfigTime.controls.customDownsampleValue.setValidators(
                            [
                                Validators.min(unit === 's' ? 10 : 1),
                                Validators.pattern('^[0-9]+$'),
                                Validators.required,
                            ],
                        );
                        this.widgetConfigTime.controls.customDownsampleValue.updateValueAndValidity();
                    }.bind(this),
                );

        this.widgetConfigTimeSub = this.widgetConfigTime.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(100))
            .subscribe(
                function (data) {
                    // when just switch to custom it is invalid so we need to check
                    if (data.downsample === 'custom') {
                        if (
                            data.customDownsampleValue === '' ||
                            data.customDownsampleUnit === ''
                        ) {
                            this.widgetConfigTime.setErrors({ invalid: true });
                        }
                    }
                    if (this.widgetConfigTime.valid) {
                        this.downsampleChange.emit({ data });
                    }
                }.bind(this),
            );
    }

    setAggregator(e) {
        this.selectedAggregators = [e.value];
        this.widgetConfigTime.controls.aggregators.setValue(
            this.selectedAggregators,
        );
    }

    setDownsample(e) {
        if (e.value === 'custom') {
            // previous value
            if (this.selectedDownsample === 'auto') {
                this.widgetConfigTime.controls.customDownsampleValue.setValue(
                    this.customDownsampleValue,
                );
                this.widgetConfigTime.controls.customDownsampleUnit.setValue(
                    this.customDownsampleUnit,
                );
            } else {
                this.setCustomDownsample(this.selectedDownsample);
            }
        }
        // now set this value
        this.selectedDownsample = e.value;
    }

    changeToggle() {
        this.openMoreSettings = !this.openMoreSettings;
        this._advancedClass = this.openMoreSettings;
    }

    checkOverrideResolution(event: any) {
        this.overrideResolution = event.checked;
        // turn off this with value is auto and we do nothing
        if (
            !this.overrideResolution &&
            this.widgetConfigTime.get('downsample').value !== 'auto'
        ) {
            this.downsample = { ...this.downsample, value: 'auto' };
            this.widgetConfigTime.controls.downsample.setValue('auto');
        }
    }

    checkOverrideAggregator(event: any) {
        this.overrideAggregator = event.checked;
        if (!this.overrideAggregator) {
            // if they do have value then reset and return those
            // widgets which using auto downsample to whatever aggregator they use before
            this.downsample = { ...this.downsample, aggregators: [''] };
            if (this.selectedAggregators[0] === '') {
                // use use drop down to set then uncheck, we fire even already
                this.widgetConfigTime.controls.aggregators.setValue(
                    this.selectedAggregators,
                    { emitEvent: false },
                );
            } else {
                this.selectedAggregators = [''];
                this.widgetConfigTime.controls.aggregators.setValue(
                    this.selectedAggregators,
                );
            }
        }
    }

    setTimeOverTime(key, value) {
        this.tot[key] = value;
        this.totChange.emit(this.tot);
    }
}
