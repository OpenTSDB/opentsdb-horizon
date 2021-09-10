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
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'navbar-clipboard-menu',
    templateUrl: './navbar-clipboard-menu.component.html'
})
export class NavbarClipboardMenuComponent implements OnInit, OnDestroy {

    @HostBinding('class.navbar-clipboard-menu') private _hostClass = true;
    @HostBinding('class.is-open') get checkDrawerState() {
        return this.drawerState === 'opened';
    }

    private drawerState: string = 'closed';
    private subscription = new Subscription();

    constructor(
        private cbService: ClipboardService
    ) { }

    ngOnInit() {
        this.subscription.add(this.cbService.$drawerState.subscribe(val => {
            this.drawerState = val;
        }));
    }

    toggleDrawerState(event) {
        const state = this.drawerState === 'closed' ? 'opened' : 'closed';
        this.cbService.setDrawerState(state);
    }

    getDrawerState() {
        return this.drawerState;
    }

    setDrawerOpen() {
        this.cbService.setDrawerState('opened');
    }

    setDrawerClosed() {
        this.cbService.setDrawerState('closed');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
