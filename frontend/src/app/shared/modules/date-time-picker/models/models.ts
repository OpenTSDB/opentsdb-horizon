import { Moment } from 'moment';

export class ISelectedTime {
    startTimeUnix: string;
    endTimeUnix: string;
    startTimeDisplay: string;
    endTimeDisplay: string;
}

export class TimeRangePickerOptions {
    startFutureTimesDisabled: boolean;
    endFutureTimesDisabled: boolean;

    startTimePlaceholder: string;
    endTimePlaceholder: string;
    startTimeInputBoxName: string;
    endTimeInputBoxName: string;

    defaultStartText: string;
    defaultEndText: string;
    defaultStartHoursFromNow: number;
    defaultEndHoursFromNow: number;

    startTime: string;
    endTime: string;
    required?: boolean;
    autoTrigger?: boolean;

    startDateFormatError: string;
    endDateFormatError: string;
    startMaxDateError: string;
    endMaxDateError: string;

    minMinuteDuration: number;

    // Future Use
    startMinDate: Moment;
    endMinDate: Moment;
    startMaxDate: Moment;
    endMaxDate: Moment;
    startMinDateError: string;
    endMinDateError: string;
}
