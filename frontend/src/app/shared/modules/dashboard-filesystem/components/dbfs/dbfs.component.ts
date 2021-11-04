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

import { NavigatorPanelComponent } from '../../../../../app-shell/components/navigator-panel/navigator-panel.component';

import { IMessage, IntercomService } from '../../../../../core/services/intercom.service';

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
    DbfsChangePanelTab
} from '../../state/dbfs-panels.state';
import {
    DbfsResourcesState,
    DbfsLoadSubfolder,
    DbfsLoadUsersList,
    DbfsLoadNamespacesList,
    DbfsLoadTopFolder,
    DbfsCreateFolder,
    DbfsDeleteFolder,
    DbfsUpdateFolder,
    DbfsDeleteDashboard,
    DbfsAddPlaceholderFolder,
    DbfsMoveResource,
    DbfsLoadUserFavorites,
    DbfsLoadUserRecents,
    DbfsRemoveUserFav,
    DbfsAddUserFav
} from '../../state/dbfs-resources.state';

import { MatMenuTrigger } from '@angular/material';
import { DBState, LoadDashboard } from '../../../../../dashboard/state';
import {
    MatTableDataSource
} from '@angular/material';

@Component({
// tslint:disable-next-line: component-selector
    selector: 'dbfs',
    templateUrl: './dbfs.component.html',
    styleUrls: ['./dbfs.component.scss'],
    host: {
        '[class.dashboard-navigator]': 'true',
        '[class.panel-content]': 'true'
    }
})
export class DbfsComponent implements OnInit, OnDestroy {

    @HostBinding('class.dashboard-version-history') private _hostClass = true;

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
    // tslint:disable-next-line: no-inferrable-types
    userFavoritesListLoaded: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    userFrequentListLoaded: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    userRecentListLoaded: boolean = false;

