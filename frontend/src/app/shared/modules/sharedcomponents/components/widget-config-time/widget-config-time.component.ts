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
import { Component, OnInit, OnDestroy, AfterViewInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TimeRangePickerOptions } from '../../../../modules/date-time-picker/models/models';

import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-time',
    templateUrl: './widget-config-time.component.html',
    styleUrls: [],
    providers: [
        // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
        // `MatMomentDateModule` in your applications root module. We provide it at the component level
        // here, due to limitations of our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ]
})
export class WidgetConfigTimeComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.time-configuration') private _tabClass = true;
    @HostBinding('class.has-columns') private _modifierClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    /** Local Variables */

    /** Form Group */
    widgetConfigTime: FormGroup;

    // subscriptions
    selectedDownsample_Sub: Subscription; // check formcontrol value change to see if it is 'custom'
    widgetConfigTimeSub: Subscription;
    customDownsampleUnitSub: Subscription;

    // form values
    selectedTimePreset: any = '1h';

    customTimeRangeStart: any;
    customTimeRangeEnd: any;

    selectedAggregators: any = ['avg'];
    timeOverTimeNumber: any = '';
    timeOverTimePeriod: any = '';

    selectedDownsample: any = 'auto';
    customDownsampleValue: any = 10;
    customDownsampleUnit: any = 'm';

    minInterval: any = '';
    reportingInterval: any = '';

    overrideRelativeTime: any;
    overrideTime: any = {};
    timeShift: any;
    multipleAggregators = false;

    /** Form control options */
    timePresetOptions: Array<any> = [
        {
            label: '1h',
            value: '1h'
        },
        {
            label: '6h',
            value: '6h'
        },
        {
            label: '12h',
            value: '12h'
        },
        {
            label: '24h',
            value: '24h'
        },
        {
            label: '2d',
            value: '2d'
        },
        {
            label: '4d',
            value: '4d'
        },
        {
            label: '7d',
            value: '7d'
        },
        {
            label: '1m',
            value: '1m'
        },
        {
            label: '3m',
            value: '3m'
        },
        {
            label: '1y',
            value: '1y'
        }
    ];

    timeAggregatorOptions: Array<any> = [
        {
            label: 'Sum',
            value: 'sum'
        },
        {
            label: 'Min',
            value: 'min'
        },
        {
            label: 'Max',
            value: 'max'
        },
        {
            label: 'Avg',
            value: 'avg'
        },
        {
            label: 'Last',
            value: 'last'
        },
        {
            label: 'Count',
            value: 'count'
        }
    ];

    timeDownsampleOptions: Array<any> = [
        {
            label: 'Auto',
            value: 'auto'
        },
        {
            label: '1 min',
            value: '1m'
        },
        {
            label: '5 min',
            value: '5m'
        },
        {
            label: '15 min',
            value: '15m'
        },
        {
            label: '30 min',
            value: '30m'
        },
        {
            label: '1 hr',
            value: '1h'
        },
        {
            label: '1 day',
            value: '1d'
        },
        {
            label: 'custom',
            value: 'custom'
        }
    ];

    timeOverTimeIterationOptions: Array<any> = [
        {
            label: '1',
            value: '1'
        },
        {
            label: '2',
            value: '2'
        },
        {
            label: '3',
            value: '3'
        },
        {
            label: '4',
            value: '4'
        },
        {
            label: '5',
            value: '5'
        },
        {
            label: '6',
            value: '6'
        },
        {
            label: '7',
            value: '7'
        }
    ];

    timeOverTimePeriodOptions: Array<any> = [
        {
            label: 'hours',
            value: 'hours'
        },
        {
            label: 'days',
            value: 'days'
        },
        {
            label: 'weeks',
            value: 'weeks'
        },
        {
            label: '30 days',
            value: '30 days'
        }
    ];

    toggleTimeUnitOptions: Array<any> = [
        {
            label: 'Secs',
            value: 's'
        },
        {
            label: 'Min',
            value: 'm'
        },
        {
            label: 'Hrs',
            value: 'h'
        }
    ];

    options: any = {};
    startTime = '';
    endTime = '';

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.minInterval = this.widget.settings.time.downsample.minInterval || '';
        this.reportingInterval = this.widget.settings.time.downsample.reportingInterval || '';
        this.selectedAggregators = this.widget.settings.time.downsample.aggregators || this.selectedAggregators;
        this.startTime = this.widget.settings.time.overrideTime ? this.widget.settings.time.overrideTime.start : '';
        this.endTime = this.widget.settings.time.overrideTime ? this.widget.settings.time.overrideTime.end : '';
        this.setDefaultOptionsValues();
        this.createForm();

    }

    setDefaultOptionsValues() {
        this.options = new TimeRangePickerOptions();

        this.options.required = false;
        this.options.autoTrigger = true;
        this.options.enableFuture = false;
        this.options.resetValueOnBlur = true;
        this.options.startFutureTimesDisabled = true;
        this.options.endFutureTimesDisabled = true;

        this.options.defaultStartText = '';
        this.options.defaultEndText = '';
        this.options.defaultStartHoursFromNow = 1;
        this.options.defaultEndHoursFromNow = 0;

        this.options.startMaxDateError = 'Future not allowed';
        this.options.endMaxDateError = 'Future not allowed';

        this.options.startMinDateError = 'Must be > 1B seconds after unix epoch';
        this.options.endMinDateError = 'Must be > 1B seconds after unix epoch';

        this.options.startDateFormatError =  'Invalid. Try <span class="code">1h</span> (or <span class="code">6min</span>, ';
        this.options.startDateFormatError += '<span class="code">5d</span>, <span class="code">4w</span>, <span class="code">3mo</span>, ';
        this.options.startDateFormatError += '<span class="code">2qtr</span>, <span class="code">1y</span>, ';
        this.options.startDateFormatError += '<span class="code">08/15/2018</span>).';

        this.options.endDateFormatError =  'Invalid. Try <span class="code">now</span> (or <span class="code">1h</span> ';
        this.options.endDateFormatError += 'or <span class="code">2w</span>).';

        this.options.startTimePlaceholder = '1h (or min,d,w,mo,q,y)';
        this.options.endTimePlaceholder = 'now';

        this.options.startTimeInputBoxName = 'Start Date';
        this.options.endTimeInputBoxName = 'End Date';

        this.options.minMinuteDuration = 2;
    }

    setOverrideTime(e) {
        if ( this.startTime !== e.startTimeDisplay || this.endTime !== e.endTimeDisplay ) {
            this.startTime = e.startTimeDisplay;
            this.endTime = e.endTimeDisplay;
            this.widgetConfigTime.get('overrideTime').setValue({
                start: e.startTimeDisplay,
                end: e.endTimeDisplay
            });
        } else {
            this.widgetChange.emit({'action': 'SetTimeError', payload: { error: false } });
        }
    }

    setTimeError(e) {
        this.widgetChange.emit({'action': 'SetTimeError', payload: { error: true } });
    }

    ngAfterViewInit() {
        // subscribe to value changes to check if 'custom' is checked
        // so we can enable/disable the other custom fields
    }

    ngOnDestroy() {
        // destroy our form control subscription
        this.selectedDownsample_Sub.unsubscribe();
        this.widgetConfigTimeSub.unsubscribe();
        this.customDownsampleUnitSub.unsubscribe();
    }

    get selectedDownsampleValue(): string {
        if (!this.widgetConfigTime) {
            return '';
        } else {
            return this.widgetConfigTime.get('downsample').value;
        }
    }

    createForm() {
        // need to actually add widget config values to form controls
        // NOTE: exception is 'time preset range', which is not a form control, and sets value on click

        // ?INFO: these are mapped to the form variables set at top
        const isCustomDownsample = this.widget.settings.time.downsample.value === 'custom' ? true : false;
        const customUnit = this.widget.settings.time.downsample.customUnit || this.customDownsampleUnit;
        let minInterval = (this.widget.settings.time.minInterval ?  this.widget.settings.time.minInterval : this.minInterval).trim();
        // tslint:disable:max-line-length
        let reportingInterval = ( this.widget.settings.time.reportingInterval ? this.widget.settings.time.reportingInterval : this.reportingInterval).trim();
        minInterval = minInterval.match(/^([0-9]+)(s|m|h)$/);
        reportingInterval = reportingInterval.match(/^([0-9]+)(s|m|h)$/);

        this.widgetConfigTime = this.fb.group({
            aggregators:
                new FormControl(this.selectedAggregators),
            multiple: new FormControl( { value: this.widget.settings.time.downsample.multiple || this.multipleAggregators } ),
            minInterval: new FormControl( minInterval ? minInterval[1] : this.minInterval),
            minIntervalUnit: new FormControl( minInterval ? minInterval[2] : 's'),
            reportingInterval: new FormControl( reportingInterval ? reportingInterval[1] : this.reportingInterval),
            reportingIntervalUnit: new FormControl( reportingInterval ? reportingInterval[2] : 's'),
            overrideRelativeTime:
                new FormControl(this.widget.settings.time.overrideRelativeTime),
            shiftTime:
                new FormControl(this.widget.settings.time.shiftTime),
            'downsample': new FormControl(this.widget.settings.time.downsample.value || this.selectedDownsample),
            'customDownsampleValue':
                    new FormControl(
                        {
                            value: this.widget.settings.time.downsample.customValue || this.customDownsampleValue,
                            disabled: !isCustomDownsample ? true : false
                        },
                        [Validators.min(customUnit === 's' ? 10 : 1), Validators.pattern('^[0-9]+$'), Validators.required ]
                    ),
            'overrideTime' : {
                start: this.startTime,
                end: this.endTime
            },
            'customDownsampleUnit':
                    new FormControl(
                        {
                            value: customUnit,
                            disabled: isCustomDownsample ? false : true
                        }
                    )
        });

            this.selectedDownsample_Sub = this.widgetConfigTime.get('downsample').valueChanges.subscribe(function(data) {
                if (data === 'custom') {
                    this.widgetConfigTime.controls.customDownsampleValue.enable();
                    this.widgetConfigTime.controls.customDownsampleUnit.enable();
                } else {
                    this.widgetConfigTime.controls.customDownsampleValue.disable();
                    this.widgetConfigTime.controls.customDownsampleUnit.disable();
                }
            }.bind(this));

        this.customDownsampleUnitSub = this.widgetConfigTime.controls.customDownsampleUnit.valueChanges
                                        .pipe(
                                            distinctUntilChanged()
                                        )
                                        .subscribe( function(unit) {
                                              this.widgetConfigTime.controls.customDownsampleValue.setValidators([Validators.min(unit === 's' ? 10 : 1), Validators.pattern('^[0-9]+$'), Validators.required ]);
                                              this.widgetConfigTime.controls.customDownsampleValue.updateValueAndValidity();
                                        }.bind(this));
        this.widgetConfigTimeSub = this.widgetConfigTime.valueChanges
                                        .pipe(
                                            distinctUntilChanged()
                                        )
                                        .subscribe( function(data) {
                                            // this.multipleAggregators = this.widgetConfigTime.controls.multiple.value ? true: false;
                                            if ( this.widgetConfigTime.valid ) {
                                                data.minInterval = data.minInterval ? data.minInterval + data.minIntervalUnit : '';
                                                data.reportingInterval = data.reportingInterval ? data.reportingInterval + data.reportingIntervalUnit : '';
                                                delete data.reportingIntervalUnit;
                                                delete data.minIntervalUnit;
                                                if ( !data.overrideTime.start || !data.overrideTime.end ) {
                                                    delete data.overrideTime;
                                                }
                                                this.widgetChange.emit({'action': 'SetTimeConfiguration', payload: { data: data } });
                                            }
                                        }.bind(this));
    }


    setAggregator(e) {
        this.selectedAggregators = Array.isArray(e.value) ? e.value : [e.value];
        this.widgetConfigTime.controls.aggregators.setValue(this.selectedAggregators);
    }

    click_TimePresetChange(val: any) {
        this.selectedTimePreset = val;
    }


}
