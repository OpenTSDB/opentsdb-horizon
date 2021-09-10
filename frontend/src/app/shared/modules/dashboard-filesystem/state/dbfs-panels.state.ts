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
import { State, StateContext, Action, Store, Selector, createSelector } from '@ngxs/store';
import { UtilsService } from '../../../../core/services/utils.service';

/** INTERFACES */

export interface DbfsPanelModel {
    index: number; // not sure if needed
    folderResource: string; // key to look up folder in resources
    root?: boolean;
    synthetic?: boolean;
    dynamic?: boolean;
    trashFolder?: true;
    moveEnabled?: boolean;
    selectEnabled?: boolean;
    locked?: boolean;
    loaded?: boolean;
}

export interface DbfsPanelsModel {
    panelTab: string;
    personalTab: {
      curPanel: number;
      panels: DbfsPanelModel[];
    };
    favoritesTab: {
      curPanel: number;
      panels: DbfsPanelModel[];
    };
    recentTab: {
      curPanel: number;
      panels: DbfsPanelModel[];
    };
    usersTab: {
      curPanel: number;
      panels: DbfsPanelModel[];
    };
    namespacesTab: {
      curPanel: number;
      panels: DbfsPanelModel[];
    };
    // panels: DbfsPanelModel[]; // panels for primary list
    // curPanel: number; // current panel index
    panelAction: {};
    initialized: boolean;
}

/** ACTIONS */

export class DbfsPanelsInitialize {
    static readonly type = '[DBFS Panels] Initialize Panels';
    constructor() {}
}

export class DbfsPanelsError {
    static readonly type = '[DBFS Panels] Error happened';
    constructor(public readonly error: any) {}
}

export class DbfsAddPanel {
    static readonly type = '[DBFS Panels] Add Panel';
    constructor(public readonly payload: any) {}
}

export class DbfsUpdatePanels {
    static readonly type = '[DBFS Panels] update panels';
    constructor(public readonly payload: any) {}
}

export class DbfsResetPanelAction {
    static readonly type = '[DBFS Panels] reset panel action';
    constructor() {}
}

export class DbfsChangePanelTab {
    static readonly type = '[DBFS Panels] change panel root';
    constructor(
      public readonly payload: any,
    ) {}
}

/** STATE */
@State<DbfsPanelsModel>({
    name: 'NavPanels',
    defaults: {
        panelTab: 'personal', // personal, favorites, recent, users, namespaces
        personalTab: {
          curPanel: 0,
          panels: []
        },
        favoritesTab: {
          curPanel: 0,
          panels: []
        },
        recentTab: {
          curPanel: 0,
          panels: []
        },
        usersTab: {
          curPanel: 0,
          panels: []
        },
        namespacesTab: {
          curPanel: 0,
          panels: []
        },
        // panels: [],
        // curPanel: 0,
        panelAction: {},
        initialized: false
    }
})

export class DbfsPanelsState {
    constructor(
        private utils: UtilsService
    ) {}

    /** Selectors */

    @Selector() static getPanels(state: DbfsPanelsModel) {
        const curTab = state.panelTab + 'Tab';
        return state[curTab].panels;
        // return state.panels;
    }

    @Selector() static getCurPanel(state: DbfsPanelsModel) {
        const curTab = state.panelTab + 'Tab';
        return state[curTab].curPanel;
        // return state.panels;
    }

    @Selector() static getPanelAction(state: DbfsPanelsModel) {
        return state.panelAction;
    }

    @Selector() static getPanelTab(state: DbfsPanelsModel) {
      return state.panelTab;
    }

    /** Actions */

    @Action(DbfsResetPanelAction)
    resetPanelAction(ctx: StateContext<DbfsPanelsModel>, { }: DbfsResetPanelAction) {
        ctx.patchState({
            panelAction: {}
        });
    }

    @Action(DbfsPanelsError)
    panelsError(ctx: StateContext<DbfsPanelsModel>, {error}: DbfsPanelsError) {
        console.group(
            '%cERROR%cState :: Panels Error',
            'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
            'color: #ff0000; padding: 4px 8px; font-weight: bold'
        );
        console.log('%cErrorMsg', 'font-weight: bold;', error);
        console.groupEnd();
    }

