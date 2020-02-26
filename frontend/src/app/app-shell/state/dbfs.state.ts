import { State, StateContext, Action, Store, Selector, createSelector } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { UtilsService } from '../../core/services/utils.service';
import { LoggerService } from '../../core/services/logger.service';
import { map, tap, catchError, reduce } from 'rxjs/operators';

import { DbfsPanelsState } from './dbfs-panels.state';
import { DbfsResourcesState } from './dbfs-resources.state';
import { select } from 'd3';
import { DBState } from '../../dashboard/state';

/** Interface model */

export interface DbfsStateModel {
    loading: boolean;
    error: {};
}

/** Actions */




/** State */
@State<DbfsStateModel>({
    name: 'DBFS',
    defaults: {
        loading: false,
        error: {}
    },
    children: [ DbfsPanelsState, DbfsResourcesState ]
})

// state
export class DbfsState {

    constructor (
        private logger: LoggerService,
        // private navService: DashboardNavigatorService,
        private store: Store,
        private util: UtilsService
    ) {}

    /** SELECTORS */
    @Selector() static getError(state: DbfsStateModel) {
        return state.error;
    }

    @Selector() static getLoading(state: DbfsStateModel) {
        return state.loading;
    }

    @Selector([DBState])
    static getLoadedDashboardId(dbstate) {
        return dbstate.id;
    }

    /** ACTIONS */
}
