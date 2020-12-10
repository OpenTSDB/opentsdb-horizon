import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EMPTY_COLOR, coerceHexaColor, IDefaultColor, IColor, DEFAULT_COLORS } from '../../color-picker';
import { ColorPickerService } from '../../services/color-picker.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatCard } from '@angular/material';
import { ColorPickerSelectorComponent } from '../../components/color-picker-selector/color-picker-selector.component';

/*interface IDefaultColor {
    text: string;
    value: string;
}

interface IColor {
    hex: string;
    rgb: string;
}*/

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: [],
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ColorPickerComponent implements OnInit {
    @HostBinding('class.color-picker-component') private _hostClass = true;

    @ViewChild('contentForOtherModes') contentForOtherModes: ElementRef;

    /* Inputs */
    @Input() enableAuto: boolean; // allow auto to be selected - outputs {hex: 'auto', color: 'auto'}
    @Input() enablePalette = false;

    // Behavior of when to output newColor. Valid Values: dropDown, dropDownNoButton, embedded.
    @Input() get pickerMode(): string {
        return this._pickerMode;
    }
    set pickerMode(value: string) {
        this._pickerMode = value;
    }
    _pickerMode: string;

    // Color to display
    @Input() get color(): string {
        return this._color;
    }
    set color(value: string) {
        if (this._color !== value) {
            this.changeDetectorRef.markForCheck();
        }

        if (this.isRgbValid(value)) {
            this._color = this.rgbToHex(value);
        } else {
            this._color = coerceHexaColor(value) || ( this.enablePalette && value ? value : 'Auto' );
        }

        // if on embedded view, do not attempt to switch between default and custom
        if (this.pickerMode !== 'embedded') {
            this.determineIfCustomColor();
        }
    }
    private _color: string;

    // Should panel be open - use with dropDownNoButton mode
    @Input() get isOpen(): boolean {
        return this._isOpen;
    }
    set isOpen(value: boolean) {
        this._isOpen = coerceBooleanProperty(value);
    }
    private _isOpen: boolean;

    /* Outputs */

    // Emits new color. 'Embedded' mode outputs every custom color.
    // DropDown and DropDownNoButton outputs custom color when apply is clicked.
    @Output() newColor = new EventEmitter();

    DefaultColors: IDefaultColor[] = DEFAULT_COLORS;

    // Valid picker modes:
    embedded = 'embedded';
    dropDownNoButton = 'dropDownNoButton';
    dropDown = 'dropDown';

    // tslint:disable:no-inferrable-types
    selectingCustomColor: boolean = false;
    _colorPickerSelectorHeight: number = 136;
    mode = 'palette';

    palettes: any = [
        {'name': 'Category10', 'label': 'Category10'},
        {'name': 'Accent', 'label': 'Accent'},
        {'name': 'Dark2', 'label': 'Dark2'},
        {'name': 'Paired', 'label': 'Paired'},
        {'name': 'Set1', 'label': 'Set1'},
        {'name': 'Set2', 'label': 'Set2'},
        {'name': 'Set3', 'label': 'Set3'},
        {'name': 'Tableau10', 'label': 'Tableau10'},
        {'name': 'sinebow', 'label': 'Sinebow'},
        {'name': 'rainbow', 'label': 'Rainbow'},
        {'name': 'Spectral', 'label': 'Spectral'},
        {'name': 'RdYlGn', 'label': 'RedYellowGreen'},
        {'name': 'RdYlBu', 'label': 'RedYellowBlue'},
        {'name': 'RdGy', 'label': 'RedGray'},
        {'name': 'RdBu', 'label': 'RedBlue'},
        {'name': 'PuOr', 'label': 'PurpleOrange'},
        {'name': 'PiYG', 'label': 'PinkYellowGreen'},
        {'name': 'PRGn', 'label': 'PurpleGreen'},
        {'name': 'BrBG', 'label': 'BrownGreen'},
        {'name': 'turbo', 'label': 'Turbo'},
        {'name': 'CubehelixDefault', 'label': 'CubehelixDefault'},
        {'name': 'cool', 'label': 'Cool'},
        {'name': 'warm', 'label': 'Warm'},
        {'name': 'plasma', 'label': 'Plasma'},
        {'name': 'magma', 'label': 'Magma'},
        {'name': 'inferno', 'label': 'Inferno'},
        {'name': 'viridis', 'label': 'Viridis'},
        {'name': 'cividis', 'label': 'Cividis'},
        {'name': 'ylOrRd', 'label': 'YelllowOrangeRed'},
        {'name': 'ylOrBr', 'label': 'YellowOrangeBrown'},
        {'name': 'YlGn', 'label': 'YellowGreen'},
        {'name': 'YlGnBu', 'label': 'YellowGreenBlue'},
        {'name': 'RdPu', 'label': 'RedPurple'},
        {'name': 'PuRd', 'label': 'PurpleRed'},
        {'name': 'PuBu', 'label': 'PurpleBlue'},
        {'name': 'PuBuGn', 'label': 'PurpleBlueGreen'},
        {'name': 'OrRd', 'label': 'OrangeRed'},
        {'name': 'GnBu', 'label': 'GreenBlue'},
        {'name': 'BuPu', 'label': 'BluePurple'},
        {'name': 'BuGn', 'label': 'BlueGreen'},
        {'name': 'reds', 'label': 'Reds'},
        {'name': 'purples', 'label': 'Purples'},
        {'name': 'oranges', 'label': 'Oranges'},
        {'name': 'greys', 'label': 'Greys'},
        {'name': 'greens', 'label': 'Greens'},
        {'name': 'blues', 'label': 'Blues'}
    ];

    constructor(
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private colorPickerService: ColorPickerService,
        @Inject(EMPTY_COLOR) public emptyColor: string
    ) { }

    ngOnInit() {

        if (this.enableAuto === undefined) {
            this.enableAuto = false;
        }

        if (!this._color) {
            this._color = '#000000';
        }

        if (!this.pickerMode) {
            this.pickerMode = this.dropDown;
        }

        if (this.pickerMode.toLowerCase().trim() === this.embedded.toLowerCase()) {
            this.pickerMode = this.embedded;
            this.isOpen = true;
        } else if (this.pickerMode.toLowerCase().trim() === this.dropDownNoButton.toLowerCase()) {
            this.pickerMode = this.dropDownNoButton;
        } else {
            this.pickerMode = this.dropDown;
            this.isOpen = false;
        }

        this.determineIfCustomColor();
    }

    /* Picker Behaviors */
    determineIfCustomColor() {
        const index =  this.palettes.findIndex( d => d.name === this.color );
        if ( this.enablePalette && index !== -1 ) {
            this.mode = 'palette';
        } else if (this.colorToName(this.color) || this.color && this.color.toLowerCase() === 'auto') {
            this.mode = 'default';
        } else {
            this.mode = 'custom';
        }
    }

    toggleSelector(mode) {
        // reset the color if single to palette or palette to single
        const oldMode = this.mode;
        this.mode = mode;
        /*
        if ( mode === 'palette' || oldMode === 'palette' ) {
            // this.color = '';
            // this.emitColor();
        }
        */
    }

    colorSelected(hexColor: string): void {
        this.color = hexColor;
        this.emitColor();

        // if on custom color and we hit a default color, do not switch to default view
        if (this.pickerMode !== 'embedded') {
            this.toggle();
        }
    }

    colorSchemeSelected(scheme) {
        this.color = scheme;
        this.newColor.emit( {'scheme': scheme} );
    }

    emitColor() {
        if (this.color.toLowerCase() === 'auto') {
            this.newColor.emit( { hex: 'auto', rgb: 'auto'});
        } else {
            this.newColor.emit(this.hexToColor(this.color));
        }
    }

    colorToName(hexColor: string): string {
        let colorName = '';
        // tslint:disable-next-line:prefer-const
        for (let color of this.DefaultColors) {
            if (color.value === hexColor) {
                colorName = color.text;
                break;
            }
        }
        return colorName;
    }

    // Define selector (slider) height
    get colorPickerSelectorHeight(): number {
        return this._colorPickerSelectorHeight;
    }
    set colorPickerSelectorHeight(height: number) {
        this._colorPickerSelectorHeight = height;
    }

    // Open/close color picker panel
    toggle() {
        // if closed, determine if custom color
        if (!this._isOpen) {
            this.determineIfCustomColor();
        }
        this._isOpen = !this._isOpen;
        if (!this._isOpen && this._color !== this.emptyColor) {
            this.colorPickerService.addColor(this._color);
        }
    }

    // Update selected color, close the panel and notify the user
    backdropClick(): void {
        this.cancelSelection();
    }

    // Cancel the selection and close the panel
    cancelSelection() {
        this.toggle();
    }

    // Update selectedColor and close the panel
    confirmSelectedColor() {
        this.emitColor();
        this.toggle();
    }

    /**
     * Hex and RGB conversions
     */
    // tslint:disable:no-var-keyword
    // tslint:disable:prefer-const
    // tslint:disable:no-bitwise
    hexToRgb(hex: string) {
        var bigint = parseInt(hex.substring(1), 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return r + ',' + g + ',' + b;
    }

    hexToColor(_hex): IColor {
        let color = {
            hex: _hex,
            rgb: this.hexToRgb(_hex)
        };
        return color;
    }

    componentToHex(c): string {
        var hex = c.toString(16);
        var hexx = hex.length === 1 ? '0' + hex : hex;
        return hexx;
    }

    rgbToHexHelper(r: string, g: string, b: string): string {
        // tslint:disable-next-line:radix
        return '#' + this.componentToHex(parseInt(r)) + this.componentToHex(parseInt(g)) + this.componentToHex(parseInt(b));
    }

    // ex: "20,50,70"
    rgbToHex(rgb: string) {
        let values: string[] = rgb.split(',');
        if (this.isRgbValid(rgb)) {
            return this.rgbToHexHelper(values[0].trim(), values[1].trim(), values[2].trim());
        }
    }

    // ex: "20,50,70"
    isRgbValid(rgb: string): boolean {
        if (!rgb) {
            rgb = '';
        }
        let values: string[] = rgb.split(',');
        let isValid: boolean = true;

        if (values.length !== 3) {
            isValid = false;
        } else {
            for (let value of values) {
                if (parseInt(value, 10) < 0 || parseInt(value, 10) > 255) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    }
}
