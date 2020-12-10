import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ClipboardService } from '../../services/clipboard.service';
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { HttpService } from '../../../core/http/http.service';
import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState } from '../../state';
import { ClipboardLoad, ClipboardResourceInitialize, UniversalClipboardState } from '../../state/clipboard.state';


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
    private resourcesReady: boolean = false;

    @HostBinding('class.clipboard-drawer') private _hostClass = true;

    // binds the animation to the host component
    @HostBinding('@toggleDrawer') get getToggleDrawer(): string {
        return this.drawerState === 'closed' ? 'closed' : 'opened';
    }

    get getDrawerState() {
        return this.drawerState;
    }

    private subscription = new Subscription();

    // STORES
    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<boolean>;
    @Select(UniversalClipboardState.getClipboardResourceLoaded) cbResourcesLoaded$: Observable<boolean>
    cbResourcesLoaded: boolean = false;
    // list of available clipboards
    @Select(UniversalClipboardState.getClipboards) clipboardList$: Observable<any[]>;
    clipboardList: any[] = [];
    // items on the currently active clipboard
    @Select(UniversalClipboardState.getClipboardItems) clipboardItems$: Observable<any[]>;
    clipboardItems: any[] = [];

    @Select(UniversalClipboardState.getActiveClipboardSelectedIndex) activeIndex$: Observable<any>;
    activeIndex: any = false;

    constructor(
        private store: Store,
        private http: HttpService,
        private cbService: ClipboardService,
        private logger: LoggerService
    ) { }

    ngOnInit() {
        this.logger.ng('CLIPBOARD DRAWER onInit');

        this.subscription.add(this.resourcesLoaded$.subscribe(loaded => {
            this.logger.ng('resourcesLoaded', {loaded});
            if (loaded === true) {
                // DBFS resources loaded... need to initialize clipboard
                this.store.dispatch(new ClipboardResourceInitialize());
            }
        }));

        this.subscription.add(this.cbResourcesLoaded$.subscribe(loaded => {
            this.logger.ng('cbResourcesLoaded', {loaded});

            if (loaded === true) {
                this.cbResourcesLoaded = loaded;
                this.store.dispatch(new ClipboardLoad());
            }
        }));

        this.subscription.add(this.clipboardList$.subscribe(clipboards => {
            this.logger.ng('clipboardList', {clipboards});
            this.clipboardList = clipboards;
        }));

        this.subscription.add(this.clipboardItems$.subscribe(items => {
            this.logger.ng('clipboardItems', {items});
            this.clipboardItems = items;
        }));

        this.subscription.add(this.activeIndex$.subscribe(index => {
            this.logger.ng('activeIndex', {index});
            this.activeIndex = index;
        }));

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

    pasteToDashboard(data: any, index: any) {
        this.logger.log('pasteToDashboard', {data, index});
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
