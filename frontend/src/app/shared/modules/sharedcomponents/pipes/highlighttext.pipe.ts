import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({name: 'highlighttext'})
export class HighlightTextPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}
    transform(value: string, regexp: string): SafeHtml {
        if ( !regexp ) {
            return value;
        }
        const re = new RegExp( '(' + regexp + ')', 'gi' );
        const value1 = value ? '<span>' + value.replace( re, '<span class="highlight-text">$1</span>') + '</span>' : '';
        return this.domSanitizer.bypassSecurityTrustHtml(value1);
    }
}
