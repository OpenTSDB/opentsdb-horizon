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
// common
export interface DbfsCommonResourceModel {
    // common from config db
    id: number;
    name: string;
    path: string;
    fullPath: string;
    createdTime?: number;
    createdBy?: string; // should be userid
    updatedTime?: number;
    updatedBy?: string; // should be userid
    type?: string;
    // common used within horizon
    resourceType?: string; // folder || file
    ownerType?: string; // user || namespace
    icon?: string;
    namespace?: string; // namespace alias
    user?: string;
    locked?: boolean;
}

// file models
export interface DbfsFileModel extends DbfsCommonResourceModel {
    parentPath: string;
    loaded?: boolean;
    hidden?: boolean;
}

// folder models

export interface DbfsFolderModel extends DbfsCommonResourceModel {
    subfolders?: any[];
    files?: any[];
    loaded?: boolean;
    trashFolder?: boolean;
    topFolder?: boolean;
    parentPath?: string;
}

export interface DbfsPanelFolderModel extends DbfsFolderModel {
    moveEnabled: boolean;
    selectEnabled: boolean;
    selected: boolean;
    noDisplay?: boolean;
}

export interface DbfsSyntheticFolderModel extends DbfsCommonResourceModel {
    synthetic: boolean;
    root?: boolean;
    personal?: any[];
    namespaces?: any[];

    // items needed for miniNav
    // moveEnabled?: boolean;
    // selectEnabled?: boolean;
    noDisplay?: boolean;
    selected?: boolean;
}

// namespace model (DIFFERENT from namespace folder)
export interface DbfsNamespaceModel {
    // these should always have value
    id: number;
    name: string;
    alias: string;
    // these possibly could come back null depending on where data comes from
    createdTime?: any;
    createdBy?: any;
    updatedTime?: any;
    updatedBy?: any;
    dhtracks?: any;
    enabled?: any;
    meta?: any;
}

// user model
export interface DbfsUserModel {
    alias: string;
    userid: string;
    name: string;
    memberNamespaces?: any[];
}

// Favorites Model
export interface DbfsFavoriteModel {
    createdTime: number;
    createdBy: string;
    updatedTime: number;
    updatedBy: string;
    id: number;
    name: string;
    type: string;
    path: string;
    fullPath: string;
    favoritedTime: number;
}

// state model
export interface DbfsResourcesModel {
    // activeUser is ID of user the cookie belongs to
    activeUser: string;
    users: {}; // when pulling users other than active user
    userList: any[];
    namespaces: {}; // namespaces data... NOT namespace folder
    namespaceList: any[];
    userFavorites: any[];
    userRecents: any[];
    folders: {}; // user and namespace folders
    files: {}; // user and namespace files (dashboards)
    error: {};
    loaded: boolean;
    dynamicLoaded: {
        users: boolean;
        namespaces: boolean;
        favorites: boolean;
        recents: boolean;
    };
    resourceAction: {};
}
