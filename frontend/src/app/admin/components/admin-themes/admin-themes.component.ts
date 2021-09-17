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

import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
    selector: 'app-admin-themes',
    templateUrl: './admin-themes.component.html',
    styleUrls: ['./admin-themes.component.scss']
})
export class AdminThemesComponent implements OnInit {

    @HostBinding('class') classAttribute: string = 'app-admin-section app-admin-themes';

    // TEST sections links
    testSubLinks: any[] = [
        {
            label: 'Test Theme 1',
            path: 'test-1'
        },
        {
            label: 'Test Theme 2',
            path: 'test-2'
        },
        {
            label: 'Test Theme 3',
            path: 'test-3'
        },
        {
            label: 'Test Theme 4',
            path: 'test-4'
        },
        {
            label: 'Test Theme 5',
            path: 'test-5'
        }
    ];

    constructor() { }

    ngOnInit() {
    }

}
