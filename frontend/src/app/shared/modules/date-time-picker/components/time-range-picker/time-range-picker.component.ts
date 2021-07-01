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
    Component, OnInit, ViewChild, Input, Output, EventEmitter, HostListener, ElementRef, HostBinding, ViewChildren, QueryList
} from '@angular/core';
import { Moment } from 'moment';
import * as momentNs from 'moment';
import { TimeRangePickerOptions, ISelectedTime } from '../../models/models';
import { } from '../time-picker/time-picker.component';
import { DatepickerComponent } from '../date-picker-2/datepicker.component';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import { MatMenuTrigger } from '@angular/material';

const moment = momentNs;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'time-range-picker',
    templateUrl: './time-range-picker.component.html',
    styleUrls: []
})

export class TimeRangePickerComponent implements OnInit {
    @HostBinding('class.dtp-time-range-picker') private _hostClass = true;

    @Input() set startTime(time: string) {
      this._startTime = time;
      this.startTimeReference.date = time;
    }
    get startTime(): string {
      return this._startTime;
    }

    @Input() set endTime(time: string) {
      this._endTime = time;
      this.endTimeReference.date = time;
    }
    get endTime(): string {
      return this._endTime;
    }

    @Input() set timezone(timezone: string) {
      this._timezone = timezone;
    }
    get timezone(): string {
      return this._timezone;
    }
    @Input() downsample: any;
    @Input() tot: any;
    @Input() options: TimeRangePickerOptions;
    @Output() timeSelected = new EventEmitter<ISelectedTime>();
    @Output() cancelSelected = new EventEmitter();
    @Output() dbdownsampleChange = new EventEmitter();
    @Output() dbToTChange = new EventEmitter();
    @Output() onError = new EventEmitter();

    @ViewChild('daytimePickerStart') startTimeReference: DatepickerComponent;
    @ViewChild('daytimePickerEnd') endTimeReference: DatepickerComponent;
    @ViewChild('presetsDiv') presetsDiv: ElementRef;
    @ViewChildren(MatMenuTrigger) triggers: QueryList<MatMenuTrigger>;

    private _startTime: string;
    private _endTime: string;
    private _timezone: string;
    private _downsample: any;

    startTimeSelected: Moment;
    endTimeSelected: Moment;

    startTimeDisplay: string; // for ngmodel
    endTimeDisplay: string;   // for ngmodel
    startRequired = true;
    endRequired = true;

