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
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, map} from 'rxjs/operators';

import {
    DbfsCreateFolder,
    DbfsResourcesState, DbfsState,
    DbfsFolderModel,
    DbfsDeleteDashboard
} from '../../dashboard-filesystem/state';

import { UtilsService } from '../../../../core/services/utils.service';
import { ClipboardService } from '../services/clipboard.service';
import { DbfsService } from '../../dashboard-filesystem/services/dbfs.service';
import { DbfsLoadSubfolder } from '../../dashboard-filesystem/state/dbfs-resources.state';
import { HttpService } from '../../../../core/http/http.service';

// MODEL INTERFACES

// this.is basially a DBFS file/dashboard
export interface ClipboardModel {
    resource: any; // pointer to DBFS file resource <DbfsFileModel>
    active: boolean; // actual dashboard content
}

// this is basically loads and transforms a DBFS folder '/user/[user.namer]/_clipboard_'
export interface ClipboardResourceModel {
    loaded: boolean;
    showProgress: boolean;
    resource: any; // pointer to DBFS folder resource <DbfsFolderModel>
    clipboardsList: ClipboardModel[];  // list of clipboards ClipboardModel[]
    clipboard: any; // active clipboard
    clipboardAction: any; // clipboard actions
}

// ACTION DEFINITIONS

export class ClipboardError {
    static readonly type = '[Clipboard] Error happened';
    constructor(
        public readonly error: any,
        public readonly label: string = 'Generic Error'
    ) { }
}

export class ClipboardResourceInitialize {
    public static type = '[Clipboard] Initialize';
    constructor() { }
}

export class ClipboardResourceInitializeSuccess {
    public static type = '[Clipboard] Initialize SUCCESS';
    constructor() { }
}

/** CLIPBOARD ACTION */

// Create CLIPBOARD
export class ClipboardCreate {
    public static type = '[Clipboard] Create';
    constructor(
        public readonly title: any
    ) {}
}

export class ClipboardCreateSuccess {
    public static type = '[Clipboard] Create SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

// Delete/remove CLIPBOARD
export class ClipboardRemove {
    public static type = '[Clipboard] Remove';
    constructor(
        public readonly index: any
    ) {}
}

export class ClipboardRemoveSuccess {
    public static type = '[Clipboard] Remove SUCCESS';
    constructor(
        public readonly response: any,
        public readonly index: any
    ) {}
}

// Modify (rename maybe?) CLIPBOARD
export class ClipboardModify {
    public static type = '[Clipboard] Modify';
    constructor(
        public readonly clipboard: any,
        public readonly index: any
    ) {}
}

export class ClipboardModifySuccess {
    public static type = '[Clipboard] Modify SUCCESS';
    constructor(
        public readonly response: any,
        public readonly index: any
    ) {}
}

// Load a CLIPBOARD into active
export class ClipboardLoad {
    public static type = '[Clipboard] Load';
    constructor() { }
}

export class ClipboardLoadSuccess {
    public static type = '[Clipboard] Load SUCCESS';
    constructor(
        public readonly response: any
    ) { }
}

/** CLIPBOARD ITEM(S) */
export class ClipboardAddItems {
    public static type = '[Clipboard] Add Item';
    constructor(
        public readonly items: any[]
    ) { }
}

export class ClipboardAddItemsSuccess {
    public static type = '[Clipboard] Add Item SUCCESS';
    constructor(
        public readonly response: any,
        public readonly args: any
    ) { }
}

export class ClipboardRemoveItems {
    public static type = '[Clipboard] Remove Items';
    constructor(
        public readonly items: any[] // should be array of widget ids
    ) { }
}

export class ClipboardRemoveItemsSuccess {
    public static type = '[Clipboard] Remove Items SUCCESS';
    constructor(
        public readonly response: any
    ) { }
}

export class ClipboardModifyItem {
    public static type = '[Clipboard] Modify Item';
    constructor(
        public readonly item: any,
        public readonly index: any
    ) {}
}

export class ClipboardModifyItemSuccess {
    public static type = '[Clipboard] Modify Item SUCCESS';
    constructor(
        public readonly response: any,
        public readonly index: any
    ) {}
}

// set the clipboard active
export class SetClipboardActive {
    public static type = '[Clipboard] Activate Clipboard';
    constructor(
        public readonly index: any
    ) {}
}

export class SetClipboardActiveSuccess {
    public static type = '[Clipboard] Activate Clipboard SUCCESS';
    constructor() {}
}

export class SetShowProgress {
    public static type = '[Clipboard] Show Progress';
    constructor() {}
}

export class SetHideProgress {
    public static type = '[Clipboard] Hide Progress';
    constructor() {}
}


// state
@State<ClipboardResourceModel>({
    name: 'Clipboard',
    defaults: {
        loaded: false,
        resource: false,
        showProgress: false,
        clipboardsList: [],
        clipboard: false,
        clipboardAction: {}
    }
})
export class UniversalClipboardState {

