/**
 * TODO: Need to re-evaluate this file and clean up some of the non-used code
 */


import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EMPTY_COLOR, coerceHexaColor, isValidColor } from '../../color-picker';
import { HostListener, HostBinding } from '@angular/core';

import { ColorService } from '../../services/color.service';

interface ColorOption {
    type: string;
    value: number;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'color-picker-selector',
    templateUrl: './color-picker-selector.component.html',
    styleUrls: [],
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerSelectorComponent
    implements AfterViewInit, OnInit, OnChanges, OnDestroy {

    embedded = 'embedded';
    dropDownNoButton = 'dropDownNoButton';
    dropDown = 'dropDown';

    @HostBinding('class.color-picker-selector-component') private _hostClass = true;

    // 3 Supported Modes: dropDown, dropDownNoButton, embedded
    // If using dropDownNoButton, programatically change [isOpen]
    @Input()
    get pickerMode(): string {
        return this._pickerMode;
    }
    set pickerMode(value: string) {
        this._pickerMode = value;
    }
    _pickerMode: string;

    /**
     * Change height base of the selector
     */
    @Input('height')
    set height(value: number) {
        this._height = value;
    }
    /*get selectorHeight(): number {
        return this._height;
    }
    get stripHeight(): number {
        return this._height - 2;
    }*/
    private _height: number;

    /**
     * Receive selected color from the component
     */
    @Input()
    get selectedColor(): string {
        return this._selectedColor;
    }
    set selectedColor(value: string) {
        if (!value || value.toLowerCase() === 'auto') {
            this._selectedColor = '#000000';
        } else {
            this._selectedColor = isValidColor(value) ? value : '#000000' ;
        }
    }
    // tslint:disable-next-line:no-inferrable-types
    private _selectedColor: string = '';

    /**
     * Hide the hexadecimal color forms.
     */
    @Input('hideHexForms')
    get hideHexForms(): boolean {
        return this._hideHexForms;
    }
    set hideHexForms(value: boolean) {
        this._hideHexForms = value;
    }
    // tslint:disable-next-line:no-inferrable-types
    private _hideHexForms: boolean = false;

    /**
     * Emit update when a color is selected
     */
    @Output() changeSelectedColor = new EventEmitter();

    /**
     * Emit when user entered a color
     */
    @Output() enteredColor = new EventEmitter();

    /**
     * Emit when user clicked cancel
     */
    @Output() clickedCancel = new EventEmitter();

    /**
     * RGBA current color
     */
    // tslint:disable-next-line:no-inferrable-types
    private _rgbaColor: string = 'rgba(255,0,0,1)';

    /**
     * Subject of the current selected color by the user
     */
    private _tmpSelectedColor: BehaviorSubject<string>;

    /**
     * Subscription of the tmpSelectedColor Observable
     */
    private _tmpSelectedColorSub: Subscription;

    /**
     * Subscription of the hexForm values change
     */
    private _hexValuesSub: Subscription;

    /**
     * Subscription of the rbgForm values change
     */
    private _rgbValuesSub: Subscription;

    /**
     * Handle color of the text
     */
    // tslint:disable-next-line:no-inferrable-types
    textClass: string = 'black';

    /**
     * Validate if the mouse button is pressed
     */
    // tslint:disable-next-line:no-inferrable-types
    _isPressed: boolean = false;

    /**
     * Form of the color in hexa
     */
    hexForm: FormGroup;

    /**
     * Form and keys of the fields in RGB
     */
    rgbKeys = ['R', 'G', 'B'];
    rgbForm: FormGroup;

    /**
     * Original Color Selcted
     */
    originalColor: string;

    /**
     * Height of component (if embedded or not)
     */
    heightOfComponent: number;

    presetColors = [ { hex: '#000000', rgb: [0, 0, 0], name:'Black' }, { hex: '#FFFFFF' , rgb: [255,255,255], name:'White' }, { hex: '#00FFFF', rgb: [0, 255, 255], name: 'Aqua' }, { hex: '#1E90FF', rgb: [30, 144, 255], name:'Dodger blue' }, 
        { hex: '#228B22', rgb: [34, 139, 34], name:'Forest green' }, { hex: '#FF00FF', rgb: [255, 0, 255], name:'Magenta' }, { hex: '#FFD700', rgb: [255, 215, 0], name:'Gold' }, { hex: '#0000FF', rgb: [0, 0, 255], name:'Blue' }, 
        { hex: '#00FF00', rgb: [0, 255, 0], name:'Lime' }, { hex: '#FFA500', rgb: [255, 165, 0], name:'Orange' }, { hex: '#FF4500', rgb: [255, 69, 0], name:'Orange red' }, { hex: '#808000', rgb: [128, 128, 0], name:'Olive' }, 
        { hex: '#800080', rgb: [128,0,128], name:'Purple' }, { hex: '#FFFF00', rgb: [255, 255, 0], name:'Yellow' }, { hex: '#FF0000', rgb: [255, 0, 0], name:'Red' }, { hex: '#A52A2A', rgb: [165, 42, 42], name:'Brown' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private render: Renderer2,
        private cs: ColorService,
        @Inject(EMPTY_COLOR) private emptyColor: string
    ) { }

    ngOnInit() {
        this._tmpSelectedColor = new BehaviorSubject<string>(this._selectedColor);
        if (this.pickerMode === this.embedded) {
            this.heightOfComponent = 232;
        } else {
            this.heightOfComponent = 280; // has cancel and apply buttons
        }

        this._tmpSelectedColorSub = this._tmpSelectedColor.subscribe(color => {
            if (color !== this._selectedColor && isValidColor(color)) {
                if (this.hexForm.get('hexCode').value !== color) {
                    this.hexForm.setValue({ hexCode: color });
                }
                // if embedded, immedietly emit new color
                if (this.pickerMode === this.embedded) {
                    this.changeSelectedColor.emit(coerceHexaColor(color));
                } else {
                    this.selectedColor = color;
                }
            }
        });

        // hex form
        this.hexForm = this.formBuilder.group({
            hexCode: [this.selectedColor, [Validators.minLength(7), Validators.maxLength(7), Validators.pattern(/^#[0-9A-F]{6}$/i)]],
        });

        // rgb dynamic form
        const rgbGroup: any = {};
        const rgbValue: number[] = this._getRGB();
        this.rgbKeys.forEach(
            (key, index) =>
                (rgbGroup[key] = new FormControl(rgbValue[index], {
                    validators: [
                        Validators.min(0),
                        Validators.max(256),
                        Validators.minLength(1),
                        Validators.maxLength(3),
                    ],
                    updateOn: 'blur',
                }))
        );
        this.rgbForm = this.formBuilder.group(rgbGroup);

        // watch changes on forms
        this._onChanges();

        // used to determine if apply button should appear
        this.originalColor = this.selectedColor;
    }

    /**
     * Update RGB, RGBA and Gradient when selectedColor change and
     * the mouse button is pressed
     * @param changes SimpleChanges
     */
    ngOnChanges(changes: SimpleChanges) {
        if ('selectedColor' in changes && changes['selectedColor'].currentValue !== this.emptyColor) {
            if (!this._isPressed) {
                this._updateRGB();
                this._updateRGBA();
                /*if (this._blockContext) {
                    this._fillGradient();
                }*/
            }

            const rgb = this._getRGB();
            const o = Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000);
            this.textClass = o > 125 ? 'black' : 'white';
        }
    }

    /**
     * Destroy all subscriptions
     */
    ngOnDestroy() {
        if (this._tmpSelectedColorSub && !this._tmpSelectedColorSub.closed) {
            this._tmpSelectedColorSub.unsubscribe();
        }
        if (this._hexValuesSub && !this._hexValuesSub.closed) {
            this._hexValuesSub.unsubscribe();
        }
        if (this._rgbValuesSub && !this._rgbValuesSub.closed) {
            this._rgbValuesSub.unsubscribe();
        }
    }

    ngAfterViewInit() { }

    /**
     * Watch change on forms
     */
    private _onChanges() {
        // validate digited code and update when digitation is finished
        this._hexValuesSub = this.hexForm.get('hexCode').valueChanges.subscribe(value => {
            if (!this._isPressed && isValidColor(value)) {
                this._tmpSelectedColor.next(coerceHexaColor(value) || this.emptyColor);
            }
        });

        this._rgbValuesSub = this.rgbForm.valueChanges.subscribe(controls => {
            const data: string[] = [];
            // tslint:disable-next-line:forin
            for (const key in controls) {
                if (!controls[key] || controls[key] > 255) {
                    data.push('');
                    continue;
                }

                data.push(controls[key]);
            }

            const hex = this._getHex(data);
            if (hex !== this._selectedColor && hex.length === 7) {
                this._tmpSelectedColor.next(hex);
            }
        });
    }

    /**
     * Convert HEX/canvas value to rgb
     * @param data any
     * @returns number[]
     */
    private _getRGB(data?: any): number[] {
        if (data) {
            return [data[0], data[1], data[2]];
        }
        const hex = this._selectedColor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        return [r, g, b];
    }

    /**
     * Convert RGB value to HEX
     * @param data any
     * @returns string
     */
    private _getHex(data: any): string {
        const hex = new Array(3);
        hex[0] = data[0].toString(16);
        hex[1] = data[1].toString(16);
        hex[2] = data[2].toString(16);

        hex.forEach((val, key) => {
            if (val.length === 1) {
                hex[key] = '0' + hex[key];
            }
        });

        return coerceHexaColor(`${hex[0]}${hex[1]}${hex[2]}`) || this.emptyColor;
    }

    /**
     * Update RGBA color
     * @param data any
     */
    private _updateRGBA(data?: any): void {
        if (!this._selectedColor && !data) {
            this._rgbaColor = 'rgba(255,0,0,1)';
        }

        const rgb = this._getRGB(data);
        this._rgbaColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    }

    /**
     * Update RGB form
     * @param data any
     */
    private _updateRGB(data?: any): void {
        if (!this.rgbForm) {
            return;
        }

        if (!data) {
            data = this._getRGB();
        }

        this.rgbForm.setValue({ R: data[0], G: data[1], B: data[2] });
    }

    /**
     * Get selected base color from the canvas
     * @param e MouseEvent
     */

    /** NEW
     * Receiving event from color saturation/vibrance block
     * @param rgb Array
     */
    changeColorValue(rgb) {
        // this._updateRGBA(rgb);
        this.updateValues(rgb);
    }

    /** NEW
     * receiving event from hue slider
     * @param rgb Array
     */
    changeHueColor(rgb) {
        this._updateRGBA(rgb);
        // this._fillGradient();
        this.updateValues(rgb);
    }

    /**
     * Get selected color from the canvas
     * @param e MouseEvent
     */

    /**
     * Emit update from the selected color
     * @param data any
     */
    private updateValues(data: any): void {
        if (data) {
            this._updateRGB(data);
            this._tmpSelectedColor.next(this._getHex(data));
        }
    }

    enterKeyedOnInputBox() {
        this.originalColor = this.selectedColor;
        this.changeSelectedColor.emit(coerceHexaColor(this.selectedColor));
    }

    userClickedCancel() {
        this.clickedCancel.emit();
    }

}
