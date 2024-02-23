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
import { CanLoad, Route, Router } from '@angular/router';
import { AppConfigService } from './core/services/config.service';

@Injectable()
export class AuthGuardService implements CanLoad {
    constructor(
        private appConfig: AppConfigService,
        private router: Router,
    ) {}
    canLoad(route: Route): boolean {
        const config = this.appConfig.getConfig();
        const homeUrl =
            config.uiBranding &&
            config.uiBranding.logo &&
            config.uiBranding.logo.homeUrl
                ? config.uiBranding.logo.homeUrl
                : '/main';
        if (!config.readonly) {
            return true;
        } else if (homeUrl !== '/main') {
            this.router.navigate([config.uiBranding.logo.homeUrl]);
        } else {
            this.router.navigate(['error']);
        }
        return true;
    }
}
