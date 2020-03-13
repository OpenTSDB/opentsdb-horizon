import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';

import { Observable, Subscription, of } from 'rxjs';

import { NavigatorPanelComponent } from '../../../navigator-panel/navigator-panel.component';

import {
    DbfsResourcesState,
    DbfsLoadResources
} from '../../../../state';

import {
    Select,
    Store
} from '@ngxs/store';
import { LoggerService } from '../../../../../core/services/logger.service';
import { DbfsUtilsService } from '../../../../services/dbfs-utils.service';
import { DbfsService } from '../../../../services/dbfs.service';
import { catchError } from 'rxjs/operators';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dbfs-mini-nav',
    templateUrl: './dbfs-mini-nav.component.html',
    styleUrls: ['./dbfs-mini-nav.component.scss']
})
export class DbfsMiniNavComponent implements OnInit, OnDestroy {

    @HostBinding('class.mini-navigator-component') private _hostClass = true;

    // tslint:disable-next-line:no-inferrable-types
    @Input() mode: string = 'move'; // options: move, select
    // tslint:disable-next-line:no-inferrable-types
    @Input() path: string = '';
    // tslint:disable-next-line:no-inferrable-types
    @Input() type: string = 'folder'; // 'folder' or 'file'

    @Output() directorySelected: any = new EventEmitter<any>();
    @Output() navigationCancel: any = new EventEmitter<any>();

    // VIEW CHILDREN
    @ViewChild(NavigatorPanelComponent) private navPanel: NavigatorPanelComponent;

    // SUBSCRIPTIONS
    private subscription: Subscription = new Subscription();

    // STATE
    panels: any[] = [];
    panelIndex: number = 0;

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<boolean>;

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
            // this.logger.log('MOVE ENABLED', {originDetails: this.originDetails, curPanel: this.panels[this.panelIndex]})
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

    constructor(
        private store: Store,
        private dbfsUtils: DbfsUtilsService,
        private utils: UtilsService,
        private logger: LoggerService,
        private service: DbfsService
    ) { }

