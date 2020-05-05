import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'dateToRelative'
})
export class DateToRelativePipe implements PipeTransform {

    transform(timestamp: number): string {
        const now = moment().unix(); // current time to seconds
        const value = moment(timestamp).unix(); // timestamp to seconds
        const check = ((60 * 60) * 24) * 7; // 1 weeks worth of seconds
        // const check = ((60 * 60) * 24) * 14; // 2 weeks worth of seconds

        if ((now - value) < check) {
            // if less than a week, return relative time (i.e. 2 days ago)
            return moment(timestamp).fromNow();
        } else {
            // else, return formatted date (i.e. February 14th, 2020)
            return moment(timestamp).format('MMMM Do, YYYY');
        }

    }
}
