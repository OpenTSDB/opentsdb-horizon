import { State, StateContext, Action, Store, Selector, createSelector } from '@ngxs/store';
import { UtilsService } from '../../../../core/services/utils.service';
import { LoggerService } from '../../../../core/services/logger.service';

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
        private utils: UtilsService,
        private logger: LoggerService
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
        this.logger.action('State :: Reset Resource Action');
        ctx.patchState({
            panelAction: {}
        });
    }

    @Action(DbfsPanelsError)
    panelsError(ctx: StateContext<DbfsPanelsModel>, {error}: DbfsPanelsError) {
        this.logger.error('State :: Panels Error', error);
    }

    @Action(DbfsPanelsInitialize)
    panelsInitialize(ctx: StateContext<DbfsPanelsModel>, {}: DbfsPanelsInitialize) {
        this.logger.success('State :: Panels Initialize');
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
        this.logger.action('State :: Add Panels', payload);
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
        this.logger.action('State :: Update Panels', payload);
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
        this.logger.action('State :: Change Panel Tab', payload);
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