    timeoutTries: number = 0;

    constructor(
        private store:      Store,
        private utils:      UtilsService,
        private service:    ClipboardService,
        private dbfs:       DbfsService,
        private http:       HttpService
    ) { }

    // SELECTORS

    @Selector() static getClipboardResourceLoaded(state: ClipboardResourceModel) {
        return state.loaded;
    }

    @Selector() static getShowProgress(state: ClipboardResourceModel) {
        return state.showProgress;
    }

    @Selector() static getClipboards(state: ClipboardResourceModel) {
        return state.clipboardsList;
    }

    @Selector() static getActiveClipboardSelected(state: ClipboardResourceModel) {
        const active = state.clipboardsList.filter(item => item.active);
        return active[0];
    }

    @Selector() static getActiveClipboardSelectedIndex(state: ClipboardResourceModel) {
        const active = state.clipboardsList.findIndex(item => item.active);
        return active;
    }

    @Selector() static getActiveClipboard(state: ClipboardResourceModel) {
        return state.clipboard;
    }

    @Selector() static getClipboardItems(state: ClipboardResourceModel) {
        return (
            state.clipboard
            && state.clipboard.content
            && state.clipboard.content.widgets
        ) ? state.clipboard.content.widgets : [];
    }

    @Selector() static getClipboardActions(state: ClipboardResourceModel) {
        return state.clipboardAction;
    }

    // ACTIONS
    @Action(ClipboardResourceInitialize)
    clipboardResourceInitialization(ctx: StateContext<ClipboardResourceModel>, {}: ClipboardResourceInitialize) {
        // cb resource check
        const cbResource = this.service.clipboardFolderResource();

        if (!cbResource) {

            // get current logged in user
            const user = this.store.selectSnapshot(DbfsState.getUser());

            // user folder
            const userFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder('/user/' + user.alias));

            // CB folder path
            const folderPath = userFolder.path + '/_clipboard_';

            // setup folder
            const folderPayload: any = {
                name: '_clipboard_',
                parentId: userFolder.id
            };
            this.store.dispatch(new DbfsCreateFolder(folderPayload, {})).pipe(
                map((res: any) => {
                    // folder created, now lets create default clipboard
                    this.service.createClipboardResource('Default clipboard').pipe(
                        map((payload: any) => {
                            // resource created successfully... tell DBFS to update folder
                            this.store.dispatch(new DbfsLoadSubfolder(folderPath, {})).pipe(
                                map(() => {
                                    // try the initialization again
                                    this.store.dispatch(new ClipboardResourceInitialize());
                                })
                            ).subscribe();
                        }),
                        catchError(error => ctx.dispatch(new ClipboardError(error, 'clipboardResourceInitialization :: Create default clipboard resource [1]')))
                    );
                }),
                catchError(error => ctx.dispatch(new ClipboardError(error, 'clipboardResourceInitialization :: Create clipboard folder')))
            ).subscribe();
        } else {
            // folder exists...:D
            // load the clipboard resource folder
            this.store.dispatch(new DbfsLoadSubfolder(cbResource.fullPath, {})).pipe(
                map(() => {
                    // check for default clipboard
                    const defaultCheck = this.store.selectSnapshot(DbfsResourcesState.getFile(cbResource.fullPath + '/default-clipboard'));
                    if (!defaultCheck) {
                        // hmmm... for some reason it didn't get created, or maybe it was deleted
                        this.service.createClipboardResource('Default clipboard').pipe(
                            map((payload: any) => {
                                // resource created successfully... tell DBFS to update folder
                                this.store.dispatch(new DbfsLoadSubfolder(cbResource.fullPath, {})).pipe(
                                    map(() => {
                                        // should be successful now
                                        this.store.dispatch(new ClipboardResourceInitializeSuccess());
                                    })
                                ).subscribe();
                            }),
                            catchError(error => ctx.dispatch(new ClipboardError(error, 'clipboardResourceInitialization :: Create default clipboard resource [2]')))
                        ).subscribe();
                    } else {
                        ctx.dispatch(new ClipboardResourceInitializeSuccess());
                    }
                }),
                catchError(error => ctx.dispatch(new ClipboardError(error, 'clipboardResourceInitialization :: Loading resource folder')))
            ).subscribe();

        }
    }

