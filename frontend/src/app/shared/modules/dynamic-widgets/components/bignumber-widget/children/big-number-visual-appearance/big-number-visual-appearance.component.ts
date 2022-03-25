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
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'big-number-visual-appearance',
    templateUrl: './big-number-visual-appearance.component.html',
    styleUrls: ['./big-number-visual-appearance.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class BignumberVisualAppearanceComponent implements OnInit {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.big-number-visual-appearance') private _tabClass = true;
    @HostBinding('class.has-columns') private _hasColumns = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;
    @Output() selectionChanged = new EventEmitter;

    /** Local variables */

    // selectedMetric: object;
    colorType: string;

    @ViewChild(MatMenuTrigger, { static: false }) private menuTrigger: MatMenuTrigger;

    timeUnits: Array<string> = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'years'];

    binaryDataUnitsKeys: Array<string> = [ 'binbyte', 'kibibyte', 'mebibyte', 'gibibyte', 'tebibyte', 'pebibyte', 'exibyte' ];
    binaryDataUnits: { [key:string] : string; } = {
        'binbyte' : 'B   - byte',
        'kibibyte': 'KiB - kibibyte (1024 B)',
        'mebibyte': 'MiB - mebibyte (1024 KiB)',
        'gibibyte': 'GiB - gebibyte (1024 MiB)',
        'tebibyte': 'TiB - tebibyte (1024 GiB)',
        'pebibyte': 'PiB - pebibyte (1024 TiB)',
        'exibyte' : 'EiB - exibyte  (1024 PiB)'
    };

    decimalDataUnitsKeys: Array<string> = ['decbyte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte', 'exabyte'];
    decimalDataUnits: { [key:string] : string; } = {
        'decbyte' : 'B   - byte',
        'kilobyte': 'kB - kilobyte (1000 B)',
        'megabyte': 'MB - megabyte (1000 kB)',
        'gigabyte': 'GB - gigabyte (1000 MB)',
        'terabyte': 'TB - terabyte (1000 GB)',
        'petabyte': 'PB - petabyte (1000 TB)',
        'exabyte' : 'EB - exabyte  (1000 PB)'
    };

    binaryDataRateKeys: Array<string> = ['binbps', 'kibibps', 'mebibps', 'gibibps', 'tebibps', 'binbyte/s', 'kibibyte/s', 'mebibyte/s', 'gibibyte/s', 'tebibyte/s'];
    binaryDataRateUnits: { [key:string] : string; } = {
        'binbps' : 'bit/s',
        'kibibps': 'Kibit/s (1024 bit/s)',
        'mebibps': 'Mibit/s (1024 Kibit/s)',
        'gibibps': 'Gibit/s (1024 Mibit/s)',
        'tebibps': 'Tibit/s (1024 Gibit/s)',
        'binbyte/s' : 'B/s (byte/s)',
        'kibibyte/s': 'KiB/s (1024 B/s)',
        'mebibyte/s': 'MiB/s (1024 KiB/s)',
        'gibibyte/s': 'GiB/s (1024 MiB/s)',
        'tebibyte/s': 'TiB/s (1024 GiB/s)'
    };

    decimalDataRateKeys: Array<string> = ['decbps', 'kbps', 'mbps', 'gbps', 'tbps', 'decbyte/s', 'kilobyte/s', 'megabyte/s', 'gigabyte/s', 'terabyte/s'];
    decimalDataRateUnits: { [key:string] : string; } = {
        'decbps' : 'bit/s',
        'kbps': 'kbit/s (1000 bit/s)',
        'mbps': 'Mbit/s (1000 kbit/s)',
        'gbps': 'Gbit/s (1000 Mbit/s)',
        'tbps': 'Tbit/s (1000 Gbit/s)',
        'decbyte/s' : 'B/s (byte/s)',
        'kilobyte/s': 'kB/s (1000 B/s)',
        'megabyte/s': 'MB/s (1000 kB/s)',
        'gigabyte/s': 'GB/s (1000 MB/s)',
        'terabyte/s': 'TB/s (1000 GB/s)'
    };

    currencyUnits: Array<string> = ['usd'];
    otherUnits: Array<string> = ['auto'];

    // tslint:disable-next-line:no-inferrable-types
    captionPlaceholder: string = 'Enter Caption {{tag.key}}';
    // tslint:disable-next-line:no-inferrable-types
    prefixDisabled: boolean = true;

    constructor() { }

    ngOnInit() {
        // this.selectedMetric = this.widget;
        this.colorType = 'text'; // default color tab
    }

    // Prefix
    KeyedOnPrefixInputBox(value: string) {
        this.prefixDisabled = false;
        this.widget.settings.visual['prefix'] = value;
        this.widget.settings.visual['prefixUndercased'] = this.isStringOnlyLowercasedLetters(value);
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedPrefixSize(value: string) {
        this.widget.settings.visual['prefixSize'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedPrefixAlignment(value: string) {
        this.widget.settings.visual['prefixAlignment'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }


    /*
    // Postfix
    KeyedOnPostfixInputBox(value: string) {
        this.widget.settings.visual['postfix'] = value;
        this.widget.settings.visual['postfixUndercased'] = this.isStringOnlyLowercasedLetters(value);
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedPostfixSize(value: string) {
        this.widget.settings.visual['postfixSize'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedPostfixAlignment(value: string) {
        this.widget.settings.visual['postfixAlignment'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }
    */

    // Unit
    setUnit(value: string) {
        this.widget.settings.visual['unit'] = value;
        //this.widget.settings.visual['unitUndercased'] =
        //    this.isStringOnlyLowercasedLetters(this.UN.getBigNumber(this.widget.settings.visual['bigNumber'],
        //    this.widget.settings.visual['unit']).unit);
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedUnitSize(value: string) {
        this.widget.settings.visual['unitSize'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedUnitAlignment(value: string) {
        this.widget.settings.visual['unitAlignment'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    onMenuOpen(): void {
        const unit: string = this.widget.settings.visual['unit'];

        if (this.isUnitCustom(unit)) {
            (<HTMLInputElement>document.getElementById('custom-unit')).value = unit;
        } else {
            (<HTMLInputElement>document.getElementById('custom-unit')).value = '';
        }
    }

    customUnitEntered() {
      this.menuTrigger.closeMenu();
    }

    isUnitCustom(str: string): boolean {
        let allUnits: Array<string>;

        allUnits = this.timeUnits;
        allUnits = allUnits.concat(this.binaryDataUnitsKeys);
        allUnits = allUnits.concat(this.decimalDataUnitsKeys);
        allUnits = allUnits.concat(this.binaryDataRateKeys);
        allUnits = allUnits.concat(this.decimalDataRateKeys);
        allUnits = allUnits.concat(this.currencyUnits);
        allUnits = allUnits.concat(this.otherUnits);

        // const allUnits: Array<string> =  Object.keys(this.timeUnits).concat(Object.keys(this.binaryDataUnits).concat(Objectthis.decimalDataUnits).
        //     concat(this.dataRateUnits).concat(this.throughputUnits).concat(this.currencyUnits).concat(this.otherUnits);
        return !allUnits.includes(str);
    }

    // Caption
    KeyedOnCaptionInputBox(value: string) {
        this.widget.settings.visual['caption'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    selectedCaptionSize(value: string) {
        this.widget.settings.visual['captionSize'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    // Precision
    KeyedOnPrecisionInputBox(value: string) {
        this.widget.settings.visual['precision'] = value;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }

    // Color Picker
    selectedColorType(value: string) {
        this.colorType = value;
    }

    colorChanged(color: any) {
        if (color['hex']) { // make sure there is a hex
            if (this.colorType === 'text') {
                this.widget.settings.visual['textColor'] = color['hex'];
                this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
            } else { // background
                this.widget.settings.visual['backgroundColor'] = color['hex'];
                this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
            }
        }
    }

    isStringOnlyLowercasedLetters(str: string): boolean {
        return /^[a-z\s]*$/.test(str);
    }

    indicatorToggleChange() {
        // tslint:disable-next-line:whitespace
        this.widget.settings.visual['changedIndicatorEnabled'] =!
        this.widget.settings.visual['changedIndicatorEnabled'];
    }

    setVisualConditions(vConditions) {
        this.widget.settings.visual.conditions = vConditions;
        this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
    }
}
