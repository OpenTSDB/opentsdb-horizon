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
import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'dateToRelative',
})
export class DateToRelativePipe implements PipeTransform {
    transform(timestamp: number): string {
        const now = moment().unix(); // current time to seconds
        const value = moment(timestamp).unix(); // timestamp to seconds
        const check = 60 * 60 * 24 * 7; // 1 weeks worth of seconds
        // const check = ((60 * 60) * 24) * 14; // 2 weeks worth of seconds

        if (now - value < check) {
            // if less than a week, return relative time (i.e. 2 days ago)
            return moment(timestamp).fromNow();
        } else {
            // else, return formatted date (i.e. February 14th, 2020)
            return moment(timestamp).format('MMM Do, YYYY');
        }
    }
}
