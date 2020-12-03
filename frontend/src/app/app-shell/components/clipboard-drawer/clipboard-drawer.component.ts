import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ClipboardService } from '../../services/clipboard.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';


@Component({
    // tslint:disable-next-line: component-selector
    selector: 'clipboard-drawer',
    templateUrl: './clipboard-drawer.component.html',
    animations: [
        trigger('toggleDrawer', [
            state('closed', style({
                'width': '0'
            })),
            state('opened', style({
                width: '300px'
            })),
            transition('closed <=> opened', animate(300))
        ])
    ]
})
export class ClipboardDrawerComponent implements OnInit, OnDestroy {

    private drawerState: string = 'closed';

    @HostBinding('class.clipboard-drawer') private _hostClass = true;

    // binds the animation to the host component
    @HostBinding('@toggleDrawer') get getToggleDrawer(): string {
        return this.drawerState === 'closed' ? 'closed' : 'opened';
    }

    get getDrawerState() {
        return this.drawerState;
    }

    private subscription = new Subscription();

    constructor(
        private cbService: ClipboardService,
        private logger: LoggerService
    ) { }

    ngOnInit() {
        this.subscription.add(this.cbService.$drawerState.subscribe(val => {
            this.logger.log('DRAWER $drawerState:change', {val});
            this.drawerState = val;
        }));
    }

    // toggle
    toggle(): void {
        // this.drawerState = this.drawerState === 'closed' ? 'opened' : 'closed';
        const state = this.drawerState === 'closed' ? 'opened' : 'closed';
        this.cbService.setDrawerState(state);
    }

    // opens drawer
    open(): void {
        // this.drawerState = 'opened';
        this.cbService.setDrawerState('opened');
    }

    // closes drawer
    close(): void {
        // this.drawerState = 'closed';
        this.cbService.setDrawerState('closed');
    }

    // JUST FOR DEV
    arrayOne(n: number): any[] {
        return Array(n);
    }

    // ON DESTROY
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