    showApply: boolean;
    presetSelected: Preset;
    presets: Preset[] = [ // tslint:disable:max-line-length
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.year),    buttonName: 'y',   abbr: this.utilsService.timeAbbr.year},
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.quarter), buttonName: 'qtr', abbr: 'qtr'},
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.month),   buttonName: 'mo',  abbr: this.utilsService.timeAbbr.month},
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.week),    buttonName: 'wk',  abbr: 'wk'},
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.day),     buttonName: 'd',   abbr: this.utilsService.timeAbbr.day},
                          {name: this.utilsService.abbrToTime(this.utilsService.timeAbbr.hour),    buttonName: 'h',   abbr: this.utilsService.timeAbbr.hour}
                        ];

    constructor(private utilsService: DateUtilsService) {}

    ngOnInit() {
      this.showApply = false;
      this.startRequired = this.options.required;
      this.endRequired = this.options.required;
    }

    downsampleChange(payload: any) {
      // pass it thru
      this.dbdownsampleChange.emit(payload);
    }

    setToT(payload: any) {
      this.dbToTChange.emit(payload);
    }

    getTimeSelected(): ISelectedTime {
        const time = new ISelectedTime();

        this.startTimeSelected = this.utilsService.timeToMoment(this.startTimeReference.unixTimestamp.toString(), this.timezone);
        this.endTimeSelected = this.utilsService.timeToMoment(this.endTimeReference.unixTimestamp.toString(), this.timezone);

        // default value for invalid time
        if (!this.startTimeSelected) {
            this.startTimeSelected = moment().subtract(this.options.defaultStartHoursFromNow, 'hour');
            this.startTimeReference.date = this.options.defaultStartText;
        }

        // default value for invalid time
        if (!this.endTimeSelected) {
            this.endTimeSelected = moment().subtract(this.options.defaultEndHoursFromNow, 'hour');
            this.endTimeReference.date = this.options.defaultEndText;
        }

        // duration atleast 2 minutes
        const duration: number = moment.duration(this.endTimeSelected.diff(this.startTimeSelected)).asMinutes();
        const minDuration = this.options.minMinuteDuration;
        if (duration < minDuration && duration > 0) {
            this.startTimeSelected = this.startTimeSelected.subtract(minDuration - duration, 'minutes');
        } else if (duration < 0 && duration > -minDuration) {
            this.endTimeSelected = this.endTimeSelected.subtract(minDuration + duration, 'minutes');
        }

        time.startTimeUnix = this.startTimeSelected.unix().toString();
        time.endTimeUnix = this.endTimeSelected.unix().toString();
        time.startTimeDisplay = this.startTimeReference.date;
        time.endTimeDisplay = this.endTimeReference.date;

        return time;
    }

    closeCalendarsAndHideButtons() {
        this.endTimeReference.closeCalendar();
        this.startTimeReference.closeCalendar();
        this.showApply = false;
    }

    applyClicked() {
      if (!this.startTimeReference.dateCntrl.errors && !this.endTimeReference.dateCntrl.errors) {
        this.closeCalendarsAndHideButtons();

        // strips relative time
        if (this.utilsService.relativeTimeToMoment(this.startTimeReference.date)) {
          this.startTimeReference.date = this.utilsService.strippedRelativeTime(this.startTimeReference.date);
        }

        if (this.utilsService.relativeTimeToMoment(this.endTimeReference.date)) {
          this.endTimeReference.date = this.utilsService.strippedRelativeTime(this.endTimeReference.date);
        }

        this.timeSelected.emit(this.getTimeSelected());
      }
      this.closeAllPresets();
    }

    cancelClicked() {
      this.closeCalendarsAndHideButtons();
      this.cancelSelected.emit();
    }

    presetAmountReceived(amount: string) {
      if (amount === 'this') {
        this.startTime = this.presetSelected.name;
      } else {
        this.startTime = amount + this.presetSelected.abbr;
      }
      this.endTime = this.options.defaultEndText || 'now';
      this.togglePreset(this.presetSelected);
      this.applyClicked();
    }

    togglePreset(_preset: Preset) {
      if (_preset === this.presetSelected) {
        this.presetSelected = null;
      } else {
        this.presetSelected = _preset;
      }
    }

    removeSelectedPreset() {
      this.presetSelected = null;
    }

    log(item) {}

    // User Interactions
    startCalendarOpened() {
      this.showApply = true;
    }

    endCalendarOpened() {
      this.showApply = true;
    }

    startClockSelected() {
      this.startTime = this.options.defaultStartText;
    }

    endClockSelected() {
      this.endTime = this.options.defaultEndText;
    }

    startInputFocused() {
      this.showApply = true;
      this.removeSelectedPreset();
      this.closeAllPresets();

    }

    endInputFocused() {
      this.showApply = true;
      this.removeSelectedPreset();
      this.closeAllPresets();
    }

    startDateChanged() {
      if ( this.options.autoTrigger && this.validateDateRange() ) {
          setTimeout(() => { this.applyClicked(); } );
      }
    }

    endDateChanged() {
      if ( this.options.autoTrigger && this.validateDateRange() ) {
        setTimeout(() => { this.applyClicked(); } );
      }
    }

    validateDateRange() {
      let isValid = true;
      if ( !this.options.required && this.startTimeReference.dateCntrl.value === '' && this.endTimeReference.dateCntrl.value === '') {
        this.startRequired = this.endRequired = false;
      }
      if ( this.startTimeReference.dateCntrl.value === '' && this.endTimeReference.dateCntrl.value !== '' ) {
        this.startRequired = true;
        isValid = false;
      }
      if ( this.startTimeReference.dateCntrl.value !== '' && this.endTimeReference.dateCntrl.value === '' ) {
        this.endRequired = true;
        isValid = false;
      }
      if ( !isValid ) {
        this.onError.emit();
      }
      return isValid;
    }

    enterKeyedOnInputBox() {
      this.applyClicked();
    }

    @HostListener('document:click', ['$event'])
    hidePresetsIfClickOutside(event) {
      if (!this.presetsDiv.nativeElement.contains(event.target)) {
        this.presetSelected = null;
      }
    }

    startCalendarClosed() {}

    endCalendarClosed() {}

    closePresets(preset) {
      let index = 0;
      this.triggers.forEach(trigger =>  {
        if (!this.presets || this.presets[index].buttonName !== preset.buttonName) {
          trigger.closeMenu();
        }
        index++;
      });
    }

    closeAllPresets() {
      this.triggers.forEach(trigger =>  {
        trigger.closeMenu();
      });
    }
}

interface Preset {
    name: string;
    buttonName: string;
    abbr: string;
}
