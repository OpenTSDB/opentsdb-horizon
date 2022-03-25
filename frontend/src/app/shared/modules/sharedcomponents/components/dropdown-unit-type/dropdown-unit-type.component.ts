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
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostBinding, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

// NOTE: This component needs more work. Just don't have time at the moment.
// NOTE: This feature is used in many places. So need to come back to it.

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dropdown-unit-type',
    templateUrl: './dropdown-unit-type.component.html',
    styleUrls: ['./dropdown-unit-type.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DropdownUnitTypeComponent implements OnInit {

    @HostBinding('class.dropdown-unit-type') private _hostClass = true;

    // unit input
    @Input() unit: any = '';
    @Input() blackListedUnits: string[];

    /** Outputs */
    @Output() onUnitChange = new EventEmitter;

    // menu data
    @ViewChild(MatMenuTrigger, { static: false }) private menuTrigger: MatMenuTrigger;

    timeUnits: Array<string> = ['nanoseconds', 'microseconds', 'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'years'];

    binaryDataUnitsKeys: Array<string> = [ 'binbyte', 'kibibyte', 'mebibyte', 'gibibyte', 'tebibyte', 'pebibyte', 'exibyte' ];

    decimalDataUnitsKeys: Array<string> = ['decbyte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte', 'exabyte'];

    binaryDataRateKeys: Array<string> = ['binbps', 'kibibps', 'mebibps', 'gibibps', 'tebibps', 'binbyte/s', 'kibibyte/s', 'mebibyte/s', 'gibibyte/s', 'tebibyte/s'];

    decimalDataRateKeys: Array<string> = ['decbps', 'kbps', 'mbps', 'gbps', 'tbps', 'decbyte/s', 'kilobyte/s', 'megabyte/s', 'gigabyte/s', 'terabyte/s'];

    units: any = {
        timeUnits: {
            'nanoseconds': 'Nanoseconds',
            'microseconds': 'Microseconds',
            'milliseconds': 'Milliseconds',
            'seconds': 'Seconds',
            'minutes': 'Minutes',
            'hours': 'Hours',
            'days': 'Days',
            'years' : 'Years'
        },
        decimalDataUnits: {
            'decbyte' : 'B   - byte',
            'kilobyte': 'kB - kilobyte (1000 B)',
            'megabyte': 'MB - megabyte (1000 kB)',
            'gigabyte': 'GB - gigabyte (1000 MB)',
            'terabyte': 'TB - terabyte (1000 GB)',
            'petabyte': 'PB - petabyte (1000 TB)',
            'exabyte' : 'EB - exabyte  (1000 PB)'
        },

        binaryDataRateUnits: {
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
        },

        decimalDataRateUnits: {
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
        },
        binaryDataUnits: {
            'binbyte' : 'B   - byte',
            'kibibyte': 'KiB - kibibyte (1024 B)',
            'mebibyte': 'MiB - mebibyte (1024 KiB)',
            'gibibyte': 'GiB - gebibyte (1024 MiB)',
            'tebibyte': 'TiB - tebibyte (1024 GiB)',
            'pebibyte': 'PiB - pebibyte (1024 TiB)',
            'exibyte' : 'EiB - exibyte  (1024 PiB)'
        }
    };

    currencyUnits: Array<string> = ['usd'];
    otherUnits: Array<string> = ['auto'];

    // custom unit in menu
    @ViewChild('customUnit', { static: true }) customUnit: ElementRef;

    constructor() { }

    ngOnInit() {
        if (!this.blackListedUnits) {
            this.blackListedUnits = [];
        }
    }

    KeyedOnUnitInputBox(value: string, e: any = null) {
        if (e) {
            e.stopPropagation();
            this.menuTrigger.closeMenu();
        }
        this.onUnitChange.emit( value);
    }

    customUnitEntered() {
        this.menuTrigger.closeMenu();
    }

    getUnitLabel(unit) {
        for ( const k in this.units ) {
            if ( this.units[k][unit] ) {
                return this.units[k][unit];
            }
        }
        return unit;
    }

    isUnitBlackedList(unit: string) {
        for (let _unit of this.blackListedUnits) {
            if (_unit.toLowerCase() === unit.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    showUnitDropdown() {
        this.menuTrigger.openMenu();
    }
}
