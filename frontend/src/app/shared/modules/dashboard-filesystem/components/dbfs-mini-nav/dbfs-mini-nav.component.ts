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
    OnInit,
    OnDestroy,
    Output,
    ViewChild,
    ChangeDetectorRef,
    ViewEncapsulation
} from '@angular/core';

import { Observable, Subscription, of } from 'rxjs';

import { NavigatorPanelComponent } from '../../../../../app-shell/components/navigator-panel/navigator-panel.component';

import {
    DbfsResourcesState,
    DbfsLoadResources,
    DbfsState,
    DbfsLoadSubfolderSuccess
} from '../../state';

import {
    Select,
    Store
} from '@ngxs/store';
import { DbfsUtilsService } from '../../services/dbfs-utils.service';
import { DbfsService } from '../../services/dbfs.service';
import { catchError, map } from 'rxjs/operators';
import { UtilsService } from '../../../../../core/services/utils.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '../../../../../core/services/config.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dbfs-mini-nav',
    templateUrl: './dbfs-mini-nav.component.html',
    styleUrls: ['./dbfs-mini-nav.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DbfsMiniNavComponent implements OnInit, OnDestroy {

    @HostBinding('class.mini-navigator-component') private _hostClass = true;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() mode: string = 'move'; // options: move, select, save
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() path: string = '';
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() type: string = 'folder'; // 'folder' or 'file'

    @Output() directorySelected: any = new EventEmitter<any>();
    @Output() navigationCancel: any = new EventEmitter<any>();

    // VIEW CHILDREN
    @ViewChild(NavigatorPanelComponent, { static: true }) private navPanel: NavigatorPanelComponent;

    // SUBSCRIPTIONS
    private subscription: Subscription = new Subscription();

    // STATE
    panels: any[] = [];
    panelIndex: number = 0;

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<boolean>;

    resourceLoadedSub: Subscription;

    @Select(DbfsState.getUser()) user$: Observable<any>;
    user: any = {};

    folders: any = {};

    selected: any = false;
    moveTargetPath: any = false;

    originDetails: any = {};

    get currentPanelName(): string {
        if (this.panels.length > 0) {
            const panel = this.panels[this.panelIndex];
            return panel.name;
        }
        return '';
    }

    get moveEnabled(): boolean {
        if (this.mode === 'move') {
            if (!this.panels[this.panelIndex].moveEnabled) {
                if (this.selected && this.selected.split('/').length >= 3) {
                    return true;
                }
            }
            return this.panels[this.panelIndex].moveEnabled;
        }
        return false;
    }

    get selectEnabled(): boolean {
        if (this.mode === 'select') {
            if (!this.panels[this.panelIndex].selectEnabled) {
                if (this.selected && this.folders[this.selected].selectEnabled) {
                    return true;
                }
            }
            return this.panels[this.panelIndex].selectEnabled;
        }
        return false;
    }

    get saveEnabled(): boolean {
        if (this.mode === 'save') {
            if (!this.panels[this.panelIndex].selectEnabled) {
                if (this.selected && this.folders[this.selected].selectEnabled) {
                    return true;
                }
            }
            return this.panels[this.panelIndex].selectEnabled;
        }
        return false;
    }

    constructor(
        private store: Store,
        private dbfsUtils: DbfsUtilsService,
        private utils: UtilsService,
        private service: DbfsService,
        private cdref: ChangeDetectorRef,
        private appConfig: AppConfigService,
        private http: HttpClient
    ) { }

    ngOnInit() {

        this.subscription.add(this.user$.subscribe( user => {
            this.user = user;
        }));

        this.resourceLoadedSub = this.resourcesLoaded$.subscribe( loaded => {
            if (loaded === false) {
                this.store.dispatch(new DbfsLoadResources());
            }
            if (loaded === true) {
                this.miniNavInit();
                if (this.resourceLoadedSub) {
                    this.resourceLoadedSub.unsubscribe();
                }
            }
        });


    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /* INIT MINI NAV */
    private miniNavInit() {

        let resetToRoot = false;
        let initialPath = this.path;
        if (initialPath === '' && this.mode === 'save') {
            resetToRoot = true;
            initialPath = '/user/'+this.user.alias;
        }

        // setup origin details
        const pathDetails = this.dbfsUtils.detailsByFullPath(initialPath);
        if (this.type === 'file') {
            this.originDetails = this.store.selectSnapshot(DbfsResourcesState.getFile(initialPath));
        } else {
            this.originDetails = this.store.selectSnapshot(DbfsResourcesState.getFolder(initialPath));
        }

        // setup root panel
        const miniRoot = this.store.selectSnapshot(DbfsResourcesState.getFolder(':mini-root:'));
        const miniRootPanel = this.dbfsUtils.normalizePanelFolder(miniRoot, false, false);
        this.panels.push(miniRoot);
        this.folders[miniRootPanel.fullPath] = miniRootPanel; // cache it

        miniRootPanel.subfolders.forEach((item) => {
            const enabled = (item.split('/').length > 2);
            const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
            const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, enabled, enabled);
            this.folders[folderPanel.fullPath] = folderPanel;
        });

        const userFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder(miniRoot.subfolders[0]));

        // take care of path panels
        // NOTE: we can use the cache (on first init) since they should have loaded them in order to initiate the mini nav

        const pathParts = initialPath.split('/');

        // pop off the last thing, because it is the origin target
        if (this.mode === 'move') {
            pathParts.pop();
        }

        let pathPrefix = pathParts.splice(0, 3).join('/');

        // cache member namespaces directory until needed
        const mbrNamespaces = this.store.selectSnapshot(DbfsResourcesState.getFolder(':member-namespaces:'));
        const mbrNamespacesPanel = this.dbfsUtils.normalizePanelFolder(mbrNamespaces, false, false);
        mbrNamespacesPanel.icon = 'd-dashboard-tile';
        mbrNamespacesPanel.loaded = true;

        this.folders[mbrNamespacesPanel.fullPath] = mbrNamespacesPanel;

        for (let i = 0; i < mbrNamespacesPanel.subfolders.length; i++) {
            const item = mbrNamespacesPanel.subfolders[i];
            const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
            const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true);
            this.folders[folderPanel.fullPath] = folderPanel;
        }

        if (pathDetails.type === 'namespace') {
            // if opening path IS within a namespace, lets go ahead and add the mbrNamespacesPanel to panels
            this.panels.push(mbrNamespacesPanel);

            // since opening path is on the namespace side, we need to cache the top level user folder
            const userNoDisplay = (this.mode === 'save') ? false : (userFolder.fullPath === this.originDetails.fullPath);
            const userFolderPanel = this.dbfsUtils.normalizePanelFolder(userFolder, true, true, userNoDisplay);
            userFolderPanel.loaded = true;

            this.folders[userFolderPanel.fullPath] = userFolderPanel;

            for (let i = 0; i < userFolderPanel.subfolders.length; i++) {
                const item = userFolderPanel.subfolders[i];
                if (item) {
                    const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
                    const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true, (folder.fullPath === this.originDetails.fullPath));
                    this.folders[folderPanel.fullPath] = folderPanel;
                }
            }
        }

        // top folder for the opening path
        const topFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder(pathPrefix));
        const topFolderNoDisplay = (this.mode === 'save') ? false : (topFolder.fullPath === this.originDetails.fullPath);
        const topFolderPanel = this.dbfsUtils.normalizePanelFolder(topFolder, true, true, topFolderNoDisplay);
        topFolderPanel.loaded = topFolder.loaded;

        this.panels.push(topFolderPanel);
        this.folders[topFolderPanel.fullPath] = topFolderPanel;

        for (let i = 0; i < topFolder.subfolders.length; i++) {
            const item = topFolder.subfolders[i];
            if (item) {
                const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
                const folderNoDisplay = (this.mode === 'save') ? false : (folder.fullPath === this.originDetails.fullPath);
                const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true, folderNoDisplay);
                folderPanel.loaded = folder.loaded;
                this.folders[folderPanel.fullPath] = folderPanel;

                if (this.mode === 'save' && (folder.trashFolder || (folder.ownerType === 'user' && folder.name === '_clipboard_'))) {
                    delete this.folders[folderPanel.fullPath];
                }
            }
        }

        // now lets traverse the rest of the opening path to get the parts
        if (pathParts.length > 0) {

            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i].trim();
                // add part to prefix
                pathPrefix = pathPrefix + '/' + part;
                // get folder
                const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(pathPrefix));
                const folderPartsNoDisplay = (this.mode === 'save') ? false : (folder.fullPath === this.originDetails.fullPath);
                const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true, folderPartsNoDisplay);
                folderPanel.loaded = folder.loaded;

                this.panels.push(folderPanel);
                this.folders[folderPanel.fullPath] = folderPanel;

                for (let j = 0; j < folder.subfolders.length; j++) {
                    const item = folder.subfolders[j];
                    if (item) {
                        const subfolder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
                        const subfolderNoDisplay = (this.mode === 'save') ? false : (subfolder.fullPath === this.originDetails.fullPath);
                        const subfolderPanel = this.dbfsUtils.normalizePanelFolder(subfolder, true, true, subfolderNoDisplay);
                        subfolderPanel.loaded = subfolder.loaded;
                        this.folders[subfolderPanel.fullPath] = subfolderPanel;

                        if (this.mode === 'save' && (subfolder.trashFolder || (subfolder.ownerType === 'user' && subfolder.name === '_clipboard_'))) {
                            delete this.folders[subfolderPanel.fullPath];
                        }
                    }
                }
            }
        }

        if (this.mode === 'save' && resetToRoot) {
            // there was no initial path, so we need to reset panels
            // to the panel root now that we have loaded necessary data
            this.panels.splice(1, this.panels.length);
        }

        this.panelIndex = this.panels.length - 1;

        // After initial setup, we will no longer pull from the state resources cache, but will call API
    }

    /*getPanelContext(path: string) {
        const panel = this.store.select(DbfsResourcesState.getFolderResource(path));
        this.debugPanelVars({'function': 'getPanelContext', path, panel});
        return panel;
    }*/

    navigatorAction(action: string, event?: any) {
        switch (action) {
            case 'move':
                this.directorySelected.emit({
                    action: 'miniNavMove',
                    id: this.originDetails.id,
                    type: this.type,
                    payload: {
                        sourceId: this.originDetails.id,
                        destinationId: (this.selected) ? this.folders[this.selected].id : this.panels[this.panelIndex].id,
                        originPath: this.originDetails.fullPath
                    }
                });
                break;
            case 'select':
                this.directorySelected.emit({
                    action: 'miniNavSelected',
                    id: this.originDetails.id,
                    type: this.type,
                    payload: {
                        sourceId: this.originDetails.id,
                        destinationId: this.folders[this.selected].id
                    }
                });
                break;
            case 'save':
                let savePath: any;
                if (!this.selected) {
                    // nothing is selected, so assume it is current panel
                    savePath = this.panels[this.panelIndex].fullPath;
                } else {
                    savePath = this.selected;
                }
                this.directorySelected.emit({
                    action: 'miniNavSave',
                    payload: this.folders[savePath]
                });
                break;
            case 'cancel':
                this.navigationCancel.emit({
                    action: 'miniNavCancel',
                    id: this.originDetails.id,
                    type: this.type
                });
                break;
            case 'goUpDirectory':
                this.navPanel.goBack(() => {
                    this.panels.splice(this.panelIndex, 1);
                    //this.panelIndex = this.panels.length - 1;
                    this.panelIndex = this.panelIndex - 1;
                    this.selected = false;
                    this.cdref.detectChanges();
                });

                break;
            default:
                break;
        }
    }

    folderAction(action: any, folder: any, event: any) {
        switch (action) {
            case 'gotoFolder':
                if (folder.loaded === true) {
                    this.addPanel(folder.fullPath);
                } else {
                    this.loadSubFolderThenPanel(folder);
                }
                break;
            case 'selectFolder':
                const pathParts = folder.fullPath.split('/');
                if (
                    (this.mode === 'move' && (pathParts.length === 2 || !folder.moveEnabled)) ||
                    ((this.mode === 'save' || this.mode === 'select') && (pathParts.length === 2 || !folder.selectEnabled))
                ) {
                    // can't select the folder, so just load it as a panel
                    // example is if they are viewing path '/namespace'
                    // OR if it is selected already, just act like a double click and load the panel
                    this.selected = false;
                    this.folderAction('gotoFolder', folder, event);
                } else if (this.selected === folder.fullPath) {
                    // its already selected, act like a double-click and load the panel
                    this.selected = '';
                    this.folderAction('gotoFolder', folder, event);
                } else {
                    this.selected = folder.fullPath;
                }
                break;
            default:
                break;
        }
    }

    private addPanel(path) {
        this.panels.push(this.folders[path]);
        this.panelIndex = this.panels.length - 1;

        setTimeout(() => {
            this.selected = false;
            this.navPanel.goNext();
        }, 200);
    }

    private fetchFolder(folder: any): Promise<any> {
        const details = this.dbfsUtils.detailsByFullPath(folder.fullPath);
        let topFolder: any = false;
        let apiUrl: string;
        let params: any = {};

        if (details.topFolder) {
            topFolder = {
                type: details.type,
                value: details.typeKey
            };
        }

        if (topFolder && topFolder.type && topFolder.value) {
            const tokenType = (topFolder.type === 'user') ? 'userId' : 'namespace';
            apiUrl = this.appConfig.getConfig().configdb + '/dashboard/topFolders';
            params[tokenType] = topFolder.value;
        } else {
            apiUrl = this.appConfig.getConfig().configdb + '/dashboard' + folder.path;
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            params
        };

        return this.http.get(apiUrl, httpOptions)
            .toPromise()
            .then((response: any) => {
                return response;
            })
            .catch(err => {
                console.error(err);
            });
    }

    private loadSubFolderThenPanel(folder: any) {

        this.fetchFolder(folder)
            .then(resource => {

                let folderPanel: any;

                folderPanel = this.dbfsUtils.normalizePanelFolder(resource, true, true, (resource.fullPath === this.originDetails.fullPath));
                folderPanel.loaded = true;

               // just to be sure the name carries over
                if (folderPanel.ownerType === 'namespace' && folderPanel.topFolder === true) {
                    const nsData = this.store.selectSnapshot(DbfsResourcesState.getNamespacesData);
                    folderPanel.name = nsData[folderPanel.namespace].name;
                }

                if (folderPanel.ownerType === 'user' && folderPanel.topFolder === true) {
                    folderPanel.name = 'My Dashboards';
                }

                const subfolders = [];

                folderPanel.subfolders.sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(a.name, b.name);
                });

                for (const subfolder of folderPanel.subfolders) {
                    subfolders.push(subfolder.fullPath);
                    const subfolderPanel = this.dbfsUtils.normalizePanelFolder(subfolder, true, true, (subfolder.fullPath === this.originDetails.fullPath));
                    this.folders[subfolderPanel.fullPath] = subfolderPanel;

                    if (this.mode === 'save' && (subfolderPanel.trashFolder || (subfolderPanel.ownerType === 'user' && subfolderPanel.name === '_clipboard_'))) {
                        delete this.folders[subfolderPanel.fullPath];
                    }
                }

                folderPanel.subfolders = subfolders;
                this.folders[folderPanel.fullPath] = folderPanel;

                return folderPanel;
            })
            .then(folderPanel => {
                this.panels.push(this.folders[folderPanel.fullPath]);
                this.panelIndex = this.panels.length - 1;
                this.selected = false;
                this.cdref.detectChanges();
                return folderPanel;
            })
            .then(() => {
                setTimeout(() => {
                    this.navPanel.goNext();
                }, 200);
            });
    }
}
