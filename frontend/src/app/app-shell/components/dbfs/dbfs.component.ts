import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Inject,
    OnInit,
    OnDestroy,
    Output,
    ViewChild,
    ViewChildren,
    QueryList
} from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { NavigatorPanelComponent } from '../navigator-panel/navigator-panel.component';

import { IntercomService, IMessage } from '../../../core/services/intercom.service';

import {
    Select,
    Store,
} from '@ngxs/store';

import {
    DbfsState
} from '../../state/dbfs.state';

import {
    DbfsPanelsState,
    DbfsPanelsInitialize,
    DbfsAddPanel,
    DbfsUpdatePanels,
    DbfsResetPanelAction
} from '../../state/dbfs-panels.state';

import {
    DbfsResourcesState,
    DbfsLoadResources,
    DbfsLoadSubfolder,
    DbfsLoadUsersList,
    DbfsLoadNamespacesList,
    DbfsLoadTopFolder,
    DbfsCreateFolder,
    DbfsDeleteFolder,
    DbfsUpdateFolder,
    DbfsDeleteDashboard,
    DbfsAddPlaceholderFolder,
    DbfsMoveResource
} from '../../state/dbfs-resources.state';
import { LoggerService } from '../../../core/services/logger.service';
import { MatMenuTrigger } from '@angular/material';
import { DBState, LoadDashboard } from '../../../dashboard/state';
import {
    MatTableDataSource
} from '@angular/material';


@Component({
// tslint:disable-next-line: component-selector
    selector: 'dbfs',
    templateUrl: './dbfs.component.html',
    styleUrls: ['./dbfs.component.scss']
})
export class DbfsComponent implements OnInit, OnDestroy {

    @HostBinding('class.dashboard-navigator') private _hostClass = true;

    @ViewChildren('moreMenuTrigger', {read: MatMenuTrigger}) moreTriggers: QueryList<MatMenuTrigger>;
    @ViewChildren('miniNavTrigger', {read: MatMenuTrigger}) miniNavTriggers: QueryList<MatMenuTrigger>;


    // Subscriptions
    private subscription: Subscription = new Subscription();

    // State
    @Select(DbfsState.getLoadedDashboardId) loadedDashboardId$: Observable<any>;
    loadedDashboardId: any = '';

    @Select(DbfsState.getUser()) user$: Observable<any>;
    user: any = {};

    @Select(DbfsResourcesState.getFolderResources) folders$: Observable<any>;
    folders: any = {};

    @Select(DbfsResourcesState.getFileResources) files$: Observable<any>;
    files: any = {};

    @Select(DbfsResourcesState.getDynamicLoaded) dynamicLoaded$: Observable<any>;
    // tslint:disable-next-line: no-inferrable-types
    usersListLoaded: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    namespacesListLoaded: boolean = false;

