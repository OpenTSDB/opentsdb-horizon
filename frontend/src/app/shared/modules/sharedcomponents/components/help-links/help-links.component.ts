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
    OnInit,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { AppConfigService } from '../../../../../core/services/config.service';

@Component({
    selector: 'help-links',
    templateUrl: './help-links.component.html',
    styleUrls: ['./help-links.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HelpLinksComponent implements OnInit {
    @HostBinding('class.help-links') private _hostClass = true;

    links = [];

    constructor(private appConfig: AppConfigService) {}

    ngOnInit() {
        const helpLinks = this.appConfig.getConfig().helpLinks;
        this.links = helpLinks ? helpLinks : [];
    }
}
