import { Component, OnInit, OnDestroy, AfterViewInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

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

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.minInterval = this.widget.settings.time.downsample.minInterval || '';
        this.reportingInterval = this.widget.settings.time.downsample.reportingInterval || '';
        this.selectedAggregators = this.widget.settings.time.downsample.aggregators || this.selectedAggregators;
        this.createForm();
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
            'customDownsampleUnit':
                    new FormControl(
                        {
                            value: customUnit,
                            disabled: isCustomDownsample ? false : true
                        }
                    )
        });

            this.selectedDownsample_Sub = this.widgetConfigTime.get('downsample').valueChanges.subscribe(function(data) {
                // console.log('SELECTED DOWNSAMPLE CHANGED', data, this);
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
