import { Component, OnInit, OnDestroy, HostBinding, Input, Output, 
    EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'downsample',
    templateUrl: './downsample.component.html',
    styleUrls: [],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ]
})
export class DownsampleComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('class.time-downsample-component') private _hostClass = true;
    @HostBinding('class.widget-config-tab') private _extendClass = true;
    @HostBinding('class.has-columns') private _modifierClass = true;
    @HostBinding('class.advanced-open') private _advancedClass = false;

    /** Inputs */
    @Input() downsample: any;

    /** Outputs */
    @Output() downsampleChange = new EventEmitter();

    /** Local Variables */

    /** Form Group */
    widgetConfigTime: FormGroup;

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
            value: ''
        },
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
        },
        {
            label: 'custom',
            value: 'custom'
        }
    ];

    constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.selectedAggregators = this.downsample.aggregators || this.selectedAggregators;
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.downsample && this.widgetConfigTime) {
            // we need to update form as soon as it changes
            this.widgetConfigTime.controls.downsample.setValue(changes.downsample.currentValue.value, {emitEvent:false}); 
            this.widgetConfigTime.controls.customDownsampleValue.setValue(changes.downsample.currentValue.customValue, {emitEvent: false});
            this,this.widgetConfigTime.controls.customDownsampleUnit.setValue(changes.downsample.currentValue.customUnit, {emitEvent: false});
            this.selectedAggregators = changes.downsample.currentValue.aggregators;
            this.widgetConfigTime.controls.aggregators.setValue(changes.downsample.currentValue.aggregators, {emitEvent: false});
            this.overrideResolution = changes.downsample.currentValue.value === 'auto' ? false : true;
            this.overrideAggregator = changes.downsample.currentValue.aggregators[0] !== '' ? true : false;
   
            if (this.overrideResolution || this.overrideAggregator) {
                this.openMoreSettings = true;
            } else {
                this.openMoreSettings = false;
            }     
        }
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
        // ?INFO: these are mapped to the form variables set at top
        const isCustomDownsample = this.downsample.value === 'custom' ? true : false;
        const customUnit = this.downsample.customUnit || this.customDownsampleUnit;

        this.widgetConfigTime = this.fb.group({
            aggregators:
                new FormControl(this.selectedAggregators),
            'downsample': new FormControl(this.downsample.value || this.selectedDownsample),
            'customDownsampleValue':
                new FormControl(
                    {
                        value: this.downsample.customValue || this.customDownsampleValue,
                        disabled: !isCustomDownsample ? true : false
                    },
                    [Validators.min(customUnit === 's' ? 10 : 1), Validators.pattern('^[0-9]+$'), Validators.required]
                ),
            'customDownsampleUnit':
                new FormControl(
                    {
                        value: customUnit,
                        disabled: isCustomDownsample ? false : true
                    }
                )
        });

        this.selectedDownsample_Sub = this.widgetConfigTime.get('downsample').valueChanges.subscribe(function (data) {
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
            .subscribe(function (unit) {
                this.widgetConfigTime.controls.customDownsampleValue.setValidators([Validators.min(unit === 's' ? 10 : 1), Validators.pattern('^[0-9]+$'), Validators.required]);
                this.widgetConfigTime.controls.customDownsampleValue.updateValueAndValidity();
            }.bind(this));

        this.widgetConfigTimeSub = this.widgetConfigTime.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100)
            )
            .subscribe(function (data) {
                if (this.widgetConfigTime.valid) {
                    this.downsampleChange.emit({ data });
                }
            }.bind(this));
    }


    setAggregator(e) {
        this.selectedAggregators = [e.value];
        this.widgetConfigTime.controls.aggregators.setValue(this.selectedAggregators);
    }

    changeToggle() {
        this.openMoreSettings = !this.openMoreSettings;
        this._advancedClass = this.openMoreSettings;
    }

    checkOverrideResolution(event: any) {
        this.overrideResolution = event.checked;
        // turn off this with value is auto and we do nothing
        if (!this.overrideResolution && this.widgetConfigTime.get('downsample').value !== 'auto') {
            this.downsample = {...this.downsample, value: 'auto'}
            this.widgetConfigTime.controls.downsample.setValue('auto');         
        }
    }

    checkOverrideAggregator(event: any) {
        this.overrideAggregator = event.checked;
        if (!this.overrideAggregator) {
            // if they do have value then reset and return those
            // widgets which using auto downsample to whatever aggregator they use before
            this.downsample = {...this.downsample, aggregators: [''] };
            if (this.selectedAggregators[0] === '') {
                // use use drop down to set then uncheck, we fire even already
                this.widgetConfigTime.controls.aggregators.setValue(this.selectedAggregators, {emitEvent: false});
            } else {
                this.selectedAggregators = [''];
                this.widgetConfigTime.controls.aggregators.setValue(this.selectedAggregators);
            }
        }
    }
}
