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