    @Select(DbfsResourcesState.getNamespacesList) namespacesData$: Observable<any[]>;
    namespacesList: any[] = [];
    namespacesDataSource = new MatTableDataSource([]);
    namespaceFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getUsersList) usersData$: Observable<any[]>;
    usersList: any[] = [];
    usersDataSource = new MatTableDataSource([]);
    usersFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    @Select(DbfsResourcesState.getResourceAction) resourceAction$: Observable<any>;

    @Select(DbfsPanelsState.getPanels) panels$: Observable<any[]>;
    panels: any[] = [];

    panelResources: any[] = [];

    @Select(DbfsPanelsState.getCurPanel) currentPanelIndex$: Observable<number>;
    // tslint:disable-next-line: no-inferrable-types
    currentPanelIndex: number = 0;

    @Select(DbfsPanelsState.getPanelAction) panelAction$: Observable<any>;

    @Select(DBState.getDashboardId) curDashboardId$: Observable<any>;
    curDashboardId: any = false;

    // VIEW CHILDREN
    @ViewChild(NavigatorPanelComponent) private navPanel: NavigatorPanelComponent;

    // Inputs
    // tslint:disable-next-line:no-inferrable-types
    @Input() activeNavSection: string = '';
    @Input() drawerMode: any = 'over';

    // tslint:disable-next-line:no-inferrable-types
    @Input() activeMediaQuery: string = '';

    // Outputs
    @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();

    /* FORM GROUP STUFF */
    fileForm: FormGroup;
    folderForm: FormGroup;

    // tslint:disable-next-line: no-inferrable-types
    bulkEdit: boolean = false;
    edit: any = {
        mode: '',
        panel: '',
        id: ''
    };

    loadingItem: any = '';

    foldersToRemove: any[] = [];

    menuOpened: any = -1;

    folderMenuTrigger: any;

    menuIsOpen: any = false;
    miniNavOpen: any = false;

    constructor(
        private store: Store,
        private interCom: IntercomService,
        private router: Router,
        private logger: LoggerService,
        private fb: FormBuilder,
        @Inject('WINDOW') private window: any
    ) { }

    ngOnInit() {
        this.folderForm = this.fb.group({
            fc_FolderName: new FormControl('', [Validators.required])
        });

        const self = this;

        this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
            if (loaded === false) {
                // should be triggered by app-shell/container
                // this.store.dispatch(new DbfsLoadResources());
            }
            if (loaded === true) {
                this.store.dispatch(new DbfsPanelsInitialize());
            }
        }));

        this.subscription.add(this.loadedDashboardId$.subscribe( id => {
            this.loadedDashboardId = id;
        }));

        this.subscription.add(this.user$.subscribe( user => {
            this.user = user;
        }));

        this.subscription.add(this.folders$.subscribe( folders => {
            this.folders = folders;
        }));

        this.subscription.add(this.files$.subscribe( files => {
            this.files = files;
        }));

        this.subscription.add(this.panels$.subscribe( panels => {
            this.panels = panels;
            this.resetForms(); // reset forms if you switch panels
        }));

        this.subscription.add(this.currentPanelIndex$.subscribe( idx => {
            this.currentPanelIndex = idx;
        }));

        this.subscription.add(this.dynamicLoaded$.subscribe( loaded => {
            this.usersListLoaded = loaded.users;
            this.namespacesListLoaded = loaded.namespaces;
        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            // this.logger.log('NAMESPACES', {namespaces});
            this.namespacesList = namespaces;
            this.namespacesDataSource = new MatTableDataSource(this.namespacesList);
            this.namespacesDataSource.filterPredicate = (data: any, filter: string) => {
                return data.name.toLowerCase().includes(filter);
            };

        }));

        this.subscription.add(this.usersData$.subscribe( users => {
            //this.logger.log('USERS', {users});
            this.usersList = users;
            this.usersDataSource = new MatTableDataSource(this.usersList);
        }));

        this.subscription.add(this.resourceAction$.subscribe( action => {
            // this.logger.log('RESOURCE ACTION', action);
            switch (action.method) {
                case 'gotoFolder':
                    this.gotoFolder(action.args);
                    break;
                case 'createFolderSuccess':
                    this.resetEdit();
                    break;
                case 'batchRemoveFoldersComplete':
                    this.foldersToRemove = [];
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.panelAction$.subscribe( action => {

            // this.logger.log('PANEL ACTION', action);
            switch (action.method) {
                case 'goNextPanel':
                    setTimeout(function() {
                        this.navPanel.goNext();
                        this.resetDataSourceFilters();
                    }.bind(this), 200);
                    break;
                case 'loadSubFolder':
                    setTimeout(function() {
                        this.loadingItem = '';
                        this.navPanel.goNext(function() {
                            this.store.dispatch(
                                new DbfsLoadSubfolder(action.path, {})
                            );
                        }.bind(this));
                    }.bind(this), 200);
                    break;
                case 'loadTopFolder':
                    setTimeout(function() {
                        this.loadingItem = '';
                        this.navPanel.goNext(function() {
                            this.store.dispatch(
                                new DbfsLoadTopFolder(action.type, action.key, {})
                            );
                        }.bind(this));
                    }.bind(this), 200);
                    break;
                case ':list-users:':
                    setTimeout(function() {
                        this.resetDataSourceFilters();
                        this.navPanel.goNext(this.loadAllUsersPanel.bind(this));
                    }.bind(self), 200);
                    break;
                case ':list-namespaces:':
                    setTimeout(function() {
                        this.resetDataSourceFilters();
                        this.navPanel.goNext(this.loadAllNamespacesPanel.bind(this));
                    }.bind(self), 200);
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.curDashboardId$.subscribe(id => {
            this.curDashboardId = id;
        }));

        // INTERCOM SUBSCRIPTION
        this.subscription.add(this.interCom.requestListen().subscribe((message: IMessage) => {
            // intercom stuff
        }));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /* UTILS */
    getPanelContext(path: string, panelIndex: number) {
        const panel = this.store.select(DbfsResourcesState.getFolderResource(path));
        return panel;
    }

    getResource(path: string, type?: string) {
        const resource = this.store.selectSnapshot<any>(DbfsResourcesState.getFolderResource(path));
        return resource;
    }

    resetForms() {
        //this.logger.log('RESET FORMS');
        this.foldersToRemove = [];
        this.bulkEdit = false;
        this.resetEdit();
    }

    resetEdit() {
        this.edit = {
            mode: '',
            panel: '',
            id: ''
        };
        this.folderForm.reset({fc_FolderName: ''});
    }

    findMoreMenuTrigger(id: any, type: any): MatMenuTrigger {
        const trigger = this.moreTriggers.find(item => {
            return item.menuData.type === type && item.menuData.data.id === id;
        });
        return  trigger || null;
    }

    findMiniNavTrigger(id: any, type: any): MatMenuTrigger {
        const trigger = this.miniNavTriggers.find(item => {
            return item.menuData.type === type && item.menuData.data.id === id;
        });
        return  trigger || null;
    }

    menuState(item: any, miniNav?: boolean) {
        // this._menuOpened = state;
        if (!miniNav) {
            this.menuIsOpen = item;
        } else {
            this.miniNavOpen = item;
        }
    }

    miniNavClosed(event: any) {
        // this.logger.log('MINI NAV CLOSED', event);
        this.miniNavOpen = false;
    }

    miniNavCancel(event: any) {
        // this.logger.log('MINI NAV CANCEL', event);
        const trigger: MatMenuTrigger = this.findMiniNavTrigger(event.id, event.type);
        trigger.closeMenu();
    }

    miniNavSelected(event: any) {
        // this.logger.log('MINI NAV SELECTED', event);
        switch (event.action) {
            case 'miniNavMove':
                this.store.dispatch(
                    new DbfsMoveResource(event.payload.sourceId, event.payload.destinationId, event.payload.originPath, {})
                );
                break;
            default:
                break;
        }
    }


    /* behaviors */

    closeDrawer() {
        // this.logger.log('CLOSE DRAWER');
        const data: any = {
            closeNavigator: true
        };
        if (this.activeMediaQuery === 'xs') {
            data.resetForMobile = true;
        }
        this.toggleDrawer.emit(data);
    }

    clickMoreMenu(id: number, type: string, event: any) {
        // this.logger.log('CLICK MORE MENU', { id, type, event});
        event.stopPropagation();
        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findMoreMenuTrigger(id, type);
        // console.log('TRIGGERs', this.moreTriggers);
        if (mTrigger) {
            mTrigger.toggleMenu();
        } else {
            this.logger.error('clickMoreMenu', 'CANT FIND TRIGGER');
        }
    }

    clickMoveMenu(id: number, type: string, event: any) {
        // this.logger.log('CLICK MOVE MENU', { id, type, event});
        event.stopPropagation();
        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findMiniNavTrigger(id, type);
        // console.log('TRIGGERs', this.miniNavTriggers);
        if (mTrigger) {
            mTrigger.toggleMenu();
            // close the more menu
            this.clickMoreMenu(id, type, event);
        } else {
            this.logger.error('clickFolderMove', 'CANT FIND TRIGGER');
        }
    }

    applyNamespacesListFilter(filterValue: string) {
        this.namespacesDataSource.filter = filterValue.trim().toLowerCase();
        // this.logger.log('APPLY NAMESPACES FILTER', {filterValue, dataSource: this.namespacesDataSource});
    }

    applyUsersListFilter(filterValue: string) {
        this.usersDataSource.filter = filterValue.trim().toLowerCase();
        // this.logger.log('APPLY USERS FILTER', {filterValue, dataSource: this.usersDataSource});
    }

    resetDataSourceFilters() {
        this.namespacesDataSource.filter = '';
        this.usersDataSource.filter = '';
    }

    // DYNAMIC FOLDER BEHAVIOR

    loadAllNamespacesPanel() {
        // this.logger.log('LOAD ALL NAMESPACES PANEL');
        if (!this.namespacesListLoaded) {
            this.store.dispatch(
                new DbfsLoadNamespacesList({})
            );
        }
    }

    loadAllUsersPanel() {
        // this.logger.log('LOAD ALL USERS PANEL');
        if (!this.usersListLoaded) {
            this.store.dispatch(
                new DbfsLoadUsersList({})
            );
        }
    }

    // FOLDER BEHAVIORS
    editFolders() {
        // this.logger.log('BULK EDIT FOLDERS');
        this.bulkEdit = true;
    }

    doneEditFolders() {
        // this.logger.log('BULK EDIT DONE');
        this.bulkEdit = false;
        this.foldersToRemove = [];
    }

    createFolder() {
        // this.logger.log('CREATE FOLDER');
        this.folderForm.reset({fc_FolderName: ''});
        this.edit = {
            mode: 'create',
            panel: this.currentPanelIndex,
            id: ''
        };
    }

    cancelCreateFolder() {
        //this.logger.log('CANCEL CREATE FOLDER');
        this.resetEdit();
    }

    removeFolders() {
        // this.logger.log('REMOVE FOLDERS');
        this.store.dispatch(
            new DbfsDeleteFolder(
                this.foldersToRemove,
                {
                    method: 'batchRemoveFoldersComplete'
                }
            )
        );
    }

    folderCheckboxChange(folder: string, event: any) {
        // this.logger.log('FOLDER CHECKBOX CHANGE', { folder, event });
        const idx = this.foldersToRemove.indexOf(folder);
        if (idx === -1) {
            // not found, so add it
            this.foldersToRemove.push(folder);
        } else {
            // remove
            this.foldersToRemove.splice(idx, 1);
        }
        // console.log('FOLDERS TO REMOVE', this.foldersToRemove);
    }

    folderInputSave(panelIndex: number, folder?: any) {
        //console.log('FOLDER INPUT SAVE', panelIndex, folder);
        if (this.folderForm.invalid) {
            return;
        }
        const panelFolder = this.folders[this.panels[panelIndex].folderResource];
        const resourceAction: any = {};

        // this covers everything needed for edit.mode = 'new'
        const payload: any = {
            name: this.folderForm.controls.fc_FolderName.value,
            parentId: panelFolder.id
        };

        if (this.edit.mode === 'create') {
            resourceAction.method = 'createFolderSuccess';
            this.store.dispatch(
                new DbfsCreateFolder(
                    payload,
                    resourceAction
                )
            );
        }

        if (this.edit.mode === 'edit') {
            payload.id = folder.id;
            resourceAction.method = 'editFolderSuccess';
            this.resetEdit();
            this.store.dispatch(
                new DbfsUpdateFolder(
                    payload,
                    folder.fullPath,
                    resourceAction
                )
            );

        }

    }

    // FILE (Dashboard) BEHAVIORS

    createDashboard() {
        // this.logger.log('CREATE DASHBOARD');
        this.router.navigate(['d', '_new_']);
        this.closeDrawer();
    }

    navigateToDashboard(path: string) {
        //this.logger.log('NAVIGATE TO DASHBOARD', { path });
    }



    // MORE MENU BEHAVIORS

    folderMenuAction(action: string, folder: any, event?: any) {
        // this.logger.log('FOLDER MENU ACTION', {action, folder, event});
        switch (action) {
            case 'editName':
                this.folderForm.reset({fc_FolderName: folder.name});
                this.edit = {
                    mode: 'edit',
                    panel: this.currentPanelIndex,
                    id: folder.id
                };
                break;
            case 'moveFolder':
                this.clickMoveMenu(folder.id, 'folder', event);
                break;
            case 'deleteFolder':
                this.store.dispatch(
                    new DbfsDeleteFolder(
                        [folder.fullPath],
                        {
                            method: 'removeFolderComplete'
                        }
                    )
                );
                break;
            default:
                break;
        }
    }

    fileMenuAction(action: string, file: any, event?: any) {
        // this.logger.log('FOLDER MENU ACTION', {action, file, event});
        switch (action) {
            case 'openNewTab':
                this.window.open('/d' + file.path, '_blank');
                break;
            case 'moveDashboard':
                this.clickMoveMenu(file.id, 'file', event);
                break;
            case 'deleteDashboard':
                this.store.dispatch(
                    new DbfsDeleteDashboard(
                        file.fullPath,
                        {
                            method: 'removeFileComplete'
                        }
                    )
                );
                break;
            case 'navigateTo':
                if (this.activeMediaQuery === 'xs') {
                    this.toggleDrawer.emit({
                        closeNavigator: true,
                        resetForMobile: true
                    });
                }
                break;
            default:
                break;
        }
    }

    // PANEL NAVIGATION BEHAVIORS

    navtoSpecificPanel(idx: number, fromIdx: number) {
        // console.log('NAV TO SPECIFIC FOLDER [GO BACK X]');
        // const idx = this.panels.indexOf(folder);

        this.currentPanelIndex = idx;
        const _panels = JSON.parse(JSON.stringify(this.panels));
        _panels.splice((idx + 1), (fromIdx - idx) - 1);
        this.navPanel.shiftTo(idx, idx + 1, () => {
            _panels.splice(idx + 1);
            this.store.dispatch(
                new DbfsUpdatePanels({
                    panels: _panels,
                    currentPanelIndex: this.currentPanelIndex
                })
            );
            this.resetDataSourceFilters();
        });
    }

    navtoMasterPanel() {
        //this.logger.log('NAV TO MASTER PANEL');
        if (this.currentPanelIndex > 0) {
            this.navtoSpecificPanel(0, this.currentPanelIndex);
            this.resetDataSourceFilters();
        }
    }

    gotoFolder(path: string) {
        if (!this.bulkEdit) {
            //this.logger.log('GOTO FOLDER', { path });
            const folder = this.store.selectSnapshot<any>(DbfsResourcesState.getFolderResource(path));

            const panel = <any>{
                folderResource: folder.fullPath
            };

            const panelAction: any = {
                method: 'goNextPanel'
            };

            if (folder.synthetic) {
                panel.synthetic = folder.synthetic;
            }

            if (folder.root) {
                panel.root = folder.root;
            }

            if (folder.ownerType === 'dynamic') {
                panel.dynamic = true;
                panel.locked = true;
                panelAction.method = panel.folderResource;
            }

            if (folder.trashFolder) {
                panel.trashFolder = true;
            }

            if (!folder.loaded && !folder.synthetic) {
                panelAction.method = (folder.topFolder) ? 'loadTopFolder' : 'loadSubFolder';
                panelAction.path = folder.fullPath;
                if (folder.topFolder) {
                    panelAction.type = folder.ownerType;
                    panelAction.key = folder[panelAction.type];
                }
            }

            if (folder.locked) {
                panel.locked = true;
            }

            // add panel
            this.store.dispatch(
                new DbfsAddPanel({
                    panel,
                    panelAction
                })
            );

        }
    }

    gotoTopFolder(key: string, type: string) {

        // check if folder exists
        const path = '/' + type + '/' + key;
        const folder = this.store.selectSnapshot<any>(DbfsResourcesState.getFolderResource(path));

        this.loadingItem = key;

        if (folder.notFound) {
            setTimeout(function() {
                this.store.dispatch(
                    new DbfsAddPlaceholderFolder(
                        path,
                        {
                            method: 'gotoFolder',
                            args: path
                        }
                    )
                );
            }.bind(this), 200);

        } else {
            setTimeout(function() {
                this.gotoFolder(path);
            }.bind(this), 200);
        }
    }

}
