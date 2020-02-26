import {
    Component,
    OnInit,
    HostBinding,
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
    selector: 'color-picker-hsv-selector',
    templateUrl: './color-picker-hsv-selector.component.html',
    styleUrls: ['./color-picker-hsv-selector.component.scss']
})
export class ColorPickerHsvSelectorComponent implements OnInit, AfterViewInit {

    @HostBinding('class.color-picker-hsv-selector') private _hostClass = true;

    @ViewChild('colorBlock') _colorBlock: ElementRef;
    @ViewChild('colorPicker') _colorPicker: ElementRef;

    @Input()
    get selectedColor(): string {
        return this._selectedColor;
    }
    set selectedColor(value: string) {
        this._selectedColor = value || this.emptyColor;
        this.checkBaseColorDifference();
    }
    // tslint:disable-next-line:no-inferrable-types
    private _selectedColor: string = '';

    @Output() colorChanged: any = new EventEmitter<any>();

    // tslint:disable-next-line:no-inferrable-types
    baseColor: string = '#000000';
    baseHsv: any = {};

    // tslint:disable-next-line:no-inferrable-types
    isDragging: boolean = false;

    constructor(
        private cs: ColorService,
        private renderer: Renderer2,
        @Inject(EMPTY_COLOR) private emptyColor: string
    ) { }

    ngOnInit() {

        // calculate base color from selected color
        const hsv = this.cs.hexToHsv(this.selectedColor);
        const baseRgb  = this.cs.hsvToRgb(hsv.h, 1, 1);

        this.baseColor = this.cs.rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b);
        this.baseHsv = this.cs.hexToHsv(this.baseColor);

        this.setPickerPosition((hsv.s * 100), (hsv.v * 100));
    }

    ngAfterViewInit() {

        // events setup
        const bEl = this._colorBlock.nativeElement;
        const bCoords = bEl.getBoundingClientRect();

        this.renderer.listen(bEl, 'mousedown', e => {
            if (!this.isDragging) {
                // console.log('MOUSE DOWN', e);
                this.isDragging = true;
                if (!e.target.classList.contains('picker')) {
                    const leftVal = e.offsetX / bCoords.width;
                    const bottomVal = ( bCoords.height - e.offsetY ) / bCoords.height;

                    this.setPickerPosition(leftVal * 100, bottomVal * 100);
                    this.prepareColorChange(leftVal, bottomVal);
                }
            }
        });

        this.renderer.listen(bEl, 'mouseup', e => {
            if (this.isDragging) {
                // console.log('MOUSEUP', e);
                this.isDragging = false;
                if (!e.target.classList.contains('picker')) {
                    const leftVal = e.offsetX / bCoords.width;
                    const bottomVal = ( bCoords.height - e.offsetY ) / bCoords.height;

                    this.setPickerPosition(leftVal * 100, bottomVal * 100);
                    this.prepareColorChange(leftVal, bottomVal);
                }
            }
        });

        this.renderer.listen(bEl, 'mousemove', e => {
            if (this.isDragging && !e.target.classList.contains('picker')) {

                const leftVal = e.offsetX / bCoords.width;
                const bottomVal = ( bCoords.height - e.offsetY ) / bCoords.height;

                this.setPickerPosition(leftVal * 100, bottomVal * 100);
                this.prepareColorChange(leftVal, bottomVal);

            }
        });
    }

    /**
     * Sets the picker position based on the saturation and vibrance
     * @param x Number - number for left position
     * @param y Number -  number for bottom position
     */
    setPickerPosition(x, y) {
        const picker = this._colorPicker.nativeElement;
        this.renderer.setStyle(picker, 'left', 'calc(' + x + '% - 5px');
        this.renderer.setStyle(picker, 'bottom', 'calc(' + y + '% - 5px');
    }

    checkBaseColorDifference() {
        const newHsv = this.cs.hexToHsv(this.selectedColor);

        if (newHsv.h !== this.baseHsv.h) {
            const baseRgb  = this.cs.hsvToRgb(newHsv.h, 1, 1);
            this.baseColor = this.cs.rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b);
            this.baseHsv = this.cs.hexToHsv(this.baseColor);

            if (!this.isDragging) {
                this.setPickerPosition((newHsv.s * 100), (newHsv.v * 100));
            }
        }
    }

    prepareColorChange(x, y) {
        x = (x > 1) ? x / 100 : x;
        y = (y > 1) ? y / 100 : y;
        const rgb = this.cs.hsvToRgb(this.baseHsv.h, x, y);
        this.colorChanged.emit([rgb.r, rgb.g, rgb.b]);
    }

}
