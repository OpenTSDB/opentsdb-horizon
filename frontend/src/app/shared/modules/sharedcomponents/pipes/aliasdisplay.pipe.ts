import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'aliasmetric'})
export class AliasDisplayPipe implements PipeTransform {
    transform(value: string): string {
        const v = value.split(':');
        return v.length === 2 ? v[1] : v[0];
    }
}
