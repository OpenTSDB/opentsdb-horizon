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
import {Injectable} from '@angular/core';
import * as momentNs from 'moment';
import {Moment, unitOfTime, duration} from 'moment';

const moment = momentNs;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const maxUnixTimestamp: number = 1000000000000; // 11/16/5138
const minUnixTimestamp: number = 1000000000;    // 09/08/2001
const minYear: number = 1970;                   // for relative time
const defaultFormat: string = 'MM/DD/YYYY h:mm A';

enum validDateWithoutTimeFormat {
  'M/D/YY',
  'M/D/YYYY',
  'MM/DD/YY',
  'MM/DD/YYYY',
  'M-D-YY',
  'M-D-YYYY',
  'MM-DD-YY',
  'MM-DD-YYYY',
  'YYYY-MM-DD',
  'YYYYMMDD'
}

@Injectable({
    providedIn: 'root'
  })
export class DateUtilsService {

  // key is valid 'this' time AND keyword for moment to subtract.
  // value is valid abbr for relative-time user-input
  timeAbbr = {
    day : 'd',     // before year so 'y' in 'day' is not years
    year : 'y',
    quarter : 'q',
    month : 'mo',
    week : 'w',
    hour : 'h',
    minute : 'min',
    second: 'sec'  // not 's' so days or hours is not seconds
  };

  abbrToTime (abbr: string): any {
    for (const index in this.timeAbbr) {
      if (this.timeAbbr[index].toString() === abbr.toLowerCase()) {
        return index;
      }
    }
    return;
  }

  timeToTime(inputTime: string): any {
    for (let time in this.timeAbbr) {
        if (this.timeAbbr[time]) {
          time = time.toString();
          if (time === inputTime) {
          return time;
          }
      }
    }
    return;
  }

  isDateValid(date: string, format: string): boolean {
    if (date === '') {
      return true;
    }
    return moment(date, format, true).isValid();
  }

  timestampToTime(timestamp: string, timezone: string, format = defaultFormat): string {
    if (timezone.toLowerCase() === 'utc') {
      return moment.unix(Number(timestamp)).utc().format(format);
    } else {
      return moment.unix(Number(timestamp)).format(format);
    }
  }

  isTimeStampValid(time: string): boolean {
    return ( time &&
             !time.startsWith('-') &&
             Number(time) < maxUnixTimestamp &&
             Number(time) >= minUnixTimestamp &&
             moment.unix(Number(time)).isValid()
            );
  }

  dateWithoutTimeToMoment(time: string, timezone: string): Moment {

    for (const format in validDateWithoutTimeFormat) {
      if (moment(time, format, true).isValid()) {
        if (timezone.toLowerCase() === 'utc') {
          return moment.utc(time, format, true);
        } else {
          return moment(time, format, true);
        }
      }
    }
    return;
  }

  strippedRelativeTime(relativeTime: string): string {
    const timeAmount: number = this.getTimeAmount(relativeTime);
    let timeUnit: string = this.getTimeUnitAbbr(relativeTime.split(timeAmount.toString()).pop());

    // do not strip qtr and wk
    if (relativeTime.includes('qtr') && timeUnit === 'q') {
      timeUnit = 'qtr';
    }

    if (relativeTime.includes('wk') && timeUnit === 'w') {
      timeUnit = 'wk';
    }

    return timeAmount.toString() + timeUnit;
  }

  relativeTimeToMoment(relativeTime: string): Moment {
    const timeAmount: number = this.getTimeAmount(relativeTime);
    const timeUnit: string = this.getTimeUnitAbbr(relativeTime.split(timeAmount.toString()).pop());

    const now: Moment = moment();
    const numYears = now.year() - minYear;
    let _moment;

    // input has no time or amount
    if (!timeUnit || !timeAmount) {
      return;
    }

    // protect moment from abusive numbers
    if ( (timeUnit === this.timeAbbr.year && timeAmount < 1 * numYears)             ||
        (timeUnit === this.timeAbbr.quarter && timeAmount < 4 * numYears)          ||
        (timeUnit === this.timeAbbr.month && timeAmount < 12 * numYears)           ||
        (timeUnit === this.timeAbbr.week && timeAmount < 52 * numYears)            ||
        (timeUnit === this.timeAbbr.day && timeAmount < 365 * numYears)            ||
        (timeUnit === this.timeAbbr.hour && timeAmount < 8760 * numYears)          ||
        (timeUnit === this.timeAbbr.minute && timeAmount < 525600 * numYears)      ||
        (timeUnit === this.timeAbbr.second && timeAmount < 525600 * 60 * numYears)) {

      _moment = now.subtract(timeAmount, this.abbrToTime(timeUnit));
    }
    return _moment;
  }

  isRelativeTime(time) {
    return this.relativeTimeToMoment(time) || this.timeToTime(time) || time.toLowerCase() === 'now';
  }

  getTimeAmount(relativeTime: string): number {
    const number: number = Number(relativeTime.match(/\d+/));
    return number;
  }

  getTimeUnitAbbr(relativeTime: string): string {
    relativeTime = relativeTime.toLowerCase().trim();
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    let timeUnitAbbr: string = '';

    // check if user input contains a valid time unit abbr
    // in-case some browsers do not keep order of map, first check for 'day'
    if (relativeTime.includes(this.timeAbbr.day)) {
      timeUnitAbbr = this.timeAbbr.day;
    } else {
      for (const index in this.timeAbbr) {
        if (relativeTime.includes(this.timeAbbr[index])) {
          timeUnitAbbr = this.timeAbbr[index];
          break;
        }
      }
    }
    return timeUnitAbbr;
  }

  defaultTimeToMoment(time: string, timezone: string): Moment {
    if (moment(time, defaultFormat, true).isValid()) {
      if (timezone.toLowerCase() === 'utc') {
        return moment.utc(time, defaultFormat, true);
      } else {
        return moment(time, defaultFormat, true);
      }
    }
    return;
  }

  timeToMoment(time: string, timezone: string): Moment {
    let _moment: Moment;
    timezone = timezone.toLowerCase();

    if (this.defaultTimeToMoment(time, timezone)) {
      _moment = this.defaultTimeToMoment(time, timezone);
    } else if (time.toLowerCase() === 'now') {
      _moment = moment();
    } else if (this.timeToTime(time)) {  // e.g., this 'quarter'
      if (timezone === 'utc') {
        _moment = moment.utc().startOf(this.timeToTime(time.toLowerCase()));
      } else {
        _moment = moment().startOf(this.timeToTime(time.toLowerCase()));
      }
   } else if ( moment(time, 'YYYYMMDDTHHmmss', true).isValid() ) {
      _moment = timezone.toLowerCase() === 'utc' ? moment.utc(time, 'YYYYMMDDTHHmmss', true) : moment(time, 'YYYYMMDDTHHmmss', true);
    } else if (this.isTimeStampValid(time)) {  // e.g., 1234567890
      _moment = moment.unix(Number(time));
    } else if (this.relativeTimeToMoment(time)) {  // e.g., 1h
      _moment = this.relativeTimeToMoment(time);
    } else if (this.dateWithoutTimeToMoment(time, timezone)) {  // e.g., 05/05/18
      _moment = this.dateWithoutTimeToMoment(time, timezone);
    }
    if (_moment && timezone.toLowerCase() === 'utc') {
      _moment = _moment.utc();
    }
    return _moment;
  }

  getMinUnixTimestamp(): Number {
    return minUnixTimestamp;
  }

}