    @Action(ClipboardResourceInitializeSuccess)
    clipboardResourceInitializationSuccess(ctx: StateContext<ClipboardResourceModel>, {}: ClipboardResourceInitializeSuccess) {
        // get resource
        const resource: DbfsFolderModel = this.service.clipboardFolderResource();
        const files: any[] = resource.files;

        // sort & parse files
        let clipboardsList = this.service.sortClipboards(files);

        // check if there is an active one already
        const curActiveIndex = this.store.selectSnapshot(UniversalClipboardState.getActiveClipboardSelectedIndex);

        clipboardsList = clipboardsList.map((item: any, i: any) => {
            let isActive: any = false;
            if (curActiveIndex !== -1) {
                isActive = curActiveIndex === i;
            } else {
                isActive = item.name === 'Default clipboard';
            }

            return {
                resource: item,
                active: isActive
            };
        });

        const state = ctx.getState();

        ctx.setState({
            ...state,
            loaded: true,
            resource,
            clipboardsList
        });
    }

    /** CLIPBOARDS */

    @Action(ClipboardLoad)
    clipboardLoad(ctx: StateContext<ClipboardResourceModel>, { }: ClipboardLoad) {

        const state = ctx.getState();
        const active: any[] = state.clipboardsList.filter(item => item.active);

        if (active.length === 0) {
            ctx.dispatch(new ClipboardError(new Error('No active clipboard'), 'Clipboard Load'));
        } else {
            this.service.loadClipboard(active[0].resource.id)
                .subscribe(
                    (res: any) => {
                        ctx.dispatch(new ClipboardLoadSuccess(res.body));

                    },
                    error => { ctx.dispatch(new ClipboardError(error, 'Clipboard Load')); }
                );
        }

    }

    @Action(ClipboardLoadSuccess)
    clipboardLoadSuccess(ctx: StateContext<ClipboardResourceModel>, { response }: ClipboardLoadSuccess) {

        const state = ctx.getState();

        for (let i = 0; i < response.content.widgets.length; i++) {
            if (!response.content.widgets[i].settings.clipboardMeta.cbId) {
                response.content.widgets[i].settings.clipboardMeta.cbId = this.service.generateUniqueClipboardItemId(response.content.widgets[i].id);
            }
        }

        ctx.setState({
            ...state,
            clipboard: response
        });
    }

    // create Clipboard
    @Action(ClipboardCreate)
    clipboardCreate(ctx: StateContext<ClipboardResourceModel>, { title }: ClipboardCreate) {
        this.service.createClipboardResource(title)
            .subscribe(
                (res: any) => {
                    ctx.dispatch( new ClipboardCreateSuccess(res.body));
                },
                error => { ctx.dispatch(new ClipboardError(error, 'Create Clipboard failed')); }
            )
    }

