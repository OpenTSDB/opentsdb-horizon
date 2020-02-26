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
