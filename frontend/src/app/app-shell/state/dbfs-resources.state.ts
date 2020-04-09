import { State, StateContext, Action, Store, Selector, createSelector } from '@ngxs/store';
import { UtilsService } from '../../core/services/utils.service';
import { LoggerService } from '../../core/services/logger.service';
import { map, tap, catchError, reduce } from 'rxjs/operators';

import { DbfsService } from '../services/dbfs.service';
import { DbfsUtilsService } from '../services/dbfs-utils.service';

/** INTERFACES */
import {
    DbfsFileModel,
    DbfsFolderModel,
    DbfsNamespaceModel,
    DbfsResourcesModel,
    DbfsSyntheticFolderModel,
    DbfsUserModel
} from './dbfs-resources.interfaces';

/** ACTIONS */

export class DbfsResourcesError {
    static readonly type = '[DBFS Resources] Error happened';
    constructor(
        public readonly error: any,
        public readonly label: string = 'Generic Error'
    ) { }
}

export class DbfsResetResourceAction {
    static readonly type = '[DBFS Resources] reset resource action';
    constructor() { }
}

export class DbfsLoadResources {
    public static type = '[DBFS Resources] Load Resources';
    constructor() { }
}

export class DbfsLoadResourcesSuccess {
    public static type = '[DBFS Resources] Load Resources Success';
    constructor(public readonly response: any) { }
}

