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
import { InjectionToken } from '@angular/core';

/** Contant used as empty color */
export const EMPTY_COLOR = new InjectionToken<string>('empty-color');

/**
 *
 */
export interface ColorPickerConfig {
    empty_color: string;
}

/**
 * This interface represents one color. Using this interface instead simple string
 * will help screen readers, because the text attribute ir set to the aria-label of
 * the option
 */
export interface ColorPickerItem {
    text: string;
    value: string;
}

export type ColorPickerOption = string | ColorPickerItem;

/**
 * Verify if color has # as a first char. If not, add this char
 * to the color
 * @param color string
 */
export function coerceHexaColor(color: string): string {
    if (color && color.indexOf('#') !== 0) {
        color = `#${color}`;
    }

    if (!isValidColor(color)) {
        return;
    }

    return color.toUpperCase();
}

/**
 * Validate if the color is valid hex
 * @param color string
 */
export function isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
}


export interface IDefaultColor {
    text: string;
    value: string;
}

export interface IColor {
    hex: string;
    rgb: string;
}

export const DEFAULT_COLORS: IDefaultColor[] = [
    { text: 'Maroon', value: '#B00013' },
    { text: 'Yellow', value: '#FED800' },
    { text: 'Blue', value: '#0B5ED2' },
    { text: 'Lavender', value: '#9971E0' },
    { text: 'Black', value: '#000000' },
    { text: 'Red', value: '#DA001B' },
    { text: 'Lime', value: '#AAEC61' },
    { text: 'Periwinkle', value: '#B0D9F9' },
    { text: 'Indigo', value: '#300075' },
    { text: 'Slate Gray', value: '#4D4D4D' },
    { text: 'Orange', value: '#ED5A1C' },
    { text: 'Lime Green', value: '#75D42A' },
    { text: 'Cyan', value: '#18BDED' },
    { text: 'Magenta', value: '#B10060' },
    { text: 'Gray', value: '#888888' },
    { text: 'Brown', value: '#E28B00' },
    { text: 'Green', value: '#1CB84F' },
    { text: 'Aqua', value: '#6DDDFA' },
    { text: 'Fuchsia', value: '#FB007D' },
    { text: 'Silver', value: '#CBCBCB' },
    { text: 'Amber', value: '#F0B200' },
    { text: 'Olive', value: '#446E17' },
    { text: 'Purple', value: '#87119A' },
    { text: 'Pink', value: '#FC5AA8' },
    { text: 'White', value: '#FFFFFF' }]