    @Action(ClipboardCreateSuccess)
    clipboardCreateSuccess(ctx: StateContext<ClipboardResourceModel>, { response }: ClipboardCreateSuccess) {
        const cbResource = this.service.clipboardFolderResource();
        this.store.dispatch(new DbfsLoadSubfolder(cbResource.fullPath, {})).pipe(
            map(() => {
                // should be good
                ctx.dispatch(
                    new ClipboardResourceInitializeSuccess()
                ).subscribe(() => {
                    // get new clipboard index
                    let state = ctx.getState();
                    let list = state.clipboardsList;
                    let index = list.findIndex(item => {
                        return item.resource.id === response.id;
                    });

                    if (index > -1) {
                        // make it active
                        ctx.dispatch(new SetClipboardActive(index));
                    } else {
                        throw new Error('Can not find index for new clipboard');
                    }
                });
            }),
            catchError(error => ctx.dispatch(new ClipboardError(error, 'clipboardCreateSuccess :: error in clipboard creation')))
        ).subscribe();
    }

    // modify clipboard
    @Action(ClipboardModify)
    clipboardModify(ctx: StateContext<ClipboardResourceModel>, { clipboard, index }: ClipboardModify) {
        // TODO
    }

    @Action(ClipboardModifySuccess)
    clipboardModifySuccess(ctx: StateContext<ClipboardResourceModel>, { response, index }: ClipboardModifySuccess) {
        // TODO
    }

    // remove clipboard - basically move to trash
    @Action(ClipboardRemove)
    clipboardRemove(ctx: StateContext<ClipboardResourceModel>, { index }: ClipboardRemove) {
        let state = ctx.getState();
        if (index === 0) {
            // can't delete default
            ctx.dispatch(new ClipboardError({message: 'Can not delete Default'}, 'clipboardRemove :: error in clipboard removal'));
        } else {
            let cbList = state.clipboardsList
            // get the cb "dashboard"
            let cbDB = cbList[index];


            ctx.dispatch([
                new SetClipboardActive(0), // set active to default
                new DbfsDeleteDashboard(cbDB.resource.fullPath, {})
            ]).subscribe(
                (resp: any) => {
                    // good
                    ctx.dispatch(new ClipboardRemoveSuccess(resp, index));
                },
                (error: any) => {
                    // error
                    ctx.dispatch(new ClipboardError(error, 'Clipboard Removal [Clipboard Remove]'));
                }
            );
        }
    }

    @Action(ClipboardRemoveSuccess)
    clipboardRemoveSuccess(ctx: StateContext<ClipboardResourceModel>, { response, index }: ClipboardRemoveSuccess) {
        ctx.dispatch(new ClipboardResourceInitialize());
    }

    /** CLIPBOARD ITEMS (aka widgets) */

    // add Clipboard Item - Will add to the active clipboard widgets
    @Action(ClipboardAddItems)
    clipboardAddItems(ctx: StateContext<ClipboardResourceModel>, { items }: ClipboardAddItems) {

        if (this.timeoutTries > 2) {
            ctx.dispatch(new ClipboardError(new Error('Action Timed Out'), 'Clipboard Add Items'));
            this.timeoutTries = 0;
            // we can try loading clipboard...one last time
            ctx.dispatch(new ClipboardLoad()).subscribe(
                () => {
                    ctx.dispatch(new ClipboardAddItems(items));
                },
                (error: any) => {
                    ctx.dispatch(new ClipboardError(error, 'Clipboard Add Items [Clipboard Load] - FINAL TRY'));
                }
            );
            return;
        }

        const state = ctx.getState();

        let clipboard: any = this.utils.deepClone(state.clipboard);

        // check if clipboard or clipboard content is there?
        if (!clipboard || !clipboard.content) {
            this.timeoutTries++;
            // maybe it hasn't loaded yet
            // timeout a new request
            setTimeout(() => {
                ctx.dispatch(new ClipboardAddItems(items));
            }, 500);

        } else {
            // reset timeout tries
            this.timeoutTries = 0;

            for(let i = 0; i < items.length; i++) {
                // add a specific clipboard identifier
                items[i].settings.clipboardMeta.cbId = this.service.generateUniqueClipboardItemId(items[i].id);
            }

            const mergedWidgets: any[] = items.concat(clipboard.content.widgets || []);
            clipboard.content.widgets = mergedWidgets;

            //clipboard.content.widgets.unshift(item);

            const activeId = clipboard.id;

            this.service.saveClipboard(activeId, clipboard)
                .subscribe(
                    (res: any) => {
                        ctx.dispatch(new ClipboardAddItemsSuccess(res, {}));
                    },
                    error => { ctx.dispatch(new ClipboardError(error, 'Save Clipboard Failed')); }
                );
        }

    }

