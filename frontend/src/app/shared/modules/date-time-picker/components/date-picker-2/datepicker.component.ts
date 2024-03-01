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
    EventEmitter,
    Input,
    OnInit,
    OnChanges,
    Output,
    ElementRef,
    ViewChild,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';
import {
    FormBuilder,
    ValidatorFn,
    AbstractControl,
    FormControl,
} from '@angular/forms';
import { HostBinding } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'datepicker2',
    templateUrl: 'datepicker.component.html',
    styleUrls: ['datepicker.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DatepickerComponent implements OnInit, OnChanges {
    /* eslint-disable @typescript-eslint/no-inferrable-types */
    /* eslint-disable @angular-eslint/no-output-on-prefix */
    @Input()
    set date(value: string) {
        this._date = value.trim();
        this.setInternalTimestamps();
    }
    get date(): string {
        return this._date;
    }

    @Input()
    set timezone(value: string) {
        this._timezone = value.trim();
        this.setInternalTimestamps();
    }
    get timezone(): string {
        return this._timezone;
    }

    @Input() minDateError: string;
    @Input() maxDateError: string;
    @Input() formatError: string;
    @Input() placeholder: string;
    @Input() inputBoxName: string;
    @Input() required = true;
    @Input() options: any = { enableFuture: false };

    @Output() dateChange = new EventEmitter<string>();
    @Output() openDatePicker = new EventEmitter<void>();
    @Output() closeDatePicker = new EventEmitter<void>();
    @Output() onChange = new EventEmitter<any>();
    @Output() onFocus = new EventEmitter<void>();
    @Output() onEnter = new EventEmitter<void>();

    @HostBinding('class.date-picker-component') private _hostClass = true;

    unixTimestamp: number;
    tempUnixTimestamp: number; // for cycling through months
    isDateValid: boolean = true;
    isInitialized: boolean = false;
    showCalendar = false;
    _timezone: string;
    _date: string;
    weeks: any[] = [];
    dayNames: any[];
    monthNames: any[];
    calendarTitle: string;
    monthCalendarTitle: string;
    calendarPosition = 'angular-utc-datepicker_below';
    calendarTitleFormat: string = 'MMMM YYYY';
    dateFormat = 'YYYY-MM-DD';
    displayDayCalendar: boolean = true;
    dateCntrl: FormControl;
    submitted = false;
    shouldUpdateTimestamp: boolean = true;
    calendarButtonEntered = false;

    @ViewChild('dateInput', { static: true }) el: ElementRef;

    constructor(
        private utilsService: DateUtilsService,
        private formBuilder: FormBuilder,
    ) {
        this.dayNames = [];
        this.monthNames = [];
    }

    ngOnInit() {
        if (this.dayNames.length === 0) {
            this.generateDayNames();
        }

        this.isInitialized = true;
        this.setInternalTimestamps();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes.required &&
            changes.required.previousValue !== undefined &&
            changes.required.currentValue !== undefined
        ) {
            this.dateCntrl.setErrors(null);
            this.dateCntrl.updateValueAndValidity();
        }
    }

    setInternalTimestamps() {
        if (this.isInitialized && this.timezone) {
            this.unixTimestamp = this.utilsService
                .timeToMoment(this.date ? this.date : 'now', this.timezone)
                .unix();
            this.tempUnixTimestamp = this.unixTimestamp;
            this.monthCalendarTitle = this.utilsService
                .timeToMoment(this.tempUnixTimestamp.toString(), this.timezone)
                .year()
                .toString();
            this.dateCntrl = new FormControl(this.date, [
                this.formatValidator(),
                this.maxDateValidator(),
                this.minDateValidator(),
            ]);
        }
    }

    dateInputChanged() {
        if (this.dateCntrl.valid) {
            this.date = this.dateCntrl.value;
        }
        this.onChange.emit();
    }

    validate() {
        // if optional set to old value, if not valid (on blur)
        if (
            !this.dateCntrl.valid &&
            this.dateCntrl.value &&
            this.options.resetValueOnBlur
        ) {
            this.dateCntrl.setValue(this.date);
        }
    }
    generateDayNames = () => {
        const date = moment('2017-04-02'); // sunday
        for (let i = 0; i < 7; i++) {
            this.dayNames.push(date.format('dd'));
            date.add('1', 'd');
        }
    };

    openCalendar = (event: any) => {
        this.showCalendar = true;
        const date = this.date ? this.date : 'now';
        if (this.utilsService.timeToMoment(date, this.timezone)) {
            this.generateCalendar(
                this.utilsService
                    .timeToMoment(date, this.timezone)
                    .format(this.dateFormat),
            );
        }
        this.openDatePicker.emit();
    };

    closeCalendar = () => {
        this.showCalendar = false;
        this.closeDatePicker.emit();
    };

    toggleCalendar() {
        if (this.showCalendar) {
            this.closeCalendar();
        } else {
            this.openCalendar(null);
        }
    }

    toggleDisplay() {
        if (!this.displayDayCalendar) {
            // toggling to month view
            // eslint-disable-next-line max-len
            const diff: number =
                Number(this.monthCalendarTitle) -
                this.utilsService
                    .timeToMoment(
                        this.tempUnixTimestamp.toString(),
                        this.timezone,
                    )
                    .year();
            // eslint-disable-next-line max-len
            const tempUnix: number = this.utilsService
                .timeToMoment(this.tempUnixTimestamp.toString(), this.timezone)
                .add(Number(diff), 'year')
                .unix();
            const tempMoment: Moment = this.utilsService.timeToMoment(
                tempUnix.toString(),
                this.timezone,
            );

            if (tempMoment) {
                this.tempUnixTimestamp = tempMoment.unix();
                this.generateCalendar(tempMoment.format(this.dateFormat));
            }
        } else {
            // toggling to year calendar
            this.generateYearCalendar(
                this.utilsService.timeToMoment(
                    this.tempUnixTimestamp.toString(),
                    this.timezone,
                ),
            );
        }
        this.displayDayCalendar = !this.displayDayCalendar;
    }

    keydown = (event: any) => {
        if (event.keyCode === 27) {
            // escape key
            this.closeCalendar();
        }
    };

    enterKeyed() {
        if (this.calendarButtonEntered) {
            this.calendarButtonEntered = false;
        } else {
            this.onEnter.emit();
        }
    }

    enterKeyedOnCalendarButton(event) {
        if (event.keyCode === 13) {
            // enter
            this.calendarButtonEntered = true;
        }
    }

    inputFocused() {
        this.onFocus.emit();
    }

    /* GENERATE CALENDAR */
    // INPUT: 2018-09-20
    generateCalendar = (dateAsString: string) => {
        const date: Moment = moment(dateAsString, this.dateFormat);
        this.calendarTitle = date.format(this.calendarTitleFormat);
        const now: number = Number(this.getNow().format('YYYYMMDD'));
        const selected: number = Number(
            this.utilsService
                .timeToMoment(this.unixTimestamp.toString(), this.timezone)
                .format('YYYYMMDD'),
        );
        this.weeks = [];
        for (let i = 0; i < 7; i++) {
            this.weeks[i] = [];
        }

        const lastMonth = moment(date).subtract(1, 'M'),
            nextMonth = moment(date).add(1, 'M'),
            month = moment(date).month() + 1,
            year = moment(date).year(),
            firstWeekDay = 1 - moment(date).startOf('M').isoWeekday(),
            totalDays = 42 + firstWeekDay - 1; // 7 columns X 6 rows

        let week: number = 0;
        let col: number = 0;

        for (let i = firstWeekDay; i <= totalDays; i++) {
            let _moment: Moment;
            if (i > 0 && i <= moment(date).endOf('M').date()) {
                _moment = moment(
                    year.toString() +
                        '-' +
                        month.toString() +
                        '-' +
                        i.toString(),
                    'YYYY-M-D',
                );
                // current month
                this.weeks[week.toString()].push({
                    day: i,
                    month: month,
                    year: year,
                    isFuture: Number(_moment.format('YYYYMMDD')) > now,
                    isToday: Number(_moment.format('YYYYMMDD')) === now,
                    enabled:
                        // eslint-disable-next-line max-len
                        this.options.enableFuture ||
                        (Number(_moment.format('YYYYMMDD')) <= now &&
                            Number(_moment.format('YYYYMMDD')) > 20010909),
                    selected:
                        Number(_moment.format('YYYYMMDD')) === selected &&
                        this.isDateValid,
                    currentMonth: true,
                });
            } else if (i > moment(date).endOf('M').date()) {
                // next month
                // eslint-disable-next-line max-len
                _moment = moment(
                    nextMonth.year().toString() +
                        '-' +
                        (nextMonth.month() + 1).toString() +
                        '-' +
                        (i - date.endOf('M').date()).toString(),
                    'YYYY-M-D',
                );
                this.weeks[week.toString()].push({
                    day: i - date.endOf('M').date(),
                    month: nextMonth.month() + 1,
                    year: nextMonth.year(),
                    isFuture: Number(_moment.format('YYYYMMDD')) > now,
                    isToday: Number(_moment.format('YYYYMMDD')) === now,
                    enabled: false,
                    selected: false,
                    currentMonth: false,
                });
            } else {
                // last month
                // eslint-disable-next-line max-len
                _moment = moment(
                    lastMonth.year().toString() +
                        '-' +
                        (lastMonth.month() + 1).toString() +
                        '-' +
                        (lastMonth.endOf('M').date() - (0 - i)).toString(),
                    'YYYY-M-D',
                );
                this.weeks[week.toString()].push({
                    day: lastMonth.endOf('M').date() - (0 - i),
                    month: lastMonth.month() + 1,
                    year: lastMonth.year(),
                    isFuture: Number(_moment.format('YYYYMMDD')) > now,
                    isToday: Number(_moment.format('YYYYMMDD')) === now,
                    enabled: false,
                    selected: false,
                    currentMonth: false,
                });
            }

            // after 7 days, create a new week
            if (col === 6) {
                week++;
                col = 0;
            } else {
                col++;
            }
        }
    };

    generateYearCalendar(_moment: Moment) {
        const startOfYear = moment(_moment.format('YYYY'), 'YYYY');
        const now: number = Number(this.getNow().format('YYYYMM'));
        this.monthCalendarTitle = _moment.year().toString();

        for (let i = 0; i < 3; i++) {
            this.monthNames[i] = [];
        }
        let row: number = 0;

        for (let i = 0; i < 12; i++) {
            this.monthNames[row.toString()].push({
                text: startOfYear.format('MMMM'),
                isCurrentMonth: now === Number(startOfYear.format('YYYYMM')),
                isDisabled:
                    Number(startOfYear.format('YYYYMM')) > now ||
                    Number(startOfYear.format('YYYYMM')) < 200110,
                // eslint-disable-next-line max-len
                isSelected:
                    Number(
                        this.utilsService
                            .timeToMoment(
                                this.unixTimestamp.toString(),
                                this.timezone,
                            )
                            .format('YYYYMM'),
                    ) === Number(startOfYear.format('YYYYMM')),
            });

            startOfYear.add('1', 'M');
            if (this.monthNames[row.toString()].length === 4) {
                row++;
            }
        }
    }

    formatValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden: boolean = true;
            const v = control.value.trim();
            if (
                (!this.required && !v) ||
                this.utilsService.timeToMoment(v, this.timezone)
            ) {
                forbidden = false;
            }
            return forbidden ? { format: { value: v } } : null;
        };
    }

    maxDateValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden: boolean = false;
            const _moment: Moment = this.utilsService.timeToMoment(
                control.value,
                this.timezone,
            );
            if (
                !this.options.enableFuture &&
                _moment &&
                _moment.unix() > this.getNow().unix()
            ) {
                forbidden = true;
            }
            return forbidden ? { maxDate: { value: control.value } } : null;
        };
    }

    minDateValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden: boolean = false;
            const _moment: Moment = this.utilsService.timeToMoment(
                control.value,
                this.timezone,
            );
            if (
                _moment &&
                _moment.unix() < this.utilsService.getMinUnixTimestamp()
            ) {
                forbidden = true;
            }
            return forbidden ? { minDate: { value: control.value } } : null;
        };
    }

    getNow(): Moment {
        if (this.timezone.toLowerCase() === 'utc') {
            return moment.utc().add(10, 'seconds');
        } else {
            return moment().add(10, 'seconds');
        }
    }

    prev(): void {
        if (this.displayDayCalendar) {
            // month
            // eslint-disable-next-line max-len
            const tempDate: Moment = this.utilsService.timeToMoment(
                moment
                    .unix(Number(this.tempUnixTimestamp))
                    .subtract(1, 'M')
                    .unix()
                    .toString(),
                this.timezone,
            );
            if (tempDate) {
                this.tempUnixTimestamp = tempDate.unix();
                this.generateCalendar(tempDate.format(this.dateFormat));
            }
        } else {
            // year
            // eslint-disable-next-line max-len
            const tempDate: Moment = this.utilsService.timeToMoment(
                moment
                    .unix(Number(this.tempUnixTimestamp))
                    .subtract(1, 'year')
                    .unix()
                    .toString(),
                this.timezone,
            );
            if (tempDate) {
                this.generateYearCalendar(tempDate);
                this.tempUnixTimestamp = tempDate.unix();
            }
        }
    }

    next(): void {
        if (this.displayDayCalendar) {
            // month
            // eslint-disable-next-line max-len
            const tempDate: Moment = this.utilsService.timeToMoment(
                moment
                    .unix(Number(this.tempUnixTimestamp))
                    .add(1, 'M')
                    .unix()
                    .toString(),
                this.timezone,
            );

            if (tempDate) {
                this.tempUnixTimestamp = tempDate.unix();
                this.generateCalendar(tempDate.format(this.dateFormat));
            }
        } else {
            // year
            // eslint-disable-next-line max-len
            const tempDate: Moment = this.utilsService.timeToMoment(
                moment
                    .unix(Number(this.tempUnixTimestamp))
                    .add(1, 'year')
                    .unix()
                    .toString(),
                this.timezone,
            );
            if (tempDate) {
                this.generateYearCalendar(tempDate);
                this.tempUnixTimestamp = tempDate.unix();
            }
        }
    }

    selectDate = (date: any) => {
        let selectedDate: Moment;
        const currDate = this.utilsService.timeToMoment(
            this.unixTimestamp.toString(),
            this.timezone,
        );

        if (this.timezone.toLowerCase() === 'utc') {
            selectedDate = moment.utc(
                `${date.year}-${date.month}-${date.day} ${currDate.hour()}:${currDate.minute()}:
                ${currDate.second()}`,
                'YYYY-M-D HH:mm:ss',
            );
        } else {
            selectedDate = moment(
                `${date.year}-${date.month}-${date.day} ${currDate.hour()}:${currDate.minute()}:
                ${currDate.second()}`,
                'YYYY-M-D HH:mm:ss',
            );
        }

        this.date = this.utilsService.timestampToTime(
            selectedDate.unix().toString(),
            this.timezone,
        );
        this.unixTimestamp = selectedDate.unix();
        this.isDateValid = true;
        this.generateCalendar(selectedDate.format(this.dateFormat));
        this.closeCalendar();
        this.onChange.emit();
    };

    monthSelected(monthIndex: number): void {
        // 0 represents Jan
        // eslint-disable-next-line max-len
        const monthMoment = moment(
            this.monthCalendarTitle.toString() +
                '-' +
                (monthIndex + 1).toString() +
                '-' +
                '1'.toString(),
            'YYYY-M-D',
        );
        this.toggleDisplay();
        this.tempUnixTimestamp = monthMoment.unix();
        this.generateCalendar(monthMoment.format(this.dateFormat));
    }

    getAbsoluteTimeFromMoment(mom: Moment): string {
        return this.utilsService.timestampToTime(
            mom.unix().toString(),
            this.timezone,
        );
    }
}
