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
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { HttpService } from '../../core/http/http.service';
import { map, catchError } from 'rxjs/operators';

export interface UserSettingsModel {
    userid: string;
    namespaces: string[];
    personalFolders: any[];
    namespaceFolders: any[];
}

export class LoadUserNamespaces {
    public static type = '[Dashboard] Load User Namespaces';
    constructor() { }
}

export class UpdateUserNamespaces {
    public static type = '[Dashboard] Update User Namespaces';
    constructor(public readonly namespaces: any) { }
}

export class UpdatePersonalFolders {
    public static type = '[Dashboard] Update User Personal folders';
    constructor(public readonly personalFolders: any) { }
}

export class UpdateNamespaceFolders {
    public static type = '[Dashboard] Update Namespace Folders';
    constructor(public readonly namespaceFolders: any) { }
}

export class LoadUserFolderData {
    public static type = '[Dashboard] Load User Namespaces';
    constructor() { }
}


@State<UserSettingsModel>({
    name: 'UserSettings',
    defaults: {
        userid: '',
        namespaces: [],
        personalFolders: [],
        namespaceFolders: []
    }
})

export class UserSettingsState {
    constructor(private httpService: HttpService) { }

    @Selector() static GetUserSettings(state: UserSettingsModel) {
        return state;
    }

    @Selector() static GetUserNamespaces(state: UserSettingsModel) {
        return state.namespaces;
    }

    @Selector()
    static GetNamespaceFolders(state: UserSettingsModel) {
        return state.namespaceFolders;
    }

    @Selector()
    static GetPersonalFolders(state: UserSettingsModel) {
        return state.personalFolders;
    }

    // this might go away, as folder data will return namespace data
    @Action(LoadUserNamespaces)
    loadUserNamespaces(ctx: StateContext<UserSettingsModel>) {
        return this.httpService.userNamespaces().pipe(
            map((namespaces: any) => {
                ctx.dispatch(new UpdateUserNamespaces(namespaces.body));
            })
        );
    }

    @Action(LoadUserFolderData)
    LoadUserFolderData(ctx: StateContext<UserSettingsModel>) {
        return this.httpService.getUserFolderData().pipe(
            map((response: any) => {
                if (response.body.memberNamespaces) {
                    const memberNamspaces = [];
                    const namespaceFolders = [];
                    for (const ns of response.body.memberNamespaces) {
                        // extract the namespace entry (IT IS DIFFERENT from namespace folder)
                        memberNamspaces.push(ns.namespace);

                        // extract the namesapce folder data
                        const nsFolder = ns.folder;
                        nsFolder.name = ns.namespace.name;
                        nsFolder.alias = ns.namespace.alias;
                        delete nsFolder.subfolders;
                        delete nsFolder.files;
                        namespaceFolders.push(nsFolder);
                    }
                    ctx.dispatch(new UpdateUserNamespaces(memberNamspaces));
                    ctx.dispatch(new UpdateNamespaceFolders(namespaceFolders));
                }

                // just getting the top level folder for now until we can inject the mini navigator
                const personalFolder = response.body.personalFolder;
                delete personalFolder.subfolders;
                delete personalFolder.files;
                ctx.dispatch(new UpdatePersonalFolders([personalFolder]));
            })
        );
    }

    @Action(UpdateUserNamespaces)
    updateUserNamespaces(ctx: StateContext<UserSettingsModel>, { namespaces }: UpdateUserNamespaces) {
        const state = ctx.getState();
        ctx.patchState({ ...state, namespaces: namespaces });
    }

    @Action(UpdatePersonalFolders)
    updatePersonalFolders(ctx: StateContext<UserSettingsModel>, { personalFolders }: UpdatePersonalFolders) {
        const state = ctx.getState();
        ctx.patchState({ ...state, personalFolders: personalFolders });
    }

    @Action(UpdateNamespaceFolders)
    updateNamespaceFolders(ctx: StateContext<UserSettingsModel>, { namespaceFolders }: UpdateNamespaceFolders) {
        const state = ctx.getState();
        ctx.patchState({ ...state, namespaceFolders: namespaceFolders });
    }


}
