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
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';

import { NavigatorPanelComponent } from '../navigator-panel/navigator-panel.component';

@Component({
    selector: 'settings-panel',
    templateUrl: './settings-panel.component.html',
    styleUrls: ['./settings-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SettingsPanelComponent implements OnInit {
    @HostBinding('class.test-navigator') private _hostClass = true;
    @HostBinding('class.panelContent') private _panelContentClass = true;

    @ViewChild(NavigatorPanelComponent)
    private navPanel: NavigatorPanelComponent;

    @Input() activeNavSection: any = '';
    @Input() drawerMode: any = 'over';

    @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() { /* do nothing */ }

    closeDrawer() {
        this.toggleDrawer.emit({
            closeNavigator: true,
        });
    }

    toggleDrawerMode() {
        this.toggleDrawer.emit(true);
    }
}