export class DbfsLoadSubfolder {
    public static type = '[DBFS Resources] Load Subfolder';
    constructor(
        public readonly path: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadSubfolderSuccess {
    public static type = '[DBFS Resources] Load Subfolder SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadUsersList {
    public static type = '[DBFS Resources] Load Users List';
    constructor(public readonly resourceAction: any) { }
}

export class DbfsLoadUsersListSuccess {
    public static type = '[DBFS Resources] Load Users List SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadNamespacesList {
    public static type = '[DBFS Resources] Load Namespaces List';
    constructor(public readonly resourceAction: any) { }
}

export class DbfsLoadNamespacesListSuccess {
    public static type = '[DBFS Resources] Load Namespaces List SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadTopFolder {
    public static type = '[DBFS Resources] Load Top Folder';
    constructor(
        public readonly type: any,
        public readonly key: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadTopFolderSuccess {
    public static type = '[DBFS Resources] Load Top Folder SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsCreateFolder {
    public static type = '[DBFS Resources] Create Folder';
    constructor(
        public readonly folder: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsCreateFolderSuccess {
    public static type = '[DBFS Resources] Create Folder SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsMoveResource {
    public static type = '[DBFS Resources] Move Resource';
    constructor(
        public readonly sourceId: number,
        public readonly destinationId: number,
        public readonly originPath: string,
        public readonly resourceAction: any
    ) { }
}

export class DbfsMoveResourceSuccess {
    public static type = '[DBFS Resources] Move Resource SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsUpdateFolder {
    public static type = '[DBFS Resources] Update Folder';
    constructor(
        public readonly folder: any,
        public readonly originPath: string,
        public readonly resourceAction: any
    ) { }
}

export class DbfsUpdateFolderSuccess {
    public static type = '[DBFS Resources] Update Folder SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsUpdateFile {
    public static type = '[DBFS Resources] Update File';
    constructor(
        public readonly file: any,
        public readonly originPath: string,
        public readonly resourceAction: any
    ) { }
}

export class DbfsUpdateFileSuccess {
    public static type = '[DBFS Resources] Update File SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsDeleteFolder {
    public static type = '[DBFS Resources] Delete Folder';
    constructor(
        public readonly folders: any[],
        public readonly resourceAction: any
    ) { }
}

export class DbfsDeleteFolderSuccess {
    public static type = '[DBFS Resources] Delete Folder SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class DbfsDeleteDashboard {
    public static type = '[DBFS Resources] Delete Dashboard';
    constructor(
        public readonly file: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsAddPlaceholderFolder {
    public static type = '[DBFS Resources] Add Placeholder Folder';
    constructor(
        public readonly path: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsSetupFavoriteRecentPlaceholders {
    public static type = '[DBFS Resources] Setup Favorite/Recent Placeholders';
    constructor() { }
}

export class DbfsLoadUserFavorites {
    public static type = '[DBFS Resources] Load User Favorites';
    constructor(
        public readonly userid: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsLoadUserFavoritesSuccess {
    public static type = '[DBFS Resources] Load User Favorites SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resourceAction: any
    ) { }
}

export class DbfsAddUserFav {
    public static type = '[DBFS Resources] Add User Fav';
    constructor(
        public readonly resource: any,
        public readonly resourceAction: any
    ) {}
}

export class DbfsAddUserFavSuccess {
    public static type = '[DBFS Resources] Add User Fav SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resource: any,
        public readonly resourceAction: any
    ) {}
}

export class DbfsRemoveUserFav {
    public static type = '[DBFS Resources] Remove User Fav';
    constructor(
        public readonly resource: any,
        public readonly resourceAction: any
    ) {}
}

export class DbfsRemoveUserFavSuccess {
    public static type = '[DBFS Resources] Remove User Fav SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resource: any,
        public readonly resourceAction: any
    ) {}
}

export class DbfsLoadUserRecents {
    public static type = '[DBFS Resources] Load User Recents';
    constructor(
        public readonly userid: any,
        public readonly limit: any,
        public readonly resourceAction: any
    ) {}
}

export class DbfsLoadUserRecentsSuccess {
    public static type = '[DBFS Resources] Load User Recents SUCCESS';
    constructor(
        public readonly response: any,
        public readonly resourceAction: any
    ) {}
}

/** STATE */

@State<DbfsResourcesModel>({
    name: 'DataResources',
    defaults: {
        activeUser: '',
        users: {},
        userList: [],
        namespaces: {},
        namespaceList: [],
        userFavorites: [],
        userRecents: [],
        folders: {},
        files: {},
        error: {},
        loaded: false,
        dynamicLoaded: {
            users: false,
            namespaces: false,
            favorites: false,
            recents: false
        },
        resourceAction: {}
    }
})

export class DbfsResourcesState {
    constructor(
        private utils: UtilsService,
        private logger: LoggerService,
        private store: Store,
        private service: DbfsService,
        private dbfsUtils: DbfsUtilsService
    ) { }

    /** Selectors */
    @Selector() static getUsersData(state: DbfsResourcesModel) {
        return state.users;
    }

    @Selector() static getNamespacesData(state: DbfsResourcesModel) {
        return state.namespaces;
    }

    @Selector() static getFolderResources(state: DbfsResourcesModel) {
        return state.folders;
    }

    @Selector() static getFileResources(state: DbfsResourcesModel) {
        return state.files;
    }

    @Selector() static getResourceError(state: DbfsResourcesModel) {
        return state.error;
    }

    @Selector() static getResourcesLoaded(state: DbfsResourcesModel) {
        return state.loaded;
    }

    @Selector() static getDynamicLoaded(state: DbfsResourcesModel) {
        return state.dynamicLoaded;
    }

    @Selector() static getUsersListLoaded(state: DbfsResourcesModel) {
        return state.dynamicLoaded.users;
    }

    @Selector() static getNamespacesListLoaded(state: DbfsResourcesModel) {
        return state.dynamicLoaded.namespaces;
    }

    @Selector() static getResourceAction(state: DbfsResourcesModel) {
        return state.resourceAction;
    }

    @Selector() static getNamespacesList(state: DbfsResourcesModel) {
        let namespaces = [];
        // filter this, because filtering doesn't work correctly with ALL the data
        namespaces = state.namespaceList.map(item => {
            const data = {
                alias: state.namespaces[item].alias,
                id: state.namespaces[item].id,
                name: state.namespaces[item].name,
                enabled: state.namespaces[item].enabled
            };
            return data;
        });
        return namespaces;
    }

    @Selector() static getUsersList(state: DbfsResourcesModel) {
        return state.userList.map(item => state.users[item]);
    }

    @Selector() static getUserFavorites(state: DbfsResourcesModel) {

        let favorites = [];
        if (state.loaded) {
            favorites = state.userFavorites.map(item => {
                const data: any = { ...state.files[item.fullPath] };
                data.rootPath = data.fullPath.split('/').slice(0, 3).join('/');
                data.favoritedTime = item.favoritedTime;
                return data;
            });
        }
        return favorites;
    }

    @Selector() static getUserRecents(state: DbfsResourcesModel) {
        let recents = [];

        if (state.loaded) {
            recents = state.userRecents.map(item => {
                const data: any = { ...state.files[item.fullPath] };
                data.rootPath = data.fullPath.split('/').slice(0, 3).join('/');
                data.lastVisitedTime = item.lastVisitedTime;
                return data;
            });
        }

        return recents;
    }

    public static getFolderResource(path: string) {
        return createSelector([DbfsResourcesState], (state: DbfsResourcesModel) => {
            if (!state.folders[path]) {
                return { notFound: true };
            }
            // tslint:disable-next-line: prefer-const
            let data = { ...state.folders[path] };

            if (data.personal) {
                data.personal = data.personal.map(subPath => state.folders[subPath]);
            }
            if (data.namespaces) {
                data.namespaces = data.namespaces.map(ns => state.folders[ns]);
            }

            if (data.subfolders) {
                data.subfolders = data.subfolders.map(subPath => state.folders[subPath]);
            }

            if (data.files) {
                data.files = data.files.map(subPath => state.files[subPath]);
            }

            return data;
        });
    }

    // just folder, no mapping. Need it for basic info like id, name, path for create/update
    public static getFolder(path: string) {
        return createSelector([DbfsResourcesState], (state: DbfsResourcesModel) => {
            const data = { ...state.folders[path] };
            return data;
        });
    }

    public static getFile(path: string) {
        return createSelector([DbfsResourcesState], (state: DbfsResourcesModel) => {
            const data = { ...state.files[path] };
            return data;
        });
    }

    public static getFileById(id: string) {
        return createSelector([DbfsResourcesState], (state: DbfsResourcesModel) => {
            const keys = Object.keys(state.files);
            const idx = keys.findIndex(item => state.files[item].id === id);
            const path = keys[idx];
            const data = { ...state.files[path] };
            return data;
        });
    }

    public static checkFileFavorited(id: any) {
        return createSelector([DbfsResourcesState], (state: DbfsResourcesModel) => {
            const favCheck = state.userFavorites.findIndex(item => item.id === id);
            return (favCheck === -1) ? false : true;
        });
    }

    /** Utils */
    private resourceLockCheck(path: string, state: any) {
        const details = this.dbfsUtils.detailsByFullPath(path);
        if (
            (details.type === 'user' && details.typeKey !== state.activeUser) ||
            (details.type === 'namespace' && state.users[state.activeUser].memberNamespaces.indexOf(details.typeKey) === -1)
        ) {
            return true;
        }
        return false;
    }

    /** Actions */
    @Action(DbfsResetResourceAction)
    resetResourceAction(ctx: StateContext<DbfsResourcesModel>, { }: DbfsResetResourceAction) {
        this.logger.action('State :: Reset Resource Action');
        ctx.patchState({
            resourceAction: {}
        });
    }

    /** loading resources */
    @Action(DbfsLoadResources)
    loadResources(ctx: StateContext<DbfsResourcesModel>, { }: DbfsLoadResources) {
        this.logger.action('State :: Load Navigation Resource List');
        const state = ctx.getState();

        return this.service.loadResources().pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadResourcesSuccess(payload));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load Navigation Resource List')))
        );
    }

    @Action(DbfsLoadResourcesSuccess)
    loadResourcesSuccess(ctx: StateContext<DbfsResourcesModel>, { response }: DbfsLoadResourcesSuccess) {
        this.logger.success('State :: Load Navigation Resource List', response);

        // in case the user doesn't have any member namespaces
        // fixes issue when user doesn't belong to namespace, the sidebar throws error
        // just ensures there is an empty array at least
        if (!response.memberNamespaces) {
            response.memberNamespaces = [];
        }

        const state = ctx.getState();

        // initial data setup
        // extract user data
        let user = response.user;
        // keys for the user member namespaces
        user.memberNamespaces = [];
        // assign active user id (user who the cookie belongs to)
        let activeUser = user.userid.slice(5);
        user.alias = activeUser;
        // users hash (all users)
        let users = {};
        // add user object to hash
        users[activeUser] = user;
        // namespace hash (NOT namespace folders)
        let namespaces = {};
        // folders hash (includes user and namespace folders)
        // folder.fullPath is the key
        let folders = {};
        // files hash (includes user and namespace files)
        // file.fullPath is the key
        let files = {};

        // extract namespaces, and assign ids to user.memberNamespaces
        // & create each individual namespace folder resource
        // for namespaces: DbfsNamespaceModel
        for (const ns of response.memberNamespaces) {
            // namespace resource
            namespaces[ns.namespace.alias] = ns.namespace;
            // namespace folder resource
            const nsFolder = this.dbfsUtils.normalizeFolder(ns.folder);
            nsFolder.name = ns.namespace.name;

            if (nsFolder.subfolders.length > 0) {
                nsFolder.subfolders = nsFolder.subfolders.map(item => {

                    const folder = this.dbfsUtils.normalizeFolder(item);
                    folders[folder.fullPath] = folder;
                    return item.fullPath;
                });
                nsFolder.subfolders.sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
                });
            }

            if (nsFolder.files.length > 0) {
                nsFolder.files = nsFolder.files.map(item => {
                    const file = this.dbfsUtils.normalizeFile(item);
                    files[file.fullPath] = file;
                    return item.fullPath;
                });
                nsFolder.files.sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(files[a].name, files[b].name);
                });
            }

            folders[ns.folder.fullPath] = nsFolder;
            // add to user member namespaces
            user.memberNamespaces.push(ns.namespace.alias);
        }

        // create master resource '/'
        // DbfsSyntheticFolderModel
        const panelRoot = <DbfsSyntheticFolderModel>{
            id: 0,
            name: 'Home',
            path: ':panel-root:',
            fullPath: ':panel-root:',
            synthetic: true,
            personal: [],
            namespaces: []
        };
        folders[panelRoot.fullPath] = panelRoot;

        // master resource for mini navigator
        const miniPanelRoot = <DbfsSyntheticFolderModel>{
            id: 0,
            name: 'Top Level',
            path: ':mini-root:',
            fullPath: ':mini-root:',
            synthetic: true,
            moveEnabled: false,
            selectEnabled: false,
            subfolders: [
                '/user/' + activeUser,
                ':member-namespaces:'
            ]
        };

        folders[miniPanelRoot.fullPath] = miniPanelRoot;

        // create each individual folder resources
        // DbfsFolderModel

        const userFolder = this.dbfsUtils.normalizeFolder(response.personalFolder);
        userFolder.loaded = true;
        userFolder.name = 'My Dashboards';

        folders[userFolder.fullPath] = userFolder;
        panelRoot.personal.push(userFolder.fullPath);

        // TODO: NAG backend to get favorites implemented
        const favFolder = <DbfsFolderModel>{
            id: 0,
            name: 'My Favorites',
            path: ':user-favorites:',
            fullPath: ':user-favorites:',
            files: [],
            resourceType: 'list',
            ownerType: 'dynamic',
            icon: 'd-star',
            synthetic: true,
            loaded: false,
            moveEnabled: false,
            selectEnabled: false,
            user: activeUser
        };
        folders[favFolder.fullPath] = favFolder;
        panelRoot.personal.push(favFolder.fullPath);

        // frequently visited
        // TODO: NAG backend to get frequently & recently visited working
        /* COMMENTING OUT TILL BACKEND IS WORKING
        const freqFolder = <DbfsFolderModel>{
            id: 0,
            name: 'Frequently Visited',
            // path: '/user/' + activeUser + '/frequently-visited',
            // fullPath: '/user/' + activeUser + '/frequently-visited',
            path: ':user-frequent:',
            fullPath: ':user-frequent:',
            files: [],
            // resourceType: 'frequentlyVisited',
            // ownerType: 'user',
            resourceType: 'list',
            ownerType: 'dynamic',
            icon: 'd-duplicate',
            synthetic: true,
            loaded: false,
            moveEnabled: false,
            selectEnabled: false,
            user: activeUser
        };
        folders[freqFolder.fullPath] = freqFolder;
        panelRoot.personal.push(freqFolder.fullPath);*/

        // recently visited
        const recvFolder = <DbfsFolderModel>{
            id: 0,
            name: 'Recently Visited',
            path: ':user-recent:',
            fullPath: ':user-recent:',
            files: [],
            resourceType: 'list',
            ownerType: 'dynamic',
            icon: 'd-time',
            synthetic: true,
            loaded: false,
            moveEnabled: false,
            selectEnabled: false,
            user: activeUser
        };
        folders[recvFolder.fullPath] = recvFolder;
        panelRoot.personal.push(recvFolder.fullPath);

        // USER Trash - add to root panel
        // tslint:disable-next-line: max-line-length
        const userTrash = response.personalFolder.subfolders.filter(item => item.fullPath === '/user/' + activeUser + '/trash');
        const userTrashIdx = response.personalFolder.subfolders.indexOf(userTrash[0]);

        const trashFolder = this.dbfsUtils.normalizeFolder(userTrash[0]);
        folders[trashFolder.fullPath] = trashFolder;
        panelRoot.personal.push(userTrash[0].fullPath);
        userFolder.subfolders.splice(userTrashIdx, 1);

        // member namespace list
        const mbrnsFolder = <DbfsFolderModel>{
            id: 0,
            name: 'Namespaces',
            path: ':member-namespaces:',
            fullPath: ':member-namespaces:',
            subfolders: [],
            resourceType: 'userMemberNamespaces',
            icon: 'd-network-platform',
            synthetic: true,
            loaded: false,
            moveEnabled: false,
            selectEnabled: false
        };

        // add namespaces to paneRoot.namespaces
        // & the memberNamespace list
        for (const ns of user.memberNamespaces) {
            mbrnsFolder.subfolders.push('/namespace/' + ns);
            panelRoot.namespaces.push('/namespace/' + ns);
        }

        mbrnsFolder.subfolders.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
        });

        panelRoot.namespaces.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
        });

