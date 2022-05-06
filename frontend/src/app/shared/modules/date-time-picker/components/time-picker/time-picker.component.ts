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
    Component, OnInit, OnChanges, OnDestroy, ViewChild, Input, Output,
    EventEmitter, AfterViewChecked,
    ChangeDetectorRef, HostBinding, SimpleChanges, HostListener, ViewEncapsulation
} from '@angular/core';
import { TimeRangePickerComponent } from '../time-range-picker/time-range-picker.component';
import { TimeRangePickerOptions, ISelectedTime } from '../../models/models';
import { MatMenuTrigger, MenuPositionX } from '@angular/material/menu';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { Subscription, Observable, interval, BehaviorSubject } from 'rxjs';
import { take, withLatestFrom, filter } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'time-picker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class TimePickerComponent implements AfterViewChecked, OnInit, OnChanges, OnDestroy {
    @HostBinding('class.dtp-time-picker') private _hostClass = true;

    /** View childs */
    @ViewChild(TimeRangePickerComponent, { static: true }) timeRangePicker: TimeRangePickerComponent;

    // trigger for opening the menu
    @ViewChild('timerangePickerMenuTrigger', { read: MatMenuTrigger, static: true }) trigger: MatMenuTrigger;

    get timerangePickerMenuIsOpen(): boolean {
        if (this.trigger) {
            return this.trigger.menuOpen;
        }
        return false;
    }

    /** Inputs */
    private _startTime: string;
    private _endTime: string;
    private _timezone: string;
    private _refresh: any;
    private _downsample: any;

    @Input() xPosition: MenuPositionX = 'before';
    @Input() isEditMode = false;

    @Input()
    set startTime(value: string) {
        this._startTime = value;
        this.updateToolTips();
    }
    get startTime(): string {
        return this._startTime;
    }

    @Input()
    set endTime(value: string) {
        this._endTime = value;
        this.updateToolTips();
    }
    get endTime(): string {
        return this._endTime;
    }

    @Input()
    set timezone(value: string) {
        this._timezone = value;
        this.updateToolTips();
    }
    get timezone(): string {
        return this._timezone;
    }

    @Input()
    set refresh(value: any) {
        this._refresh = value;
    }
    get refresh(): any {
        return this._refresh;
    }

    @Input() config: any = {'enableSync': true, 'enableRefresh': true};

    @Input()
    set downsample(ds: any) {
        this._downsample = ds;
        this.downsampleDisplay = '';
        if ( ds ) {
            const value = (ds.value === 'custom' ? ds.customValue + ds.customUnit : ds.value);
            const agg = ds.aggregators[0];
            if (agg !== '') {
                this.downsampleDisplay = ' | ' + value + '-' + agg;
            } else {
                if (value !== 'auto') {
                    this.downsampleDisplay = ' | ' + value
                }
            }
        }
    }
    get downsample(): any {
        return this._downsample;
    }

    @Input() tot: any = {};


    /** Outputs */
    @Output() newChange = new EventEmitter();
    @Output() autoRefreshFlagChanged = new EventEmitter();

    /** Variables */

    // Tooltips
    startTimeToolTip: string;
    endTimeToolTip: string;

    get tooltipText(): string {
        return this.startTimeToolTip + ' to ' + this.endTimeToolTip;
    }
    isInitialized = false;

    // start time


    options: TimeRangePickerOptions;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    // _isOpen: boolean = false;
    refreshSubcription: Subscription;
    paused$ = new BehaviorSubject<boolean>(false);
    secondsRemaining: number;
    downsampleDisplay = '';

    constructor(private cdRef: ChangeDetectorRef, private utilsService: DateUtilsService) { }

    ngOnInit() {
        if (!this.options) {
            this.setDefaultOptionsValues();
        }
        if (this.startTime === undefined || this.startTime.length === 0) {
            this.startTime = '1h';
        }
        if (this.endTime === undefined || this.endTime.length === 0) {
            this.endTime = 'now';
        }
        this.isInitialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if ( changes.refresh !== undefined ) {
            const refresh = changes.refresh.currentValue;
            if ( refresh && refresh.duration ) {
                this.subscribeToAutoRefresh(refresh.duration);
            } else if ( this.refreshSubcription ) {
                this.refreshSubcription.unsubscribe();
            }
        }
        if ( this.refresh && this.refresh.duration && (changes.startTime !== undefined || changes.endTime !== undefined) ) {
            this.subscribeToAutoRefresh(this.isRelativeTime() ? this.refresh.duration : 0);
        }
        if ( changes.isEditMode !== undefined ) {
            this.paused$.next(changes.isEditMode.currentValue);
        }
    }

    subscribeToAutoRefresh(seconds) {
        this.secondsRemaining = seconds;
        // cancels already running subscription
        if ( this.refreshSubcription ) {
            this.refreshSubcription.unsubscribe();
        }
        this.refreshSubcription = interval(1000)
                                    .pipe(
                                        withLatestFrom(this.paused$),
                                        filter(([v, paused]) => !paused),
                                        take(seconds)
                                    )
                                    .subscribe(
                                            () => {
                                                this.secondsRemaining--;
                                            },
                                            err => {
                                            },
                                            () => {
                                                this.secondsRemaining = 0;
                                                this.setRefresh(true);
                                    });
    }

    setDefaultOptionsValues() {
        this.options = new TimeRangePickerOptions();

        this.options.required = true;
        this.options.autoTrigger = false;
        this.options.startFutureTimesDisabled = true;
        this.options.endFutureTimesDisabled = true;

        this.options.defaultStartText = '1h';
        this.options.defaultEndText = 'now';
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

    ngAfterViewChecked() {
        if (!this.startTimeToolTip && !this.endTimeToolTip) {
            this.updateToolTips();
        }
        this.cdRef.detectChanges();
    }

    timeReceived(selectedTime: ISelectedTime) {
        this.startTime = selectedTime.startTimeDisplay;
        this.endTime = selectedTime.endTimeDisplay;
        this.newChange.emit( { action: 'SetDateRange', payload: { newTime: selectedTime} } );

        // close mat-menu
        this.trigger.closeMenu();
    }

    downsampleChange(payload: any) {
        this.newChange.emit({ action: 'SetDBDownsample', payload: payload.data });
    }

    totChange(payload: any) {
        this.newChange.emit({ action: 'SetToT', payload: payload });
    }

    closeTimeRangePicker() {
        this.timeRangePicker.startTimeReference.shouldUpdateTimestamp = false;
        this.timeRangePicker.endTimeReference.shouldUpdateTimestamp = false;
        this.timeRangePicker.startTimeReference.date = this.startTime;
        this.timeRangePicker.endTimeReference.date = this.endTime;

        this.timeRangePicker.startTimeReference.closeCalendar();
        this.timeRangePicker.endTimeReference.closeCalendar();
    }

    triggerAndCloseTimeRangePicker() {
        this.closeTimeRangePicker();
        this.trigger.closeMenu();
    }

    isRelativeTime() {
        return this.utilsService.relativeTimeToMoment(this.startTime) || this.utilsService.relativeTimeToMoment(this.endTime);
    }

    setRefresh(refreshOnRelativeOnly= false) {
        if ( !refreshOnRelativeOnly ||
            this.startTime.toLowerCase() === 'now' ||
            this.endTime.toLowerCase() === 'now' ||
            this.utilsService.relativeTimeToMoment(this.startTime) ||
            this.utilsService.relativeTimeToMoment(this.endTime) ) {
                this.newChange.emit( { action: 'RefreshDashboard', payload: {} });
        }
        if ( this.refresh && this.refresh.duration && this.isRelativeTime()) {
            this.subscribeToAutoRefresh(this.refresh.duration);
        }
        this.updateToolTips();
    }

    setAutoRefresh(duration, event) {
        if (event.target.classList.contains('refresh-text')) {
            event.stopPropagation();
            return;
        }

        if ( !this.isEditMode ) {
            this.newChange.emit( { action: 'SetAutoRefreshConfig', payload: { auto: duration ? 1 : 0,  duration: duration} } );
        }
    }

    updateToolTips() {
        if (this.timezone) {
            if (this.startTime) {
                const sTime = this.utilsService.timeToMoment(this.startTime, this.timezone).unix().toString();
                this.startTimeToolTip = this.utilsService.timestampToTime(sTime, this.timezone);
            }
            if (this.endTime) {
                const eTime = this.utilsService.timeToMoment(this.endTime, this.timezone).unix().toString();
                this.endTimeToolTip = this.utilsService.timestampToTime(eTime, this.timezone);
            }
        }
    }

    @HostListener('document:visibilitychange', ['$event'])
    onVisibilitychange(e) {
        if (document.hidden) {
            this.paused$.next(true);
          } else {
            this.paused$.next(this.isEditMode);
        }
    }

    ngOnDestroy() {
        this.paused$.complete();
        if ( this.refreshSubcription ) {
            this.refreshSubcription.unsubscribe();
        }
    }
}
