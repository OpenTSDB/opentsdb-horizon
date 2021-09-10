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
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { MatMenu, MatMenuTrigger } from '@angular/material';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'theme-picker',
    templateUrl: './theme-picker.component.html',
    styleUrls: []
})
export class ThemePickerComponent implements OnInit {

    @HostBinding('class.nav-theme-picker') private _hostClass = true;

    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    @Output() themeChange = new EventEmitter<string>();

    private themeClass: string;

    get theme() {
        return this.themeClass;
    }

    themeOptions: Array<object> = [
        {
            label: 'Developing',
            value: 'developing' // light theme in progress
        },
        {
            label: 'Light',
            value: 'light' // light theme
        },
        {
            label: 'Dark',
            value: 'dark'
        }
    ];

    constructor(
        private overlayContainer: OverlayContainer
    ) { }

    ngOnInit() {
        // NOTE: need some way get user settings for theme
        this.themeClass = 'developing';
        this.setTheme();
    }

    selectTheme(item) {
        this.themeClass = item.value;
        this.setTheme();
        this.themeChange.emit(item.value);
    }

    private setTheme() {
        const OC = this.overlayContainer.getContainerElement();
        const docBody = OC.closest('body');

        // const docBodyClasses = docBody.classList;
        // const themeClassesToRemove = Array.from(docBodyClasses).filter((item: string) => item.includes('-theme'));

        // docBodyClasses.remove(...themeClassesToRemove);
        // docBodyClasses.add(this.themeClass + '-theme');
        docBody.setAttribute('theme', this.themeClass);
    }

}
