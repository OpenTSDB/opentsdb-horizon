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

import { Injectable } from '@angular/core';
import {
    State,
    StateContext,
    Action,
    Store,
    Selector,
    createSelector,
} from '@ngxs/store';
import { UtilsService } from '../../../../core/services/utils.service';

import { DbfsPanelsState } from './dbfs-panels.state';
import { DbfsResourcesState } from './dbfs-resources.state';
import { DbfsResourcesModel } from './dbfs-resources.interfaces';
import { DBState } from '../../../../dashboard/state';

/** Interface model */

export interface DbfsStateModel {
    initialized: boolean;
    // error: {};
    error: any;
}

/** Actions */
export class DbfsInitialized {
    public static type = '[DBFS] Initialized';
    constructor() {}
}

/** State */
@Injectable()
@State<DbfsStateModel>({
    name: 'DBFS',
    defaults: {
        initialized: false,
        error: {},
    },
    children: [DbfsPanelsState, DbfsResourcesState],
})

// state
export class DbfsState {
    constructor(
        private store: Store,
        private util: UtilsService,
    ) {}

    /** SELECTORS */
    @Selector() static getError(state: DbfsStateModel) {
        return state.error;
    }

    @Selector() static getInitialized(state: DbfsStateModel) {
        return state.initialized;
    }

    /** CROSS-STATE && DYNAMIC SELECTORS */

    @Selector([DBState])
    static getLoadedDashboardId(dbstate) {
        return dbstate.id || false;
    }

    // utility selector to get a users profile
    // defaults to activeUser (Browser Session User)
    // fullDetail optional parameter, will expand out memberNamespace with more detail
    static getUser(userid?: any, fullDetail?: boolean) {
        return createSelector(
            [DbfsResourcesState],
            (state: DbfsResourcesModel) => {
                if (state.loaded === false) {
                    return { loaded: false };
                }

                const id = userid ? userid : state.activeUser;
                let user: any = { ...state.users[id], loaded: true };

                // get more detailed member namespace data, including folder
                // user can write to these namespaces
                if (fullDetail) {
                    let namespaces = [];
                    namespaces = user.memberNamespaces.map((item) => {
                        const data = {
                            alias: state.namespaces[item].alias,
                            id: state.namespaces[item].id, // NAMESPACE ID - !!NOT THE NAMESPACE FOLDER ID (see folder object for namespace folder id)
                            name: state.namespaces[item].name,
                            enabled: state.namespaces[item].enabled,
                            folder: { ...state.folders['/namespace/' + item] },
                        };
                        return data;
                    });
                    user = { ...user, memberNamespaces: namespaces };
                }

                return user;
            },
        );
    }

    static adminMember(userid?: string) {
        return createSelector(
            [DbfsResourcesState],
            (state: DbfsResourcesModel) => {
                if (state.loaded === false) {
                    return { loaded: false };
                }

                const id = userid ? userid : state.activeUser;
                const user: any = { ...state.users[id], loaded: true };

                return user.memberNamespaces.includes('admin');
            },
        );
    }

    // utility selector to get a users member namespaces
    // will default to activeUser (Browser Session User)
    static getUserMemberNamespaceData(userid?: string) {
        return createSelector(
            [DbfsResourcesState],
            (state: DbfsResourcesModel) => {
                if (state.loaded === false) {
                    return [];
                }

                const id = userid ? userid : state.activeUser;
                const user = { ...state.users[id] };
                let namespaces = [];

                // filter this, because filtering doesn't work correctly with ALL the data
                namespaces = user.memberNamespaces.map((item) => {
                    const data = {
                        alias: state.namespaces[item].alias,
                        // NAMESPACE ID - !!NOT THE NAMESPACE FOLDER ID (see folder object for namespace folder id)
                        id: state.namespaces[item].id,
                        name: state.namespaces[item].name,
                        enabled: state.namespaces[item].enabled,
                        folder: { ...state.folders['/namespace/' + item] },
                    };
                    return data;
                });
                return namespaces;
            },
        );
    }

    // this selector is meant to return data in a format similar to what was originally defined in <DBState>Dashboard.UserSettings
    // will default to activeUser (Browser Session User)
    static getUserFolderData(userid?: any) {
        return createSelector(
            [DbfsResourcesState],
            (state: DbfsResourcesModel) => {
                if (state.loaded === false) {
                    return { loaded: false };
                }

                const id = userid ? userid : state.activeUser;
                const userData: any = {
                    ...state.users[id],
                    namespaces: [],
                    personalFolders: [],
                    namespaceFolders: [],
                    loaded: true,
                };

                for (let i = 0; i < userData.memberNamespaces.length; i++) {
                    const ns = userData.memberNamespaces[i];
                    const nsData = {
                        alias: state.namespaces[ns].alias,
                        // NAMESPACE ID - !!NOT THE NAMESPACE FOLDER ID (see folder object for namespace folder id)
                        id: state.namespaces[ns].id,
                        name: state.namespaces[ns].name,
                        enabled: state.namespaces[ns].enabled,
                    };
                    const nsFolder = { ...state.folders['/namespace/' + ns] };
                    delete nsFolder.subfolders;
                    delete nsFolder.files;
                    userData.namespaces.push(nsData);
                    userData.namespaceFolders.push(nsFolder);
                }

                const personalFolder = { ...state.folders['/user/' + id] };
                delete personalFolder.subfolders;
                delete personalFolder.files;

                userData.personalFolders = [personalFolder];

                return userData;
            },
        );
    }

    /** ACTIONS */

    @Action(DbfsInitialized)
    setInitialized(ctx: StateContext<DbfsStateModel>, {}: DbfsInitialized) {
        ctx.patchState({
            initialized: true,
        });
    }
}
