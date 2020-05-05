import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'dateToRelative'
})
export class DateToRelativePipe implements PipeTransform {

    transform(value: number): string {
        return moment(value).fromNow();
    }
}
