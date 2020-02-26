import { State, StateContext, Action, Store, Selector, createSelector } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { UtilsService } from '../../core/services/utils.service';
import { LoggerService } from '../../core/services/logger.service';
import { map, tap, catchError, reduce } from 'rxjs/operators';
import { DbfsUtilsService } from '../services/dbfs-utils.service';

import {
    DbfsResourcesState
} from './dbfs-resources.state';

import { DbfsService } from '../services/dbfs.service';

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
    panels: DbfsPanelModel[]; // panels for primary list
    curPanel: number; // current panel index
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

/** STATE */
@State<DbfsPanelsModel>({
    name: 'Panels',
    defaults: {
        panels: [],
        curPanel: 0,
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
        return state.panels;
    }

    @Selector() static getCurPanel(state: DbfsPanelsModel) {
        return state.curPanel;
    }

    @Selector() static getPanelAction(state: DbfsPanelsModel) {
        return state.panelAction;
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

        ctx.setState({...state,
            panels: [
                {
                    index: 0,
                    folderResource: ':panel-root:',
                    root: true,
                    synthetic: true,
                    locked: true
                }
            ],
            initialized: true
        });
    }

    @Action(DbfsAddPanel)
    addPanel(ctx: StateContext<DbfsPanelsModel>, { payload }: DbfsAddPanel) {
        this.logger.action('State :: Add Panels', payload);
        const state = ctx.getState();
        const panels = this.utils.deepClone(state.panels);

        // check if panel with that path already exists
        // i.e. people click way too fast, too many times
        const index = panels.findIndex(p => p.folderResource === payload.panel.folderResource);
        if (index === -1) {
            const newPanel = {...payload.panel,
                index: panels.length
            };

            panels.push(newPanel);

            ctx.patchState({
                panels,
                curPanel: (panels.length - 1),
                panelAction: payload.panelAction
            });
        }
    }

    @Action(DbfsUpdatePanels)
    updatePanels(ctx: StateContext<DbfsPanelsModel>, { payload }: DbfsUpdatePanels) {
        this.logger.action('State :: Update Panels', payload);
        const idx = (payload.panels.length - 1);
        ctx.patchState({
            panels: payload.panels,
            curPanel: (idx < 0) ? 0 : idx,
            panelAction: (payload.panelAction) ? payload.panelAction : {}
        });
    }

}
