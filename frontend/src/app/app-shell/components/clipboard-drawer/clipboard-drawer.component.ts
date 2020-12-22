import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ClipboardService } from '../../services/clipboard.service';
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { HttpService } from '../../../core/http/http.service';
import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState } from '../../state';
import { ClipboardCreate, ClipboardLoad, ClipboardResourceInitialize, SetClipboardActive, UniversalClipboardState } from '../../state/clipboard.state';
import { FormControl, Validators } from '@angular/forms';

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

    // index of the currently selected clipboard
    @Select(UniversalClipboardState.getActiveClipboardSelectedIndex) activeIndex$: Observable<any>;
    activeIndex: any = false;


    itemDetailOpened: any = ''; // widget id of the item that has detail opened

    // Available Widget Types
    widgetTypes: Array<object> = [
        {
            label: 'Bar Graph',
            type: 'BarchartWidgetComponent',
            iconClass: 'widget-icon-bar-graph'
        }, /*
        {
            label: 'Area Graph',
            type: 'WidgetAreaGraphComponent',
            iconClass: 'widget-icon-area-graph'
        }, */
        {
            label: 'Line Chart',
            type: 'LinechartWidgetComponent',
            iconClass: 'widget-icon-line-chart'
        },
        {
            label: 'Heatmap',
            type: 'HeatmapWidgetComponent',
            iconClass: 'widget-icon-heatmap'
        },
        {
            label: 'Big Number',
            type: 'BignumberWidgetComponent',
            iconClass: 'widget-icon-big-number'
        },
        {
            label: 'Donut Chart',
            type: 'DonutWidgetComponent',
            iconClass: 'widget-icon-donut-chart'
        },
        {
            label: 'Top N',
            type: 'TopnWidgetComponent',
            iconClass: 'widget-icon-topn-chart'
        },
        {
            label: 'Notes',
            type: 'MarkdownWidgetComponent',
            iconClass: 'widget-icon-notes'
        },
        {
            label: 'Events',
            type: 'EventsWidgetComponent',
            iconClass: 'widget-icon-events'
        }
        /*,
        {
            label: 'Statuses',
            type: 'WidgetStatusComponent',
            iconClass: 'widget-icon-statuses'
        }*/
    ];

    widgetTypesMap: any = {};

    creatingNewClipboard: boolean = false;
    FC_clipboardName: FormControl = new FormControl('', [Validators.required]);


    expandAll: boolean = false;


    constructor(
        private store: Store,
        private http: HttpService,
        private cbService: ClipboardService,
        private logger: LoggerService
    ) {
        this.widgetTypes.forEach((item: any, i: any) => {
            this.widgetTypesMap[item.type] = i;
        });
    }

    ngOnInit() {
        this.logger.ng('CLIPBOARD DRAWER onInit');

        this.subscription.add(this.resourcesLoaded$.subscribe(loaded => {
            this.logger.ng('resourcesLoaded', { loaded });
            if (loaded === true) {
                // DBFS resources loaded... need to initialize clipboard
                this.store.dispatch(new ClipboardResourceInitialize());
            }
        }));

        this.subscription.add(this.cbResourcesLoaded$.subscribe(loaded => {
            this.logger.ng('cbResourcesLoaded', { loaded });

            if (loaded === true) {
                this.cbResourcesLoaded = loaded;
                this.store.dispatch(new ClipboardLoad());
            }
        }));

        this.subscription.add(this.clipboardList$.subscribe(clipboards => {
            this.logger.ng('clipboardList', { clipboards });
            this.clipboardList = clipboards;
        }));

        this.subscription.add(this.clipboardItems$.subscribe(items => {
            this.logger.ng('clipboardItems', { items });
            this.clipboardItems = items;
        }));

        this.subscription.add(this.activeIndex$.subscribe(index => {
            this.logger.ng('activeIndex', { index });
            if (this.activeIndex !== index) {
                // reset some things
                this.itemDetailOpened = '';
                this.creatingNewClipboard = false;
            }
            this.activeIndex = index;
        }));

        this.subscription.add(this.cbService.$drawerState.subscribe(val => {
            this.logger.log('DRAWER $drawerState:change', { val });
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
        this.logger.log('pasteToDashboard', { data, index });
    }

    openDetail(id: any) {
        this.itemDetailOpened = id;
    }

    closeDetail(id: any) {
        if (this.itemDetailOpened === id) {
            this.itemDetailOpened = '';
        }
    }

    toggleDetail(id: any) {
        this.itemDetailOpened = (this.itemDetailOpened !== id) ? id : '';
    }

    // clipboard selection change
    clipboardSelectionChange(e: any) {
        this.logger.event('CLIPBOARD SELECTION CHANGE', e);

        if (e.value === '_new_') {
            // if "_new_" clipboard
            this.toggleCreateClipboard();
        } else {
            // else was an option selected
            // set new active index
            this.store.dispatch(new SetClipboardActive(e.value));
        }
    }

    // creating new clipboard
    toggleCreateClipboard() {
        if (!this.creatingNewClipboard) {
            this.FC_clipboardName.setValue('');
            this.creatingNewClipboard = true;
        } else {
            this.creatingNewClipboard = false;
        }
    }

    createClipboard() {
        let valid = this.FC_clipboardName.valid;
        if (this.FC_clipboardName.valid) {
            // CALL API
            this.store.dispatch(new ClipboardCreate(this.FC_clipboardName.value));
        } else {
            // form is not valid
            // do something??
        }
    }

    cancelCreateClipboard() {
        this.creatingNewClipboard = false;
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
