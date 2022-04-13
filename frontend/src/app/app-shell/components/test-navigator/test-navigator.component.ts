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
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output, ViewChild, ElementRef, ViewEncapsulation
} from '@angular/core';

import { NavigatorPanelComponent } from '../navigator-panel/navigator-panel.component';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'test-navigator',
    templateUrl: './test-navigator.component.html',
    styleUrls: ['./test-navigator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.test-navigator]': 'true',
        '[class.panel-content]': 'true'
    }
})
export class TestNavigatorComponent implements OnInit {

    //@HostBinding('class.test-navigator') private _hostClass = true;

    @ViewChild(NavigatorPanelComponent, { static: true }) private navPanel: NavigatorPanelComponent;

    @Input() activeNavSection: any = '';
    @Input() drawerMode: any = 'over';

    @Input() panelTitle: any = '';
    @Input() panelText: any = '';

    @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    closeDrawer() {
        this.toggleDrawer.emit({
            closeNavigator: true
        });
    }

    toggleDrawerMode() {
        this.toggleDrawer.emit(true);
    }

}
