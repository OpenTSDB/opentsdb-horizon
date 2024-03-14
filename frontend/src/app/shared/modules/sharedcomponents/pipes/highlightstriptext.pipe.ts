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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlightstriptext' })
export class HighlightStripTextPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}
    transform(
        value: string,
        regexp: string,
        start?: number,
        len?: number,
    ): SafeHtml {
        let more = '';
        if (start !== undefined && len !== undefined && value.length > len) {
            more = '<a>...</a>';
            value = value.substr(0, len);
        }
        if (!regexp) {
            return value;
        }
        const re = new RegExp('(' + regexp + ')', 'gi');
        const value1 = value
            ? '<span>' +
              value.replace(re, '<span class="highlight-text">$1</span>') +
              more +
              '</span>'
            : '';
        return this.domSanitizer.bypassSecurityTrustHtml(value1);
    }
}
