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
import {
    Component,
    OnInit,
    HostBinding,
    HostListener,
    Inject,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    Renderer2,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import { EMPTY_COLOR, coerceHexaColor, isValidColor } from '../../color-picker';
import { ColorService } from '../../services/color.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'color-picker-hue-slider',
    templateUrl: './color-picker-hue-slider.component.html',
    styleUrls: ['./color-picker-hue-slider.component.scss']
})
export class ColorPickerHueSliderComponent implements OnInit, AfterViewInit {

    @HostBinding('class.color-picker-hue-slider') private _hostClass = true;

    @Input()
    get selectedColor(): string {
        return this._selectedColor;
    }
    set selectedColor(value: string) {
        this._selectedColor = value || this.emptyColor;
        this.checkHueDifference();
    }
    // tslint:disable-next-line:no-inferrable-types
    private _selectedColor: string = '';

    private baseHsv: any = {};

    @Output() hueChanged: any = new EventEmitter<any>();

    @ViewChild('hueStrip') _hueStrip: ElementRef;
    @ViewChild('hueSlider') _hueSlider: ElementRef;

    sliderLeft: any = 0;

    // tslint:disable-next-line:no-inferrable-types
    private isSliding: boolean = false;

    constructor(
        private cs: ColorService,
        private renderer: Renderer2,
        @Inject(EMPTY_COLOR) private emptyColor: string
    ) { }

    ngOnInit() {
        // calculate the hue angle
        const hsv = this.cs.hexToHsv(this._selectedColor);
        this.baseHsv = hsv;

        const hsEl = this._hueStrip.nativeElement;
        const hsCoords = hsEl.getBoundingClientRect();
        const left = hsv.h * hsCoords.width;

        this.sliderLeft = left;
        this.renderer.setStyle(this._hueSlider.nativeElement, 'left', left + 'px');

        // this.setSliderPosition();
    }

    ngAfterViewInit() {

        const hstripEl = this._hueStrip.nativeElement;
        const hslideEl = this._hueSlider.nativeElement;

        this.renderer.listen(hstripEl, 'mousedown', e => {
            if (!this.isSliding) {
                this.isSliding = true;
                if (!e.target.classList.contains('hue-slider')) {
                    this.sliderLeft = e.offsetX;
                    this.renderer.setStyle(hslideEl, 'left', e.offsetX + 'px');
                    this.changeHueColor(e.offsetX);
                }
            }
        });

        this.renderer.listen(hstripEl, 'mouseup', e => {
            if (this.isSliding) {
                this.isSliding = false;
                if (!e.target.classList.contains('hue-slider')) {
                    this.sliderLeft = e.offsetX;
                    this.renderer.setStyle(hslideEl, 'left', e.offsetX + 'px');
                    this.changeHueColor(e.offsetX);
                }
            }
        });

        this.renderer.listen(hstripEl, 'mousemove', e => {
            if (this.isSliding && !e.target.classList.contains('hue-slider')) {
                this.sliderLeft = e.offsetX;
                this.renderer.setStyle(hslideEl, 'left', e.offsetX + 'px');
                this.changeHueColor(e.offsetX);
            }
        });
    }

    // bubbles up angle to color-picker-selector
    changeHueColor(angle) {
        const hueEl = this._hueStrip.nativeElement.getBoundingClientRect();
        const selectedHsv = this.cs.hexToHsv(this.selectedColor);

        const h = (angle / hueEl.width) * 360; // calculate color hue degree angle
        const s = selectedHsv.s;
        const v = selectedHsv.v;

        // now we have HSV values, calculate rgb
        const rgb = this.cs.hsvToRgb(h, s, v);

        this.hueChanged.emit([rgb.r, rgb.g, rgb.b]);
    }

    checkHueDifference() {
        const hsv = this.cs.hexToHsv(this._selectedColor);
        if (this.baseHsv.h !== hsv.h) {
            // set new base HSV
            this.baseHsv = hsv;

            const hsEl = this._hueStrip.nativeElement;
            const hsCoords = hsEl.getBoundingClientRect();
            const left = hsv.h * hsCoords.width;

            this.sliderLeft = left;
            this.renderer.setStyle(this._hueSlider.nativeElement, 'left', left + 'px');
        }
    }

}
