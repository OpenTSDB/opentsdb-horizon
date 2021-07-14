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
import { Component, OnInit, HostBinding } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';
import { take } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'settings-theme',
    templateUrl: './settings-theme.component.html'
})
export class SettingsThemeComponent implements OnInit {

    @HostBinding('class.settings-theme') private _hostClass = true;

    themeOptions: any[] = [];

    activeTheme: string = '';

    get activeThemeLabel(): string {
        const idx = this.themeOptions.findIndex(item => item.value === this.activeTheme);
        return (idx >= 0) ? this.themeOptions[idx].label : '';
    }

    constructor(
        private themeService: ThemeService
    ) {
        this.themeOptions = ThemeService.themeOptions;
        this.themeService.getActiveTheme().pipe(take(1)).subscribe( theme => {
            this.activeTheme = theme;
        });
    }

    ngOnInit() {}

    selectTheme(item) {
        this.activeTheme = item.value;
        this.themeService.setActiveTheme(item.value);
    }

}
