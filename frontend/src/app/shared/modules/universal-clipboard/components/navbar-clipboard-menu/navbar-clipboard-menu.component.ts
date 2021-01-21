import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../../../core/services/logger.service';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'navbar-clipboard-menu',
    templateUrl: './navbar-clipboard-menu.component.html'
})
export class NavbarClipboardMenuComponent implements OnInit, OnDestroy {

    @HostBinding('class.navbar-clipboard-menu') private _hostClass = true;

    private drawerState: string = 'closed';
    private subscription = new Subscription();

    constructor(
        private cbService: ClipboardService,
        private logger: LoggerService
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

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
