import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'formatAutoManualFilter' })
export class FormatAutoManualFilterPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}
    transform(values: string[], tplVars: any[]): SafeHtml {
        const regexVars = /^!?\[.*\]$/;
        let retVals = [];
        for (let i = 0; i < values.length; i++) {
            let val = values[i];
            if (regexVars.test(val)) {
                const valToCheck = val.replace('!','');
                const idx = tplVars.findIndex(f => f.mode === 'auto' && '[' + f.alias + ']' === valToCheck)
                if (idx > -1) {
                    retVals.push('<span class="automode auto-mode">' + val + '</span>');
                } else {
                    retVals.push('<span class="automode manual-mode">' + val + '</span>');
                }
            } else {
                retVals.push('<span>' + val + '</span>');
            }
        }
        const htmlStr = retVals.join(', ');
        return this.domSanitizer.bypassSecurityTrustHtml(htmlStr);
    }
}