    @Action(ClipboardAddItemsSuccess)
    clipboardAddItemsSuccess(ctx: StateContext<ClipboardResourceModel>, { response, args }: ClipboardAddItemsSuccess) {
        const state = ctx.getState();

        ctx.setState({
            ...state,
            clipboard: response.body
        });
    }

    // modify clipboard item from active clipboard
    @Action(ClipboardModifyItem)
    clipboardModifyItem(ctx: StateContext<ClipboardResourceModel>, { item, index }: ClipboardModifyItem) {
        // TODO
    }

    @Action(ClipboardModifyItemSuccess)
    clipboardModifyItemSuccess(ctx: StateContext<ClipboardResourceModel>, { response, index }: ClipboardModifyItemSuccess) {
        // TODO
    }

    // remove clipboard item from active clipboard
    @Action(ClipboardRemoveItems)
    clipboardRemoveItems(ctx: StateContext<ClipboardResourceModel>, { items }: ClipboardRemoveItems) {

        const state = ctx.getState();

        const dashboard: any = this.utils.deepClone(state.clipboard);

        let widgets = [...dashboard.content.widgets];

        widgets = widgets.filter((item: any) => {
            return !items.includes(item.settings.clipboardMeta.cbId);
        });

        dashboard.content.widgets = widgets;

        // now need to save dashboard
        this.http.saveDashboard(dashboard.id, dashboard)
            .subscribe(
                (res: any) => {
                    ctx.dispatch(new ClipboardRemoveItemsSuccess(dashboard));
                },
                error => { ctx.dispatch(new ClipboardError(error, 'Remove Clipboard Items Failed')); }
            )
    }

    @Action(ClipboardRemoveItemsSuccess)
    clipboardRemoveItemSuccess(ctx: StateContext<ClipboardResourceModel>, { response }: ClipboardRemoveItemsSuccess) {
        var state = ctx.getState();

        ctx.setState({...state,
           clipboard: response
        });
    }

    // activate clipboard
    @Action(SetClipboardActive)
    setClipboardActive(ctx: StateContext<ClipboardResourceModel>, { index }: SetClipboardActive) {
        const state = ctx.getState();
        let clipboardsList: any[] = this.utils.deepClone(state.clipboardsList);

        clipboardsList.forEach((item: any, i: any) => {

            let updatedItem: any = {
                ...item,
                active: (i === index)
            }

            clipboardsList[i] = updatedItem;
        });

        try {
            ctx.setState({
                ...state,
                clipboardsList
            });
        }
        catch(error) {
            ctx.dispatch(new ClipboardError(error, 'Set clipboard active Failed'));
        }

        ctx.dispatch(new SetClipboardActiveSuccess());
    }

    @Action(SetClipboardActiveSuccess)
    setClipboardActiveSuccess(ctx: StateContext<ClipboardResourceModel>, {}: SetClipboardActiveSuccess) {
        ctx.dispatch(new ClipboardLoad());
    }

    /** Progress */
    @Action(SetShowProgress)
    setShowProgress(ctx: StateContext<ClipboardResourceModel>, {}: SetShowProgress) {
        let state = ctx.getState();
        ctx.setState({
            ...state,
            showProgress: true
        });
    }

    @Action(SetHideProgress)
    setHideProgress(ctx: StateContext<ClipboardResourceModel>, {}: SetHideProgress) {
        let state = ctx.getState();
        ctx.setState({
            ...state,
            showProgress: false
        });
    }

    /** General Error Action */
    @Action(ClipboardError)
    clipboardError(ctx: StateContext<ClipboardResourceModel>, { error, label }: ClipboardError) {
        console.group(
            '%cERROR%c' + label,
            'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
            'color: #ff0000; padding: 4px 8px; font-weight: bold'
        );
        console.log('%cErrorMsg', 'font-weight: bold;', error);
        console.groupEnd();
    }
}