        folders[mbrnsFolder.fullPath] = mbrnsFolder;

        // USER SUBFOLDERS & FILES

        userFolder.subfolders = userFolder.subfolders.map(item => {
            const folder = this.dbfsUtils.normalizeFolder(item);
            folders[folder.fullPath] = folder;
            return item.fullPath;
        });

        userFolder.subfolders.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
        });

        // add trash folder last - after sort. Trash folder always last
        userFolder.subfolders.push(trashFolder.fullPath);

        userFolder.files = userFolder.files.map(item => {
            const file: DbfsFileModel = this.dbfsUtils.normalizeFile(item);
            files[file.fullPath] = file;
            return item.fullPath;
        });

        userFolder.files.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(files[a].name, files[b].name);
        });

        // SPECIAL FOLDERS
        const namespaceListFolder = <DbfsFolderModel>{
            id: 0,
            name: 'Namespace List',
            path: ':list-namespaces:',
            fullPath: ':list-namespaces:',
            resourceType: 'list',
            ownerType: 'dynamic',
            icon: 'd-network-platform',
            loaded: false,
            synthetic: true,
            moveEnabled: false,
            selectEnabled: false
        };
        folders[namespaceListFolder.fullPath] = namespaceListFolder;

        const userListFolder = <DbfsFolderModel>{
            id: 0,
            name: 'User List',
            path: ':list-users:',
            fullPath: ':list-users:',
            resourceType: 'list',
            ownerType: 'dynamic',
            icon: 'd-user-group',
            loaded: false,
            synthetic: true,
            moveEnabled: false,
            selectEnabled: false
        };
        folders[userListFolder.fullPath] = userListFolder;

        // update state
        ctx.setState({
            ...state,
            activeUser,
            users,
            namespaces,
            folders,
            files,
            loaded: true
        });

        // after we have file/folder resources, lets setup favorites and recents (placeholders if necessary)
        const recentsFetchSub = ctx.dispatch([
            new DbfsLoadUserFavorites(null, {}),
            new DbfsLoadUserRecents(null, null, {})
        ]).subscribe( data => {
            ctx.dispatch(new DbfsSetupFavoriteRecentPlaceholders());
            recentsFetchSub.unsubscribe();
        });

    }

    @Action(DbfsLoadSubfolder)
    loadSubfolder(ctx: StateContext<DbfsResourcesModel>, { path, resourceAction }: DbfsLoadSubfolder) {
        this.logger.action('State :: Load SubFolder', { path, resourceAction });
        const state = ctx.getState();

        const folder = state.folders[path];
        let topFolder: any = false;

        if (folder.topFolder) {
            const tValue = folder.fullPath.split('/')[2];
            topFolder = {
                type: folder.ownerType,
                value: tValue.toLowerCase()
            };
        }

        return this.service.getFolderByPath(folder.path, topFolder).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadSubfolderSuccess(payload, resourceAction));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load Subfolder')))
        );
    }

    @Action(DbfsLoadSubfolderSuccess)
    loadSubfolderSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resourceAction }: DbfsLoadSubfolderSuccess) {
        this.logger.success('State :: Load SubFolder', response);

        const state = ctx.getState();

        const folders = JSON.parse(JSON.stringify(state.folders));
        const files = JSON.parse(JSON.stringify(state.files));

        const locked = this.resourceLockCheck(response.fullPath, state);

        let folder;

        if (folders[response.fullPath]) {
            folder = folders[response.fullPath];
            folder.subfolders = response.subfolders;
            folder.files = response.files;
        } else {
            folder = this.dbfsUtils.normalizeFolder(response, locked);
        }

        folder.loaded = true;

        if (folder.subfolders) {
            folder.subfolders = folder.subfolders.map(f => {
                folders[f.fullPath] = this.dbfsUtils.normalizeFolder(f, locked);
                return f.fullPath;
            });
            folder.subfolders.sort((a: any, b: any) => {
                return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
            });
        }

        if (folder.files) {
            folder.files = folder.files.map(f => {
                files[f.fullPath] = <DbfsFileModel>this.dbfsUtils.normalizeFile(f, locked);
                return f.fullPath;
            });
            folder.files.sort((a: any, b: any) => {
                return this.utils.sortAlphaNum(files[a].name, files[b].name);
            });
        }

        folders[folder.fullPath] = folder;

        ctx.patchState({
            folders,
            files,
            resourceAction
        });
    }

    @Action(DbfsLoadUsersList)
    loadUsersList(ctx: StateContext<DbfsResourcesModel>, { resourceAction }: DbfsLoadUsersList) {
        this.logger.action('State :: Load Users');

        return this.service.getUsersList().pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadUsersListSuccess(payload, resourceAction));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load Users')))
        );
    }

    @Action(DbfsLoadUsersListSuccess)
    loadUsersListSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resourceAction }: DbfsLoadUsersListSuccess) {
        this.logger.success('State :: Load Users', response);
        const state = ctx.getState();

        const dynamicLoaded = JSON.parse(JSON.stringify({ ...state.dynamicLoaded }));

        const users = JSON.parse(JSON.stringify({ ...state.users }));
        const userList: any[] = [];

        for (let i = 0; i < response.length; i++) {
            const usr = response[i];
            usr.alias = usr.userid.slice(5);
            userList.push(usr.alias);
            if (!users[usr.alias]) {
                users[usr.alias] = <DbfsUserModel>usr;
            }
        }

        // sort user list
        userList.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(users[a].alias, users[b].alias);
        });

        dynamicLoaded.users = true;

        ctx.patchState({
            users,
            userList,
            dynamicLoaded,
            resourceAction
        });
    }


    @Action(DbfsLoadNamespacesList)
    loadNamespacesList(ctx: StateContext<DbfsResourcesModel>, { resourceAction }: DbfsLoadNamespacesList) {
        // this.logger.action('State :: Load Namespaces', { resourceAction });
        return this.service.getNamespacesList().pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadNamespacesListSuccess(payload, resourceAction));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load Namespaces')))
        );
    }

    @Action(DbfsLoadNamespacesListSuccess)
    loadNamespacesListSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resourceAction }: DbfsLoadNamespacesListSuccess) {
        // this.logger.success('State :: Load Namespaces', response);
        const state = ctx.getState();
        const dynamicLoaded = JSON.parse(JSON.stringify({ ...state.dynamicLoaded }));

        const namespaces = JSON.parse(JSON.stringify({ ...state.namespaces }));
        const namespaceList: any[] = [];

        for (let i = 0; i < response.length; i++) {
            const ns = response[i];
            namespaces[ns.alias] = <DbfsNamespaceModel>ns;
            namespaceList.push(ns.alias);
        }

        // sort list
        namespaceList.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(a, b);
        });

        dynamicLoaded.namespaces = true;

        ctx.patchState({
            namespaces,
            namespaceList,
            dynamicLoaded,
            resourceAction
        });
    }

    // LOAD TOP FOLDER
    @Action(DbfsLoadTopFolder)
    loadTopFolder(ctx: StateContext<DbfsResourcesModel>, { type, key, resourceAction }: DbfsLoadTopFolder) {
        this.logger.action('State :: Load Top Folder', { type, key, resourceAction });

        const path = '/' + type + '/' + key;
        const topFolder: any = { type };
        topFolder.value = (type === 'user') ? 'user.' + key : key;

        return this.service.getFolderByPath(path, topFolder).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadTopFolderSuccess(payload, { type, key, resourceAction }));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load Top Folder')))
        );
    }

    @Action(DbfsLoadTopFolderSuccess)
    loadTopFolderSuccess(ctx: StateContext<DbfsResourcesModel>, { response, args }: DbfsLoadTopFolderSuccess) {
        this.logger.success('State :: Load Top Folder', { response, args });
        const state = ctx.getState();

        const resourceAction = args.resourceAction;

        const folders = JSON.parse(JSON.stringify({ ...state.folders }));
        const files = JSON.parse(JSON.stringify({ ...state.files }));

        const storeKey = args.type + 's';
        const tmpFolder = (args.type === 'namespace') ? response : response.personalFolder;

        const locked = this.resourceLockCheck(tmpFolder.fullPath, state);

        const folder = this.dbfsUtils.normalizeFolder(tmpFolder, locked);
        folder.loaded = true;

        let trash: any;
        let trashIdx: any;
        // have to override topFolder name because all the Top folder names come back as 'HOME'
        if (folder.fullPath === '/user/' + state.activeUser) {
            folder.name = 'My Dashboards';
        } else {
            folder.name = state[storeKey][args.key].name;
        }

        if (response.personalFolder) {
            trash = response.personalFolder.subfolders.filter(item => item.fullPath.split('/').pop() === 'trash');
            trashIdx = response.personalFolder.subfolders.indexOf(trash[0]);
        } else {
            trash = response.subfolders.filter(item => item.fullPath.split('/').pop() === 'trash');
            trashIdx = response.subfolders.indexOf(trash[0]);
        }

        // get trash folder (topFolder should always have a trash folder)
        const trashFolder = this.dbfsUtils.normalizeFolder(trash[0]);
        folders[trashFolder.fullPath] = trashFolder;

        // pull it out of list to avoid sorting
        folder.subfolders.splice(trashIdx, 1);

        // clean subfolders
        folder.subfolders = folder.subfolders.map(item => {
            const subFolder = this.dbfsUtils.normalizeFolder(item, locked);
            folders[subFolder.fullPath] = subFolder;
            return subFolder.fullPath;
        });

        folder.subfolders = folder.subfolders.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(folders[a].name, folders[b].name);
        });

        // add trash back in folder list after sort. trash folder always last
        folder.subfolders.push(trashFolder.fullPath);

        folder.files = folder.files.map(item => {
            const file: DbfsFileModel = this.dbfsUtils.normalizeFile(item, locked);
            files[file.fullPath] = file;
            return item.fullPath;
        });

        folder.files.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(files[a].name, files[b].name);
        });

        folders[folder.fullPath] = folder;

        ctx.patchState({
            folders,
            files,
            resourceAction
        });

    }

    /** Create Folder */

    @Action(DbfsCreateFolder)
    createFolder(ctx: StateContext<DbfsResourcesModel>, { folder, resourceAction }: DbfsCreateFolder) {
        this.logger.action('State :: Create Folder', { folder, resourceAction });

        return this.service.createFolder(folder).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsCreateFolderSuccess(payload, { folder, resourceAction }));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Create Folder')))
        );
    }

    @Action(DbfsCreateFolderSuccess)
    createFolderSuccess(ctx: StateContext<DbfsResourcesModel>, { response, args }: DbfsCreateFolderSuccess) {
        this.logger.success('State :: Create Folder', { response, args });

        const state = ctx.getState();

        const folders = JSON.parse(JSON.stringify({ ...state.folders }));

        const folder = this.dbfsUtils.normalizeFolder(response);
        folder.loaded = true;

        folders[folder.fullPath] = folder;

        // update parent
        if (!folders[folder.parentPath].subfolders) {
            folders[folder.parentPath].subfolders = [];
        }
        folders[folder.parentPath].subfolders.push(folder.fullPath);

        // re-sort parent folders
        if (folders[folder.parentPath].subfolders.length > 1) {
            folders[folder.parentPath].subfolders = folders[folder.parentPath].subfolders.sort((a: any, b: any) => {
                return this.utils.sortAlphaNum(a, b);
            });
        }

        ctx.patchState({
            folders,
            resourceAction: args.resourceAction
        });
    }

    /** Delete Folder(s) */
    // this can handle bulk deletes
    @Action(DbfsDeleteFolder)
    deleteFolder(ctx: StateContext<DbfsResourcesModel>, { folders, resourceAction }: DbfsDeleteFolder) {
        const state = ctx.getState();

        if (folders.length > 0) {
            this.logger.action('State :: Delete Folder', { folders, resourceAction });
            const folderPath = folders.shift();
            const source = state.folders[folderPath];
            const details = this.dbfsUtils.detailsByFullPath(folderPath);
            const destination = state.folders[details.trashPath]; // trash folder

            return this.service.trashFolder(source.id, destination.id).pipe(
                map((payload: any) => {
                    return ctx.dispatch(new DbfsDeleteFolderSuccess(payload, { folders, resourceAction, originDetails: details }));
                }),
                catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Delete Folder')))
            );
        }
    }

    @Action(DbfsDeleteFolderSuccess)
    deleteFolderSuccess(ctx: StateContext<DbfsResourcesModel>, { response, args }: DbfsDeleteFolderSuccess) {
        this.logger.success('State :: Delete Folder', { response, args });

        ctx.dispatch(new DbfsUpdateFolderSuccess(response, { originDetails: args.originDetails, resourceAction: {} }));

        // see if you need to run it some more (batch mode)
        if (args.folders.length > 0) {
            ctx.dispatch(new DbfsDeleteFolder(args.folders, args.resourceAction));
        } else {
            // its done running the loop... run the resourceAction (if any)
            const state = ctx.getState();
            ctx.patchState({
                ...state,
                resourceAction: args.resourceAction
            });
        }
    }

    @Action(DbfsUpdateFolder)
    updateFolder(ctx: StateContext<DbfsResourcesModel>, { folder, originPath, resourceAction }: DbfsUpdateFolder) {
        this.logger.action('State :: Update Folder', { folder, originPath, resourceAction });
        const args = {
            originDetails: this.dbfsUtils.detailsByFullPath(originPath),
            resourceAction
        };

        return this.service.updateFolder(folder).pipe(
            map((payload: any) => {
                ctx.dispatch(new DbfsUpdateFolderSuccess(payload, args));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Update Folder')))
        );
    }

    @Action(DbfsUpdateFolderSuccess)
    updateFolderSuccess(ctx: StateContext<DbfsResourcesModel>, { response, args }: DbfsUpdateFolderSuccess) {
        this.logger.success('State :: Update Folder', { response, args });

        const state = ctx.getState();

        const folders = JSON.parse(JSON.stringify({ ...state.folders }));
        const files = JSON.parse(JSON.stringify({ ...state.files }));

        // get keys of folders and files that may contain the original path
        const folderKeys = Object.keys(folders).filter(item => item.includes(args.originDetails.fullPath));
        const fileKeys = Object.keys(files).filter(item => item.includes(args.originDetails.fullPath));

        // remove from origin parent folder subfolders
        const opfIdx = folders[args.originDetails.parentPath].subfolders.indexOf(args.originDetails.fullPath);
        folders[args.originDetails.parentPath].subfolders.splice(opfIdx, 1);

        // remove cache of children folders
        if (folderKeys.length > 0) {
            for (const key of folderKeys) {
                if (folders[key]) {
                    delete folders[key];
                }
            }
        }

        // remove cache of children files
        if (fileKeys.length > 0) {
            for (const key of fileKeys) {
                if (files[key]) {
                    delete files[key];
                }
            }
        }

        // update file
        // get new folder details
        const folder = this.dbfsUtils.normalizeFolder(response);
        folders[folder.fullPath] = folder;

        // update parent (if we have it cached)
        if (folders[folder.parentPath]) {
            if (!folders[folder.parentPath].subfolders) {
                folders[folder.parentPath].subfolders = [];
            }
            folders[folder.parentPath].subfolders.push(folder.fullPath);

            // re-sort parent folders
            if (folders[folder.parentPath].subfolders.length > 1) {
                folders[folder.parentPath].subfolders = folders[folder.parentPath].subfolders.sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(a, b);
                });
            }
        }

        ctx.patchState({
            folders,
            files,
            resourceAction: args.resourceAction
        });
    }

    /* Files */

    @Action(DbfsUpdateFile)
    updateFile(ctx: StateContext<DbfsResourcesModel>, { file, originPath, resourceAction }: DbfsUpdateFile) {
        this.logger.action('State :: Update Folder', { file, originPath, resourceAction });
        const args = {
            originDetails: this.dbfsUtils.detailsByFullPath(originPath),
            resourceAction
        };

        return this.service.updateFile(file).pipe(
            map((payload: any) => {
                ctx.dispatch(new DbfsUpdateFileSuccess(payload, args));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Update File')))
        );
    }

    @Action(DbfsUpdateFileSuccess)
    updateFileSuccess(ctx: StateContext<DbfsResourcesModel>, { response, args }: DbfsUpdateFileSuccess) {
        this.logger.success('State :: Update File', { response, args });

        const state = ctx.getState();

        const folders = JSON.parse(JSON.stringify({ ...state.folders }));
        const files = JSON.parse(JSON.stringify({ ...state.files }));

        // remove from origin parent folder files
        const opfIdx = folders[args.originDetails.parentPath].files.indexOf(args.originDetails.fullPath);
        folders[args.originDetails.parentPath].files.splice(opfIdx, 1);

        // remove cache of file
        delete files[args.originDetails.fullPath];

        // update file
        const file: DbfsFileModel = this.dbfsUtils.normalizeFile(response);
        files[file.fullPath] = file;

        // update parent (if we have it cached)
        if (folders[file.parentPath]) {

            if (!folders[file.parentPath].files) {
                folders[file.parentPath].files = [];
            }

            folders[file.parentPath].files.push(file.fullPath);

            // re-sort parent files
            if (folders[file.parentPath].files.length > 1) {
                folders[file.parentPath].files = folders[file.parentPath].files.sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(files[a].name, files[b].name);
                });
            }
        }

        ctx.patchState({
            folders,
            files,
            resourceAction: args.resourceAction
        });
    }

    @Action(DbfsDeleteDashboard)
    deleteDashboard(ctx: StateContext<DbfsResourcesModel>, { file, resourceAction }: DbfsDeleteDashboard) {
        this.logger.action('State :: Delete Dashboard', { file, resourceAction });
        const state = ctx.getState();
        const originDetails = this.dbfsUtils.detailsByFullPath(file);
        const source = state.files[file];
        const destination = state.folders[originDetails.trashPath];
        // console.log(originDetails, source, destination);

        return this.service.trashFile(source.id, destination.id).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsUpdateFileSuccess(payload, { file, resourceAction, originDetails }));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Delete Dashboard')))
        );
    }


    // generic Resource action
    @Action(DbfsMoveResource)
    moveResource(ctx: StateContext<DbfsResourcesModel>, { sourceId, destinationId, originPath, resourceAction }: DbfsMoveResource) {
        this.logger.action('State :: Move Folder', { sourceId, destinationId, originPath, resourceAction });

        const state = ctx.getState();

        const args = {
            originDetails: this.dbfsUtils.detailsByFullPath(originPath),
            resourceAction
        };

        const type: string = (state.files[originPath]) ? 'file' : 'folder';

        return this.service.moveFolder(sourceId, destinationId).pipe(
            map((payload: any) => {
                if (type === 'file') {
                    return ctx.dispatch(new DbfsUpdateFileSuccess(payload, args));
                } else {
                    return ctx.dispatch(new DbfsUpdateFolderSuccess(payload, args));
                }
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Move Folder')))
        );
    }

    @Action(DbfsAddPlaceholderFolder)
    addPlaceholderFolder(ctx: StateContext<DbfsResourcesModel>, { path, resourceAction }: DbfsAddPlaceholderFolder) {
        this.logger.action('State :: Add Placeholder Folder', { path, resourceAction });
        const state = ctx.getState();

        const folders = JSON.parse(JSON.stringify({ ...state.folders }));

        const locked = this.resourceLockCheck(path, state);

        const tmpFolder = {
            id: 0,
            name: 'loading',
            fullPath: path,
            path: path,
            files: [],
            subfolders: [],
            type: 'DASHBOARD'
        };

        const folder = this.dbfsUtils.normalizeFolder(tmpFolder, locked);

        folders[path] = folder;

        ctx.patchState({
            folders,
            resourceAction
        });

    }

    @Action(DbfsSetupFavoriteRecentPlaceholders)
    setupFavoriteRecentPlaceholders(ctx: StateContext<DbfsResourcesModel>, { }: DbfsSetupFavoriteRecentPlaceholders) {
        const state = ctx.getState();
        const favorites = state.userFavorites;
        const recents = state.userRecents;
        this.logger.action('State :: Setup Favorites Placeholders', { favorites, recents });
        const files = this.utils.deepClone(state.files);
        // const folders = state.folders; // might allow folders to be favorited in the future

        let placeholders = false;
        for (const fav of favorites) {
            if (!files[fav.fullPath]) {
                const file: DbfsFileModel = this.dbfsUtils.normalizeFile(fav);
                file.loaded = false;
                // console.log('===> FILE <===', file);
                files[file.fullPath] = file;
                placeholders = true;
            }
            // TODO: when/if we add folders, need to check that here and setup
        }

        for (const rec of recents) {
            if (!files[rec.fullPath]) {
                const file: DbfsFileModel = this.dbfsUtils.normalizeFile(rec);
                file.loaded = false;
                // console.log('===> FILE <===', file);
                files[file.fullPath] = file;
                placeholders = true;
            }
        }

        if (placeholders) {
            ctx.patchState({ files });
        }

    }

    /* Load Favorites */
    @Action(DbfsLoadUserFavorites)
    loadUserFavorites(ctx: StateContext<DbfsResourcesModel>, { userid, resourceAction }: DbfsLoadUserFavorites) {
        this.logger.action('State :: Load User Favorites', { userid, resourceAction });
        const curState = ctx.getState();

        userid = (userid) ? curState.users[userid].userid : curState.users[curState.activeUser].userid;

        return this.service.getUserFavoritesList(userid).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadUserFavoritesSuccess(payload, { userid }));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Load User Favorites [Fetching data]')))
        );

    }

    @Action(DbfsLoadUserFavoritesSuccess)
    loadUserFavoritesSuccess(ctx: StateContext<DbfsResourcesModel>, {response, resourceAction }: DbfsLoadUserFavoritesSuccess) {
        this.logger.success('State :: Load User Favorites', { response, resourceAction });
        const state = ctx.getState();
        const userFavorites: any = response.favorites;

        ctx.patchState({
            userFavorites,
            resourceAction
        });
    }

    /* add favorite */

    @Action(DbfsAddUserFav)
    addUserFav(ctx: StateContext<DbfsResourcesModel>, { resource, resourceAction }: DbfsAddUserFav) {
        this.logger.action('State :: Add User Fav', { resource, resourceAction });

        return this.service.addUserFavorite(resource.id).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsAddUserFavSuccess(payload, resource, resourceAction));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Add User Fav')))
        );
    }

    @Action(DbfsAddUserFavSuccess)
    addUserFavSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resource, resourceAction }: DbfsAddUserFavSuccess) {
        this.logger.success('State :: Add User Fav', { response, resourceAction });
        const state = ctx.getState();

        const userFavorites: any[] = this.utils.deepClone(state.userFavorites);

        const index = userFavorites.findIndex(item => item.id === resource.id);

        // we don't have that favorite, so lets add it to the front
        if (index === -1) {
            userFavorites.unshift(resource);
            ctx.patchState({ userFavorites, resourceAction });
        }
    }

    /* remove favorite */

    @Action(DbfsRemoveUserFav)
    removeUserFav(ctx: StateContext<DbfsResourcesModel>, { resource, resourceAction }: DbfsRemoveUserFav) {
        this.logger.action('State :: Remove User Fav', { resource, resourceAction });

        return this.service.removeUserFavorite(resource.id).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsRemoveUserFavSuccess(payload, resource, resourceAction));
            }),
            catchError(error => ctx.dispatch(new DbfsResourcesError(error, 'Remove User Fav')))
        );
    }

    @Action(DbfsRemoveUserFavSuccess)
    removeUserFavSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resource, resourceAction }: DbfsRemoveUserFavSuccess) {
        this.logger.success('State :: Remove User Fav', { response, resourceAction });
        const state = ctx.getState();

        const userFavorites: any[] = this.utils.deepClone(state.userFavorites);

        const index = userFavorites.findIndex(item => item.fullPath === resource.fullPath);

        // it exists, so lets remove it
        if (index > -1) {
            userFavorites.splice(index, 1);
            ctx.patchState({ userFavorites, resourceAction });
        }
    }

    /* Load User Recents */
    @Action(DbfsLoadUserRecents)
    loadUserRecents(ctx: StateContext<DbfsResourcesModel>, { userid, limit, resourceAction }: DbfsLoadUserRecents) {
        const state = ctx.getState();

        userid = (userid) ? state.users[userid].userid : state.users[state.activeUser].userid;
        limit = (limit) ? limit : 50;

        return this.service.getUserRecentList(userid, limit).pipe(
            map((payload: any) => {
                return ctx.dispatch(new DbfsLoadUserRecentsSuccess(payload, resourceAction));
            }),
            catchError( error => ctx.dispatch(new DbfsResourcesError(error, 'Load User Recents')))
        );

    }

    @Action(DbfsLoadUserRecentsSuccess)
    loadUserRecentsSuccess(ctx: StateContext<DbfsResourcesModel>, { response, resourceAction }: DbfsLoadUserRecentsSuccess) {
        const state = ctx.getState();
        ctx.patchState({
            userRecents: response.recent,
            resourceAction
        });
    }


    /* General Error Action */
    @Action(DbfsResourcesError)
    resourcesError(ctx: StateContext<DbfsResourcesModel>, { error, label }: DbfsResourcesError) {
        this.logger.error('State :: ' + label, error);
        ctx.dispatch({ error });
    }

}

