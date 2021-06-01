import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClipboardService } from '../../services/clipboard.service';

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
