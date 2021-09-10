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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../../core/services/local-storage.service';

const DEFAULT_THEME = 'developing';

const THEME_OPTIONS: any[] = [
    {
        label: 'Default',
        value: 'developing', // light theme in progress
        type: 'light'
    },
    {
        label: 'Light',
        value: 'light', // light theme
        type: 'light'
    },
    {
        label: 'Dark',
        value: 'dark',
        type: 'dark'
    }
];

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    private _activeTheme = new BehaviorSubject('');
    private _themeType = new BehaviorSubject('');

    static get themeOptions(): any[] {
        return THEME_OPTIONS;
    }

    constructor(
        private localStorage$: LocalStorageService
    ) {
        if (localStorage$.hasKey('settings.theme')) {
            this.setActiveTheme(localStorage$.getLocal('settings.theme'), true);
        } else {
            this.setActiveTheme(DEFAULT_THEME);
        }
    }

    public getActiveTheme() {
        return this._activeTheme.asObservable();
    }

    public setActiveTheme(name: string, ignoreLocal: boolean = false) {
        if (!ignoreLocal) {
            this.localStorage$.setLocal('settings.theme', name);
        }
        this._activeTheme.next(name);

        // theme type
        const curType = this._themeType.value;
        const themeOption = this.themeOption(name);
        if (curType !== themeOption.type) {
            this._themeType.next(themeOption.type);
        }
    }

    public getThemeType() {
        return this._themeType.asObservable();
    }

    private themeOption(name: string) {
        let idx = THEME_OPTIONS.findIndex(item => item.value === name);
        if (idx === -1) {
            // can't find... use default
            idx = THEME_OPTIONS.findIndex(item => item.value === 'developing');
        }
        return THEME_OPTIONS[idx];
    }


}
