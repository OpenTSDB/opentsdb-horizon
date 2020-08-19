import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'aliasmetric'})
export class AliasDisplayPipe implements PipeTransform {
    transform(value: string): string {
        // format is mid:metricname:alias (alias is optional)
        const v = value.split(':');
        return v.length === 3 ? v[2] : v[1];
    }
}