    @Action(DbfsPanelsInitialize)
    panelsInitialize(ctx: StateContext<DbfsPanelsModel>, {}: DbfsPanelsInitialize) {
        const state = ctx.getState();

        if (!state.initialized) {
            ctx.setState({...state,
                personalTab: {
                    curPanel: 0,
                    panels: [
                      {
                          index: 0,
                          folderResource: ':panel-root:', // maybe change this in resources to personal-root
                          root: true,
                          synthetic: true,
                          locked: true
                      }
                    ]
                },
                favoritesTab: {
                  curPanel: 0,
                  panels: [
                    {
                        index: 0,
                        folderResource: ':user-favorites:',
                        root: true,
                        dynamic: true,
                        synthetic: true,
                        locked: true
                    }
                  ]
                },
                recentTab: {
                  curPanel: 0,
                  panels: [
                    {
                        index: 0,
                        folderResource: ':user-recent:',
                        root: true,
                        dynamic: true,
                        synthetic: true,
                        locked: true
                    }
                  ]
                },
                usersTab: {
                  curPanel: 0,
                  panels: [
                    {
                        index: 0,
                        folderResource: ':list-users:',
                        root: true,
                        dynamic: true,
                        synthetic: true,
                        locked: true
                    }
                  ]
                },
                namespacesTab: {
                  curPanel: 0,
                  panels: [
                    {
                        index: 0,
                        folderResource: ':list-namespaces:',
                        root: true,
                        dynamic: true,
                        synthetic: true,
                        locked: true
                    }
                  ]
                },
                // legacy panels -- to be removed eventually
                /*panels: [
                    {
                        index: 0,
                        folderResource: ':panel-root:',
                        root: true,
                        synthetic: true,
                        locked: true
                    }
                ],*/
                initialized: true
            });
        }
    }

    @Action(DbfsAddPanel)
    addPanel(ctx: StateContext<DbfsPanelsModel>, { payload }: DbfsAddPanel) {
        const state = ctx.getState();
        const curTab = state.panelTab + 'Tab';

        const panels = this.utils.deepClone(state[curTab].panels);

        // check if panel with that path already exists
        // i.e. people click way too fast, too many times
        const index = panels.findIndex(p => p.folderResource === payload.panel.folderResource);

        if (index === -1) {
            const newPanel = {...payload.panel,
                index: panels.length
            };

            panels.push(newPanel);

            const patchData: any  = {
                panelAction: payload.panelAction
            };

            patchData[curTab] = {
                panels,
                curPanel: (panels.length - 1)
            };

            ctx.patchState(patchData);
        }
    }

    @Action(DbfsUpdatePanels)
    updatePanels(ctx: StateContext<DbfsPanelsModel>, { payload }: DbfsUpdatePanels) {
        const state = ctx.getState();
        const curTab = state.panelTab + 'Tab';

        const idx = (payload.panels.length - 1);

        const patchData: any = {
            panelAction: (payload.panelAction) ? payload.panelAction : {}
        };

        patchData[curTab] = {
            panels: payload.panels,
            curPanel: (idx < 0) ? 0 : idx
        };

        ctx.patchState(patchData);
    }


    @Action(DbfsChangePanelTab)
    changePanelTab(ctx: StateContext<DbfsPanelsModel>, { payload }: DbfsChangePanelTab) {
        const state = ctx.getState();

        const panelAction = payload.panelAction;

        if (payload.panelTab === 'personal') {
            panelAction.startIndex = state.personalTab.curPanel;
        }

        if (payload.panelTab === 'namespaces') {
            panelAction.startIndex = state.namespacesTab.curPanel;
        }

        if (payload.panelTab === 'users') {
            panelAction.startIndex = state.usersTab.curPanel;
        }

        ctx.patchState({
            panelTab: payload.panelTab,
            panelAction: payload.panelAction
        });
    }

}