    @Select(DbfsResourcesState.getNamespacesList) namespacesData$: Observable<any[]>;
    namespacesList: any[] = [];
    namespacesDataSource = new MatTableDataSource([]);
    namespaceFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getUsersList) usersData$: Observable<any[]>;
    usersList: any[] = [];
    usersDataSource = new MatTableDataSource([]);
    usersFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getUserFavorites) userFavorites$: Observable<any[]>;
    userFavorites: any[] = [];
    userFavoritesDataSource = new MatTableDataSource([]);
    userFavoritesFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getUserRecents) userRecents$: Observable<any[]>;
    userRecents: any[] = [];
    userRecentsDataSource = new MatTableDataSource([]);
    userRecentsFilter: FormControl = new FormControl('');

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    @Select(DbfsResourcesState.getResourceAction) resourceAction$: Observable<any>;

    @Select(DbfsPanelsState.getPanels) panels$: Observable<any[]>;
    panels: any[] = [];

    panelResources: any[] = [];

    @Select(DbfsPanelsState.getCurPanel) currentPanelIndex$: Observable<number>;
    // tslint:disable-next-line: no-inferrable-types
    currentPanelIndex: number = 0;

    @Select(DbfsPanelsState.getPanelAction) panelAction$: Observable<any>;

    @Select(DbfsPanelsState.getPanelTab) panelTab$: Observable<any>;
    currentPanelTab: any = '';

    @Select(DbfsState.getLoadedDashboardId) curDashboardId$: Observable<any>;
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

    dynamicFolderPaths: any[] = [
      ':list-users:',
      ':list-namespaces:',
      ':user-favorites:',
      ':user-frequent:',
      ':user-recent:'
    ];

    curDashboardId$$: Subscription;

    constructor(
        private store: Store,
        private interCom: IntercomService,
        private router: Router,
        private fb: FormBuilder,
        @Inject('WINDOW') private window: any
    ) {

    }

    ngOnInit() {
        this.folderForm = this.fb.group({
            fc_FolderName: new FormControl('', [Validators.required])
        });

        const self = this;

        this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
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

        this.subscription.add(this.panelTab$.subscribe( tab => {
            this.currentPanelTab = tab;
        }));

        this.subscription.add(this.dynamicLoaded$.subscribe( loaded => {
            this.usersListLoaded = loaded.users;
            this.namespacesListLoaded = loaded.namespaces;
        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            this.namespacesList = namespaces;
            this.namespacesDataSource = new MatTableDataSource(this.namespacesList);
            this.namespacesDataSource.filterPredicate = (data: any, filter: string) => {
                return data.name.toLowerCase().includes(filter);
            };

        }));

        this.subscription.add(this.usersData$.subscribe( users => {
            this.usersList = users;
            this.usersDataSource = new MatTableDataSource(this.usersList);
        }));

        this.subscription.add(this.userFavorites$.subscribe( favorites => {
            this.userFavorites = (favorites) ? favorites : [];
            this.userFavoritesDataSource = new MatTableDataSource(this.userFavorites);
            this.userFavoritesDataSource.filterPredicate = (data: any, filter: string) => {
                return data.name.toLowerCase().includes(filter);
            };
        }));

        this.subscription.add(this.userRecents$.subscribe( recents => {
            this.userRecents = (recents) ? recents : [];
            this.userRecentsDataSource = new MatTableDataSource(this.userRecents);
            this.userRecentsDataSource.filterPredicate = (data: any, filter: string) => {
                return data.name.toLowerCase().includes(filter);
            };
        }));

        this.subscription.add(this.resourceAction$.subscribe( action => {
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
                case 'changePanelTab':
                    this.resetDataSourceFilters();
                    switch (action.tab) {
                      case 'favorites':
                          setTimeout(function() {
                              this.navPanel.resetTo(0, this.loadUserFavoritesPanel.bind(this));
                          }.bind(self), 100);
                          break;
                      case 'recent':
                          setTimeout(function() {
                              this.navPanel.resetTo(0, this.loadUserRecentPanel.bind(this));
                          }.bind(self), 100);
                          break;
                      case 'users':
                            if (this.usersListLoaded) {
                                // they have been loaded, so just switch to the panel
                                this.navPanel.resetTo(action.startIndex);
                            } else {
                                setTimeout(function() {
                                    // they have NOT been loaded, so reset panel to 0, then load the data
                                    this.navPanel.resetTo(0, this.loadAllUsersPanel.bind(this));
                                }.bind(self), 100);
                            }
                          break;
                      case 'namespaces':
                            if (this.namespacesListLoaded) {
                                // they have been loaded, so just switch to the panel
                                this.navPanel.resetTo(action.startIndex);
                            } else {
                                // they have NOT been loaded, so reset panel to 0, then load the data
                                setTimeout(function() {
                                    this.navPanel.resetTo(0, this.loadAllNamespacesPanel.bind(this));
                                }.bind(self), 100);
                            }
                          break;
                      default:
                          // default is 'personal' tab
                          this.navPanel.resetTo(action.startIndex);
                          break;
                    }
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.curDashboardId$.subscribe(db => {
            this.curDashboardId = (db) ? db : false;
        }));

        this.subscription.add(this.interCom.requestListen().subscribe((message: IMessage) => {
            switch (message.action) {
                case 'changeToSpecificNamespaceView':
                    this.changeToSpecificNamespaceView(message.payload);
                    break;
                case 'changeToSpecificUserView':
                    this.changeToSpecificUserView(message.payload);
                    break;
            }
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
        this.miniNavOpen = false;
    }

    miniNavCancel(event: any) {
        const trigger: MatMenuTrigger = this.findMiniNavTrigger(event.id, event.type);
        trigger.closeMenu();
    }

    miniNavSelected(event: any) {
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
        const data: any = {
            closeNavigator: true
        };
        if (this.activeMediaQuery === 'xs') {
            data.resetForMobile = true;
        }
        this.toggleDrawer.emit(data);
    }

    clickMoreMenu(id: number, type: string, event: any) {
        event.stopPropagation();
        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findMoreMenuTrigger(id, type);

        if (mTrigger) {
            mTrigger.toggleMenu();
        } else {
            console.group(
                '%cERROR%cclickMoreMenu',
                'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
                'color: #ff0000; padding: 4px 8px; font-weight: bold'
            );
            console.log('%cErrorMsg', 'font-weight: bold;', 'CANT FIND TRIGGER');
            console.groupEnd();
        }
    }

    clickMoveMenu(id: number, type: string, event: any) {
        event.stopPropagation();
        const mTrigger: MatMenuTrigger = <MatMenuTrigger>this.findMiniNavTrigger(id, type);
        if (mTrigger) {
            mTrigger.toggleMenu();
            // close the more menu
            this.clickMoreMenu(id, type, event);
        } else {
            console.group(
                '%cERROR%cclickFolderMove',
                'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
                'color: #ff0000; padding: 4px 8px; font-weight: bold'
            );
            console.log('%cErrorMsg', 'font-weight: bold;', 'CANT FIND TRIGGER');
            console.groupEnd();
        }
    }

    applyNamespacesListFilter(filterValue: string) {
        this.namespacesDataSource.filter = filterValue.trim().toLowerCase();
    }

    applyUsersListFilter(filterValue: string) {
        this.usersDataSource.filter = filterValue.trim().toLowerCase();
    }

    applyUserFavoritesFilter(filterValue: string) {
        this.userFavoritesDataSource.filter = filterValue.trim().toLowerCase();
    }

    applyUserRecentsFilter(filterValue: string) {
        this.userRecentsDataSource.filter = filterValue.trim().toLowerCase();
    }

    resetDataSourceFilters() {
        this.namespacesDataSource.filter = '';
        this.usersDataSource.filter = '';
        this.userFavoritesDataSource.filter = '';
        this.userRecentsDataSource.filter = '';
    }

    // DYNAMIC FOLDER BEHAVIOR

    loadAllNamespacesPanel(callback?: any) {
        if (!this.namespacesListLoaded) {
            this.store.dispatch(
                new DbfsLoadNamespacesList({})
            ).subscribe(() => {
                if (callback) {
                    callback();
                }
            });
        } else {
            if (callback) {
                callback();
            }
        }
    }

    loadAllUsersPanel(callback?: any) {
        if (!this.usersListLoaded) {
            this.store.dispatch(
                new DbfsLoadUsersList({})
            ).subscribe(() => {
                if (callback) {
                    callback();
                }
            });
        } else {
            if (callback) {
                callback();
            }
        }
    }

    loadUserFavoritesPanel() {
        if (!this.userFavoritesListLoaded) {
            this.store.dispatch(
                new DbfsLoadUserFavorites(null, {})
            );
        }
    }

    loadUserRecentPanel() {
        if (!this.userRecentListLoaded) {
            this.store.dispatch(
                new DbfsLoadUserRecents(null, null, {})
            );
        }
    }

    // FOLDER BEHAVIORS
    editFolders() {
        this.bulkEdit = true;
    }

    doneEditFolders() {
        this.bulkEdit = false;
        this.foldersToRemove = [];
    }

    createFolder() {
        this.folderForm.reset({fc_FolderName: ''});
        this.edit = {
            mode: 'create',
            panel: this.currentPanelIndex,
            id: ''
        };
    }

    cancelCreateFolder() {
        this.resetEdit();
    }

    removeFolders() {
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
        const idx = this.foldersToRemove.indexOf(folder);
        if (idx === -1) {
            // not found, so add it
            this.foldersToRemove.push(folder);
        } else {
            // remove
            this.foldersToRemove.splice(idx, 1);
        }
    }

    folderInputSave(panelIndex: number, folder?: any) {
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
        this.router.navigate(['d', '_new_']);
        this.closeDrawer();
    }

    /* NOTE: Do we need? maybe in future?
    editDashboards() {

    }

    navigateToDashboard(path: string) {

    }*/

    // MORE MENU BEHAVIORS

    favoriteMenuAction(action: string, data: any, event?: any) {
        switch (action) {
            case 'removeFromFavorites':
                this.store.dispatch(
                    new DbfsRemoveUserFav(
                        data,
                        {
                            method: 'removeFavoriteComplete'
                        }
                    )
                );
                break;
            default:
                break;
        }
    }

    folderMenuAction(action: string, folder: any, event?: any) {
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
            case 'favoriteDashboard':
                const time = Date.now();
                this.store.dispatch(
                    new DbfsAddUserFav({
                        id: file.id,
                        name: file.name,
                        path: file.path,
                        fullPath: file.fullPath,
                        type: 'DASHBOARD',
                        createdTime: time,
                        createdBy: this.user.userid,
                        updatedTime: time,
                        updatedBy: this.user.userid,
                        favoritedTime: time
                    }, {})
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
        if (this.currentPanelIndex > 0) {
            this.navtoSpecificPanel(0, this.currentPanelIndex);
            this.resetDataSourceFilters();
        }
    }

    navtoPanelTab(tab: string) {
        // if same tab, don't do anything
        if (this.currentPanelTab === 'tab') {
            return;
        }

        let action: any;

        // switch panel roots (AKA tabs)
        switch (tab) {
            case 'favorites':
                action = this.store.dispatch(new DbfsChangePanelTab({
                    panelTab: tab,
                    panelAction: {
                        method: 'changePanelTab',
                        tab
                    }
                }));
                break;
            case 'recent':
                action = this.store.dispatch(new DbfsChangePanelTab({
                    panelTab: tab,
                    panelAction: {
                        method: 'changePanelTab',
                        tab
                    }
                }));
                break;
            case 'users':
                action = this.store.dispatch(new DbfsChangePanelTab({
                    panelTab: tab,
                    panelAction: {
                        method: 'changePanelTab',
                        tab
                    }
                }));
                break;
            case 'namespaces':
                action = this.store.dispatch(new DbfsChangePanelTab({
                    panelTab: tab,
                    panelAction: {
                        method: 'changePanelTab',
                        tab
                    }
                }));
                break;
            default:
                // default is 'personal'
                action = this.store.dispatch(new DbfsChangePanelTab({
                    panelTab: tab,
                    panelAction: {
                        method: 'changePanelTab',
                        tab
                    }
                }));
                break;
        }
        return action;
    }

    gotoFolder(path: string) {
        if (!this.bulkEdit) {
            const folder = this.store.selectSnapshot<any>(DbfsResourcesState.getFolderResource(path));

            if (folder.fullPath === ':user-recent:' || folder.fullPath === ':user-favorites:') {
                if (folder.fullPath === ':user-recent:') {
                  this.navtoPanelTab('recent');
                } else {
                  this.navtoPanelTab('favorites');
                }
            } else {

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

    // privates
    private changeToSpecificNamespaceView(nsAlias: string) {
        this.navtoPanelTab('namespaces').subscribe(() => {
            if (nsAlias !== 'namespaceList') {
                setTimeout(() => {
                    this.gotoTopFolder(nsAlias, 'namespace')
                }, 100);
            }
        });
    }

    private changeToSpecificUserView(userAlias: string) {
        this.navtoPanelTab('users').subscribe(() => {
            if (userAlias !== 'userList') {
                setTimeout(() => {
                    this.gotoTopFolder(userAlias, 'user')
                }, 100);
            }
        });
    }

}
