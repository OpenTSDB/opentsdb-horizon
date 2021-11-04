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
import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClipboardService } from '../../services/clipboard.service';
import { RightDrawerService } from '../../../right-drawer/services/right-drawer.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'navbar-clipboard-menu',
    templateUrl: './navbar-clipboard-menu.component.html',
    styleUrls: ['./navbar-clipboard-menu.component.scss']
})
export class NavbarClipboardMenuComponent implements OnInit, OnDestroy {

    @HostBinding('class.navbar-clipboard-menu') private _hostClass = true;
    @HostBinding('class.is-open') get checkDrawerState() {
        return this.drawerState === 'opened';
    }

    @Input() id = null;
    private drawerState: string = 'closed';
    private subscription = new Subscription();

    constructor(
        private cbService: ClipboardService,
        private drawerSrv: RightDrawerService
    ) { }

    ngOnInit() {
        // this.subscription.add(this.cbService.$drawerState.subscribe(val => {
            // this.drawerState = val;
        // }));
    }

    toggleDrawerState(type) {
        this.drawerState = this.drawerState === 'closed' ? 'opened' : 'closed';
        if ( this.drawerState === 'opened' && type === 'clipboard') {
            this.cbService.setDrawerState(this.drawerState);
        } else if ( this.drawerState === 'opened' ) {
            this.drawerSrv.setDrawerState(this.drawerState);
            this.drawerSrv.setDrawerParams({ type: type, id: this.id });
        } else {
            this.drawerSrv.setDrawerState(this.drawerState);
            this.cbService.setDrawerState(this.drawerState);
        }
        console.log("123456 navbar toggleDrawerState", this.drawerState)
    }

    getDrawerState() {
        return this.drawerState;
    }

    setDrawerOpen() {
        this.cbService.setDrawerState('opened');
    }

    /*
    setDrawerClosed() {
        this.cbService.setDrawerState('closed');
    }
    */

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
