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
import { Component, OnInit, HostBinding, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTooltipComponent } from '../data-tooltip/data-tooltip';

import { TooltipDataService } from '../../services/tooltip-data.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    selector: 'heatmap-data-tooltip',
    templateUrl: './heatmap-data-tooltip.component.html'
})
export class HeatmapDataTooltipComponent extends DataTooltipComponent implements OnInit, OnDestroy {

    @HostBinding('class.heatmap-data-tooltip') private _hostClass = true;

    @ViewChild('tooltipOutput', {read: ElementRef}) public ttOutputEl: ElementRef;

    positionStrategy = 'sticky';

    private utils: UtilsService;

    constructor(
        ttDataSvc: TooltipDataService,
        renderer: Renderer2,
        sanitizer: DomSanitizer,
        _utils: UtilsService
    ) {
        super(
            ttDataSvc,
            renderer,
            sanitizer
        );
        this.utils = _utils;
    }

    ngOnInit() {
        super.ngOnInit();
        super._dataStreamSubscribe((data: any) => {
            const percentage = Math.ceil((100 - data.percentage)) / 100;
            // use pSBC to get matching color value from heatmap opacity color
            // we don't want opacity due to how tooltip color chip works
            // so we take opacity percentage, and lighten the color
            data.color = this.pSBC(percentage, data.color);

            const contrast = this.utils.findContrastColor(data.color);
            data.colorContrast = contrast.hex;
            return data;
        });
    }

    // utility to shade (lighten/darken), blending, linear blending
    // modified to work with angular typescript
    // see: https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
    // TODO: maybe add to utilsService?
    // TODO: very useful for other types of color manipulation (blending,shading, etc)
    pSBC(p: any, c0?: any, c1?: any, l?: any) {
        let r: any,
            g: any,
            b: any,
            P: any,
            f: any,
            t: any,
            h: any;

        let a: any = typeof (c1) === 'string';

        const i = parseInt;
        const m = Math.round;

        if (
            typeof (p) !== 'number' ||
            p < -1 ||
            p > 1 ||
            typeof (c0) !== 'string' ||
            (c0[0] !== 'r' && c0[0] !== '#') ||
            (c1 && !a)
        ) {
            return null;
        }
        const pSBCr = (d) => {
            let n = d.length;
            const x: any = {};
            if (n > 9) {
                [r, g, b, a] = d = d.split(',');
                n = d.length;
                if (n < 3 || n > 4) {
                    return null;
                }
                x.r = i(r[3] === 'a' ? r.slice(5) : r.slice(4));
                x.g = i(g);
                x.b = i(b);
                x.a = a ? parseFloat(a) : -1;
            } else {
                if (n === 8 || n === 6 || n < 4) {
                    return null;
                }
                if (n < 6) {
                    d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
                }
                d = i(d.slice(1), 16);
                if (n === 9 || n === 5) {
                    // tslint:disable-next-line: no-bitwise
                    x.r = d >> 24 & 255;
                    // tslint:disable-next-line: no-bitwise
                    x.g = d >> 16 & 255;
                    // tslint:disable-next-line: no-bitwise
                    x.b = d >> 8 & 255;
                    // tslint:disable-next-line: no-bitwise
                    x.a = m((d & 255) / 0.255) / 1000;
                } else {
                    // tslint:disable-next-line: no-bitwise
                    x.r = d >> 16;
                    // tslint:disable-next-line: no-bitwise
                    x.g = d >> 8 & 255;
                    // tslint:disable-next-line: no-bitwise
                    x.b = d & 255;
                    x.a = -1;
                }
            }
            return x;
        };
        h = c0.length > 9;
        h = a ? c1.length > 9 ? true : c1 === 'c' ? !h : false : h;
        f = pSBCr(c0);
        P = p < 0;
        t = c1 && c1 !== 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
        p = P ? p * -1 : p;
        P = 1 - p;
        if (!f || !t) {
            return null;
        }
        if (l) {
            r = m(P * f.r + p * t.r);
            g = m(P * f.g + p * t.g);
            b = m(P * f.b + p * t.b);
        } else {
            r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5);
            g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5);
            b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
        }
        a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
        if (h) {
            return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
        } else {
            return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
        }
    }

    /* Last */
    ngOnDestroy() {
       super.ngOnDestroy();
    }

}