    ngOnInit() {
        this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
            if (loaded === false) {
                this.store.dispatch(new DbfsLoadResources());
            }
            if (loaded === true) {
                this.miniNavInit();
            }
        }));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /* INIT MINI NAV */
    private miniNavInit() {
        this.logger.log('MINI NAV INIT', {
            mode: this.mode,
            type: this.type,
            path: this.path
        });
        // setup origin details
        const pathDetails = this.dbfsUtils.detailsByFullPath(this.path);
        if (this.type === 'file') {
            this.originDetails = this.store.selectSnapshot(DbfsResourcesState.getFile(this.path));
        } else {
            this.originDetails = this.store.selectSnapshot(DbfsResourcesState.getFolder(this.path));
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

        // take care of path panels
        // NOTE: we can use the cache (on first init) since they should have loaded them in order to initiate the mini nav

        const pathParts = this.path.split('/');

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
            const userFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder(miniRoot.subfolders[0]));
            const userFolderPanel = this.dbfsUtils.normalizePanelFolder(userFolder, true, true, (userFolder.fullPath === this.originDetails.fullPath));
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
        const topFolderPanel = this.dbfsUtils.normalizePanelFolder(topFolder, true, true, (topFolder.fullPath === this.originDetails.fullPath));
        topFolderPanel.loaded = topFolder.loaded;

        this.panels.push(topFolderPanel);
        this.folders[topFolderPanel.fullPath] = topFolderPanel;

        for (let i = 0; i < topFolder.subfolders.length; i++) {
            const item = topFolder.subfolders[i];
            if (item) {
                const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
                const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true, (folder.fullPath === this.originDetails.fullPath));
                folderPanel.loaded = folder.loaded;
                this.folders[folderPanel.fullPath] = folderPanel;
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
                const folderPanel = this.dbfsUtils.normalizePanelFolder(folder, true, true, (folder.fullPath === this.originDetails.fullPath));
                folderPanel.loaded = folder.loaded;

                this.panels.push(folderPanel);
                this.folders[folderPanel.fullPath] = folderPanel;

                for (let j = 0; j < folder.subfolders.length; j++) {
                    const item = folder.subfolders[j];
                    if (item) {
                        const subfolder = this.store.selectSnapshot(DbfsResourcesState.getFolder(item));
                        const subfolderPanel = this.dbfsUtils.normalizePanelFolder(subfolder, true, true, (subfolder.fullPath === this.originDetails.fullPath));
                        subfolderPanel.loaded = subfolder.loaded;
                        this.folders[subfolderPanel.fullPath] = subfolderPanel;
                    }
                }
            }
        }

        this.panelIndex = this.panels.length - 1;

        // After initial setup, we will no longer pull from the state resources cache, but will call API
    }

    getPanelContext(path: string) {
        const panel = this.store.select(DbfsResourcesState.getFolderResource(path));
        return panel;
    }

    navigatorAction(action: string, event?: any) {
        // this.logger.log('[MINI NAV] NAVIGATOR ACTION', {action, event});
        switch (action) {
            case 'move':
                // console.log('selected', this.originDetails, this.selected, this.panels[this.panelIndex]);

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
            case 'cancel':
                this.navigationCancel.emit({
                    action: 'miniNavCancel',
                    id: this.originDetails.id,
                    type: this.type
                });
                break;
            case 'goUpDirectory':
                this.navPanel.goBack(function() {
                    this.panels.splice(this.panelIndex);
                    this.panelIndex = this.panels.length - 1;
                    this.selected = false;
                    // console.log('this.panels', this.panels);
                }.bind(this));
                break;
            default:
                break;
        }
    }

    folderAction(action: any, folder: any, event: any) {
        // this.logger.log('[MINI NAV] FOLDER ACTION', {action, folder, event, panels: this.panels});
        event.stopPropagation();
        switch (action) {
            case 'gotoFolder':
                // console.log('GOTO FOLDER', folder);
                if (folder.loaded) {
                    this.addPanel(folder.fullPath);
                } else {
                    this.loadSubFolderThenPanel(folder);
                }
                break;
            case 'selectFolder':
                const pathParts = folder.fullPath.split('/');
                if (
                    (this.mode === 'move' && (pathParts.length === 2 || !folder.moveEnabled)) ||
                    (this.mode === 'select' && (pathParts.length === 2 || !folder.selectEnabled))
                ) {
                    // can't select the folder, so just load it as a panel
                    // example is if they are viewing path '/namespace'
                    // OR if it is selected already, just act like a double click and load the panel
                    // console.log('Can\'t select', folder.fullPath);
                    // console.log('details', pathParts, folder, this.selected);
                    this.selected = false;
                    this.folderAction('gotoFolder', folder, event);
                } else if (this.selected === folder.fullPath) {
                    // console.log('already selected', folder.fullPath);
                    // its already selected, act like a double-click and load the panel
                    this.selected = '';
                    this.folderAction('gotoFolder', folder, event);
                } else {
                    // console.log('mark selected', folder.fullPath);
                    this.selected = folder.fullPath;
                }
                break;
            default:
                break;
        }
    }

    private addPanel(path) {
        // this.logger.log('ADD PANEL', {path});
        this.panels.push(this.folders[path]);
        this.panelIndex = this.panels.length - 1;

        setTimeout(function() {
            this.selected = false;
            this.navPanel.goNext();
        }.bind(this), 200);

        // console.log('this.panels', this.panels);
    }

    private loadSubFolderThenPanel(folder: any) {
        this.logger.log('LOAD SUBFOLDER THEN PANEL', { folder });

        const details = this.dbfsUtils.detailsByFullPath(folder.fullPath);
        let topFolder: any = false;

        if (details.topFolder) {
            topFolder = {
                type: details.type,
                value: details.typeKey
            };
        }

        this.service.getFolderByPath(folder.path, topFolder).pipe(
            catchError(val => of(`error caught: ${val}`))
        ).subscribe((resource: any) => {
            this.logger.success('MINI NAV LOAD SUBFOLDER', resource);

            const folderPanel = this.dbfsUtils.normalizePanelFolder(resource, true, true, (resource.fullPath === this.originDetails.fullPath));
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
            }

            folderPanel.subfolders = subfolders;

            this.folders[folderPanel.fullPath] = folderPanel;
            this.addPanel(folderPanel.fullPath);
        });
    }
}
