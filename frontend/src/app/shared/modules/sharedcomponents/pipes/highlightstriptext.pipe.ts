import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({name: 'highlightstriptext'})
export class HighlightStripTextPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}
    transform(value: string, regexp: string, start: number, len: number ): SafeHtml {
        let more = '';
        if ( start !== undefined && len !== undefined && value.length > len ) {
            more = '<a>...</a>';
            value = value.substr(0, len);
        }
        if ( !regexp ) {
            return value;
        }
        const re = new RegExp( '(' + regexp + ')', 'gi' );
        const value1 = value ? '<span>' + value.replace( re, '<span class="highlight-text">$1</span>') + more + '</span>' : '';
        return this.domSanitizer.bypassSecurityTrustHtml(value1);
    }
}
