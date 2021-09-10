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
import { Injectable, Inject } from '@angular/core';
import { coerceHexaColor, isValidColor, EMPTY_COLOR } from '../color-picker';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class ColorPickerService {
    /**
     * Array of all used colors
     */
    private _colors: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    constructor(@Inject(EMPTY_COLOR) private emptyColor: string) { }

    /**
     * Add new color to used colors
     * @param color string
     */
    addColor(color: string): void {
        if (!color || !isValidColor(color)) {
            return;
        }

        color = coerceHexaColor(color) || this.emptyColor;

        const colors = this._colors.getValue();
        if (!colors.find(_color => _color === color)) {
            colors.push(color);
            this._colors.next(colors);
        }
    }

    /**
     * Return Observable of colors
     */
    getColors(): Observable<string[]> {
        return this._colors.asObservable();
    }

    /**
     * Reset the array of used colors
     */
    resetUseColors(): void {
        this._colors.next([]);
    }
}
