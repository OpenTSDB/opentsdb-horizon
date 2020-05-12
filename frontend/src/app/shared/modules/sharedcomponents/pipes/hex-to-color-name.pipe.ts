import { Pipe, PipeTransform } from '@angular/core';
import { ColorService } from '../../color-picker/services/color.service';

@Pipe({ name: 'hexToColorName' })
export class HexToColorNamePipe implements PipeTransform {
    constructor(private colorService: ColorService) { }

    transform(value: string): string {
        return this.colorService.hexToColorName(value);
    }
}
