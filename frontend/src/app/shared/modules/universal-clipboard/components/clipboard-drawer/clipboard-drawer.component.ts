import { Component, HostBinding, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ClipboardService } from '../../services/clipboard.service';
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '../../../../../core/services/logger.service';
import { HttpService } from '../../../../../core/http/http.service';
import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState } from '../../../dashboard-filesystem/state';
import { ClipboardCreate, ClipboardLoad, ClipboardRemoveItems, ClipboardResourceInitialize, SetClipboardActive, UniversalClipboardState } from '../../state/clipboard.state';
import { FormControl, Validators } from '@angular/forms';
import { MatAccordion, MatExpansionPanel, MatMenuTrigger } from '@angular/material';
import { IMessage, IntercomService } from '../../../../../core/services/intercom.service';

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

    @ViewChild(MatAccordion, {read: MatAccordion}) accordion: MatAccordion;
    @ViewChildren(MatExpansionPanel, { read: MatExpansionPanel }) accordionItems: QueryList<MatExpansionPanel>;

    @ViewChild('clipboardMoreMenuTrigger', {read: MatMenuTrigger}) clipboardMoreMenuTrigger: MatMenuTrigger;
    @ViewChild('removeClipboardMenuTrigger', {read: MatMenuTrigger}) removeClipboardMenuTrigger: MatMenuTrigger;
    //@ViewChild('clipboardItemMoreMenuTrigger', {read: MatMenuTrigger}) clipboardItemMoreMenuTrigger: MatMenuTrigger;
    //@ViewChild('removeClipboardItemMenuTrigger', {read: MatMenuTrigger}) removeClipboardItemMenuTrigger: MatMenuTrigger;

    @ViewChildren('clipboardItemMoreMenuTrigger', {read: MatMenuTrigger}) cbItemMoreTriggers: QueryList<MatMenuTrigger>;
    @ViewChildren('removeClipboardItemMenuTrigger', {read: MatMenuTrigger}) cbItemRemoveTriggers: QueryList<MatMenuTrigger>;


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

    selectAll: boolean = false;
    selectAllIndeterminate: boolean = false;
    batchControlsDisabled: boolean = true;
    selectedCount: number = 0;

    selectedItems: any = {};

    constructor(
        private store: Store,
        private http: HttpService,
        private cbService: ClipboardService,
        private interCom: IntercomService,
        private logger: LoggerService
    ) {
        this.widgetTypes.forEach((item: any, i: any) => {
            this.widgetTypesMap[item.type] = i;
        });
    }

    ngOnInit() {
        this.logger.ng('CLIPBOARD DRAWER onInit');

        // check to see if DBFS resources are loaded
        this.subscription.add(this.resourcesLoaded$.subscribe(loaded => {
            this.logger.ng('resourcesLoaded', { loaded });
            if (loaded === true) {
                // DBFS resources loaded... need to initialize clipboard
                this.store.dispatch(new ClipboardResourceInitialize());
            }
        }));

        // Clipboard DBFS resource has been loaded... then load the dashboard
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

        // clipboard items === clipboard dashboard widgets
        this.subscription.add(this.clipboardItems$.subscribe(items => {
            this.logger.ng('clipboardItems', { items });

            for (let i = 0; i < items.length; i++) {
                let item: any = items[i];
                if (!this.selectedItems[item.settings.clipboardMeta.cbId]) {
                    this.selectedItems[item.settings.clipboardMeta.cbId] = false;
                }
            }
            this.clipboardItems = items;
        }));

        // active index === index of currently selected clipboard
        this.subscription.add(this.activeIndex$.subscribe(index => {
            this.logger.ng('activeIndex', { index });
            if (this.activeIndex !== index) {
                // reset some things
                this.resetVariables();
            }
            this.activeIndex = index;
        }));

        this.subscription.add(this.cbService.$drawerState.subscribe(val => {
            this.logger.log('DRAWER $drawerState:change', { val });
            this.drawerState = val;
        }));
    }

     /**
     * DRAWER ACTIONS
     */

    toggle(): void {
        const state = this.drawerState === 'closed' ? 'opened' : 'closed';
        this.cbService.setDrawerState(state);
    }

    open(): void {
        this.cbService.setDrawerState('opened');
    }

    close(): void {
        this.cbService.setDrawerState('closed');
    }

    /**
     * CLIPBOARD ACTIONS/EVENTS
     */

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

    // clipboard more menu toggle
    toggleClipboardMoreMenu() {
        if (!this.clipboardMoreMenuTrigger.menuOpen) {
            this.clipboardMoreMenuTrigger.openMenu();
        } else {
            this.clipboardMoreMenuTrigger.closeMenu();
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

    toggleRemoveClipboardConfirm() {
        if (!this.removeClipboardMenuTrigger.menuOpen) {
            this.removeClipboardMenuTrigger.openMenu();
        } else {
            this.removeClipboardMenuTrigger.closeMenu();
        }
    }

     /**
     * BATCH - CLIPBOARD LIST ACTIONS
     */

    toggleSelectAll() {

        let keys = Object.keys(this.selectedItems);
        // check the select all flag
        if (this.selectAll) {
            // everything was selected, so deselect
            for(let i = 0; i < keys.length; i++) {
                this.selectedItems[keys[i]] = false;
            }
            this.selectAll = false;
            this.selectAllIndeterminate = false;
            this.batchControlsDisabled = true;
            this.selectedCount = 0;
        } else {
            // select everything
            for(let i = 0; i < keys.length; i++) {
                this.selectedItems[keys[i]] = true;
            }
            this.selectAll = true;
            this.selectAllIndeterminate = false;
            this.batchControlsDisabled = false;
            this.selectedCount = keys.length;
        }

        this.logger.log('toggleSelectAll', {selectAll: this.selectAll});
    }

    toggleExpandAll() {
        this.logger.log('toggleExpandAll');
        if (this.expandAll) {
            // everything is expanded already, so collapse
            this.expandAll = false;
            this.accordion.closeAll();
        } else {
            // expand everything
            this.expandAll = true;
            this.accordion.openAll();
        }
    }

    createDashboardFromClipboard() {
        this.logger.log('createDashboardFromClipboard', { clipboardIndex: this.activeIndex});
        // create a dashboard from the current clipboard
        // TODO!!!
    }

    batchPasteToDashboard() {
        this.logger.log('batchPasteToDashboard', {indices: this.selectedItems});

        // get selected items
        let items = this.getSelectedItems();

        // add to dashboard somehow
        // TODO!!!
        this.interCom.requestSend(<IMessage> {
            action: 'pasteClipboardWidgets',
            id: 'clipboardWidgetsPaste',
            payload: items
        });

    }

    batchRemoveClipboardItems() {
        this.logger.log('batchRemoveClipboardItems', {indices: this.selectedItems});

        // get selected items
        let items = this.getSelectedIds();

        // call upon the state to remove
        this.store.dispatch(new ClipboardRemoveItems(items));
    }

     /**
     * CLIPBOARD ITEM ACTIONS
     */

    toggleSelectItem(event: any, item: any) {
        this.logger.log('TOGGLE SELECT ITEM', event);
        this.selectedItems[item.settings.clipboardMeta.cbId] = event.checked;

        let checked = this.getSelectedIds();

        if (checked.length === 0) {
            this.selectAll = false;
            this.selectAllIndeterminate = false;
        } else {

            if (checked.length === this.clipboardItems.length) {
                this.selectAll = true;
                this.selectAllIndeterminate = false;
            } else {
                this.selectAll = false;
                this.selectAllIndeterminate = true;
            }
        }

        this.selectedCount = checked.length;

        this.batchControlsDisabled = !((!this.selectAll && this.selectAllIndeterminate) || this.selectAll);

        this.logger.log('TOGGLE SELECT ITEM', {checked: event.checked, selectAll: this.selectAll, indeterminate: this.selectAllIndeterminate});

    }

    toggleExpandItem(expanded: boolean) {
        if (!expanded) {
            // accordion item (closed) event
            this.expandAll = false;
        } else {
            // accordion item (opened) event
            if (!this.expandAll) {
                // need to check if all are open or not
                this.logger.ng('TOGGLE EXPAND ITEM', this.accordion);
                let count = 0;
                this.accordionItems.forEach((item: MatExpansionPanel) => {
                    if (item.expanded) {
                        count++;
                    }
                });
                this.logger.ng('COUNTING ITEMS EXPANDED', {count, items: this.clipboardItems.length});
                if (count === this.clipboardItems.length) {
                    this.expandAll = true;
                }
            }
        }
    }

    toggleClipboardItemMoreMenu(dataMenuId: any) {

        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findCbItemMoreTrigger(dataMenuId);

        if (mTrigger) {
            if (!mTrigger.menuOpen) {
                mTrigger.openMenu();
            } else {
                mTrigger.closeMenu();
            }
        } else {
            this.logger.error('clipboardItemMoreMenu', 'CANT FIND TRIGGER');
        }

        this.logger.log('toggleClipboardItemMoreMenu', {
            dataMenuId,
            mTrigger
        });

    }

    toggleRemoveClipboardItemConfirm(dataMenuId: any) {

        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findCbItemRemoveTrigger(dataMenuId);

        if (mTrigger) {
            if (!mTrigger.menuOpen) {
                mTrigger.openMenu();
            } else {
                mTrigger.closeMenu();
            }
        } else {
            this.logger.error('clipboardItemRemoveMenu', 'CANT FIND TRIGGER');
        }

        this.logger.log('toggleRemoveClipboardItemConfirm', {
            dataMenuId,
            mTrigger
        });

    }

    pasteToDashboard(data: any, index: any) {
        this.logger.log('pasteToDashboard', { data, index });
        // Add item to dashboard
        // TODO!!!
        this.interCom.requestSend(<IMessage> {
            action: 'pasteClipboardWidgets',
            id: 'clipboardWidgetsPaste',
            payload: [data]
        });
    }

    removeClipboardItem(data: any, index: any) {
        this.logger.log('removeClipboardItem', {data, index});
        // remove item from clipboard
        this.store.dispatch(new ClipboardRemoveItems([data.settings.clipboardMeta.cbId]));
    }

     /**
     * PRIVATES
     */

    private resetVariables() {
        this.creatingNewClipboard = false;
        this.itemDetailOpened = '';
        this.selectedCount = 0;
        this.selectedItems = {};
        this.batchControlsDisabled = true;
    }

    // utility to find clipboard item more menu trigger
    private findCbItemMoreTrigger(id: any): MatMenuTrigger {
        const trigger = this.cbItemMoreTriggers.find(item => {
            console.log('... ITEM ...', item);
            return item.menuData.item.settings.clipboardMeta.cbId === id;
        });
        return  trigger || null;
    }

    // utility to find clipboard trash menu trigger
    private findCbItemRemoveTrigger(id: any): MatMenuTrigger {
        const trigger = this.cbItemRemoveTriggers.find(item => {
            console.log('... [r]ITEM ...', item);
            return item.menuData.item.settings.clipboardMeta.cbId === id;
        });
        return  trigger || null;
    }

    private getSelectedIds(): any[] {
        let keys = Object.keys(this.selectedItems);
        let selected = keys.filter(item => {
            return this.selectedItems[item] === true;
        });

        console.log('GET SELECTED IDS', selected);
        return selected;
    }

    private getSelectedItems(): any[] {
        let ids = this.getSelectedIds();

        let items = this.clipboardItems.filter((item: any) => {
            return ids.includes(item.settings.clipboardMeta.cbId);
        });

        console.log('GET SELECTED ITEMS', ids, items);

        return items;
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
