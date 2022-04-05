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
import { State , Action, Selector, StateContext, createSelector, Store } from '@ngxs/store';
import { UserSettingsState } from './user.settings.state';
import { DBSettingsState, UpdateMeta } from './settings.state';
import { WidgetsState, UpdateWidgets } from './widgets.state';
import { WidgetsRawdataState, ClearWidgetsData } from './widgets-data.state';
import { ClientSizeState } from './clientsize.state';
import { HttpService } from '../../core/http/http.service';
import { DashboardService } from '../services/dashboard.service';
import { URLOverrideService } from '../../core/services/urlOverride.service';
import { DashboardConverterService } from '../../core/services/dashboard-converter.service';
import { map, catchError } from 'rxjs/operators';
import { UtilsService } from '../../core/services/utils.service';

export interface DBStateModel {
    id: string;
    version: number;
    createdBy: string;
    loading: boolean;
    loaded: boolean;
    status: string;
    error: any;
    path: string;
    fullPath: string;
    loadedDB: any;
    lastSnapshotId: string;
}

/* action */
export class LoadDashboard {
    static readonly type = '[Dashboard] Load Dashboard';
    constructor(
        public id: string,
        public clipboardItems?: any[]
    ) {}
}

export class MigrateAndLoadDashboard {
    static readonly type = '[Dashboard] Migrate and Load Dashboard';
    constructor(public id: string, public payload: any) {}
}

export class LoadDashboardSuccess {
    static readonly type = '[Dashboard] Load Dashboard Success';
    constructor(public readonly payload: any) {}
}

export class LoadDashboardFail {
    static readonly type = '[Dashboard] Load Dashboard Fail';
    constructor(public readonly error: any) { }
}

export class SaveDashboard {
    static readonly type = '[Dashboard] Save Dashboard';
    constructor(public id: string, public payload: any) {}
}

export class SaveDashboardSuccess {
    static readonly type = '[Dashboard] Save Dashboard Success';
    constructor(public readonly payload: any) {}
}

export class SaveDashboardFail {
    static readonly type = '[Dashboard] Save Dashboard Fail';
    constructor(public readonly error: any) { }
}

export class LoadSnapshot {
    static readonly type = '[Dashboard] Load Snapshot';
    constructor(public id: string) {}
}

export class MigrateAndLoadSnapshot {
    static readonly type = '[Dashboard] Migrate and Load Snapshot';
    constructor(public id: string, public payload: any) {}
}

export class LoadSnapshotSuccess {
    static readonly type = '[Dashboard] Load Snapshot Success';
    constructor(public readonly payload: any) {}
}

export class LoadSnapshotFail {
    static readonly type = '[Dashboard] Load Snapshot Fail';
    constructor(public readonly error: any) { }
}

export class SaveSnapshot {
    static readonly type = '[Dashboard] Save Snapshot';
    constructor(public id: string, public payload: any) {}
}

export class SaveSnapshotSuccess {
    static readonly type = '[Dashboard] Save Snapshot Success';
    constructor(public readonly payload: any) {}
}

export class SaveSnapshotFail {
    static readonly type = '[Dashboard] Save Snapshot Fail';
    constructor(public readonly error: any) { }
}

export class SetDashboardStatus {
  static readonly type = '[Dashboard] Set Dashboard Status';
  constructor(public status: string, public resetError: boolean = false) {}
}

export class DeleteDashboard {
    static readonly type = '[Dashboard] Delete Dashboard';
    constructor(public id: string) {}
}

export class DeleteDashboardSuccess {
    static readonly type = '[Dashboard] Delete Dashboard Success';
    constructor(public readonly payload: any) {}
}

export class DeleteDashboardFail {
    static readonly type = '[Dashboard] Delete Dashboard Fail';
    constructor(public readonly error: any) { }
}

export class ResetDBtoDefault {
    static readonly type = '[Dashboard] Reset dashboard to default state';
    constructor() { }
}

/* state define */

@Injectable()
@State<DBStateModel>({
    name: 'Dashboard',
    defaults: {
        id: '',
        version: 0,
        createdBy: '',
        loading: false,
        loaded: false,
        error: {},
        status: '',
        path: '_new_',
        fullPath: '',
        loadedDB: {},
        lastSnapshotId: ''
    },
    children: [ UserSettingsState, DBSettingsState, WidgetsState, ClientSizeState, WidgetsRawdataState ]
})

export class DBState {
    constructor(
        private httpService: HttpService,
        private dbService: DashboardService,
        private urlOverrideService: URLOverrideService,
        private dbConverterService: DashboardConverterService,
        private store: Store,
        private utils: UtilsService
    ) {}

    @Selector() static getDashboardId(state: DBStateModel) {
        return state.id;
    }

    @Selector() static getLoadedDB(state: DBStateModel) {
        return state.loadedDB;
    }

    @Selector() static getDashboardStatus(state: DBStateModel) {
        return state.status;
    }

    @Selector() static getDashboardError(state: DBStateModel) {
        return state.error;
    }

    @Selector() static getDashboardFullPath(state: DBStateModel) {
      return state.fullPath;
    }

    @Selector() static getCreator(state: DBStateModel) {
        return state.createdBy;
    }

    @Selector() static getSnapshotId(state: DBStateModel) {
        return state.lastSnapshotId;
    }

    @Selector()
    static getDashboardFriendlyPath(state: DBStateModel) {
        // const friendlyPath = state.id + (state.loadedDB.fullPath ? state.loadedDB.fullPath : '');
        const friendlyPath = state.id + (state.fullPath ? state.fullPath : '');
        if (friendlyPath && friendlyPath !== 'undefined') {
            return '/' + friendlyPath;
        } else {
            return undefined;
        }
    }

    @Action(LoadDashboard)
    loadDashboard(ctx: StateContext<DBStateModel>, { id, clipboardItems }: LoadDashboard) {
        // id is the path
        if ( id !== '_new_' ) {
            ctx.patchState({ loading: true});
            return this.httpService.getDashboardById(id).pipe(
                map(res => {
                    const dashboard: any = res.body;
                    // reset the url override, when newly go with url then id id empty
                    if (this.urlOverrideService.activeDashboardId !== '' && this.urlOverrideService.activeDashboardId !== id) {
                        this.urlOverrideService.clearOverrides();
                    }
                    this.urlOverrideService.activeDashboardId = id;
                    // update grister info for UI only
                    this.dbService.addGridterInfo(dashboard.content.widgets);
                    this.dbService.updateTimeFromURL(dashboard);
                    if (dashboard.content.version && dashboard.content.version === this.dbConverterService.currentVersion) {
                        this.dbService.updateTplVariablesFromURL(dashboard);
                        ctx.dispatch(new LoadDashboardSuccess(dashboard));
                    } else {
                        ctx.dispatch(new MigrateAndLoadDashboard(id, dashboard));
                    }
                    // NOTE: maybe add recent tracking here?
                }),
                catchError( error => ctx.dispatch(new LoadDashboardFail(error)))
            );
        } else {
            const payload = {
                content: this.dbService.getDashboardPrototype(),
                id: '_new_',
                name: 'Untitled Dashboard',
                path: '',
                fullPath: ''
            };
            if (clipboardItems) {
                payload.content.widgets = clipboardItems;
            }
            ctx.dispatch(new LoadDashboardSuccess(payload));
        }
    }

    @Action(MigrateAndLoadDashboard)
    migrateAndLoadDashboard(ctx: StateContext<DBStateModel>, { id: id, payload: payload }: MigrateAndLoadDashboard) {

        this.dbConverterService.convert(payload).subscribe((res) => {
            this.dbService.updateTplVariablesFromURL(res);
            ctx.dispatch(new LoadDashboardSuccess(res));
        });
        // we dont want to save after conversion but return the conversion version
        // since user might have no permission to save
        /*return this.httpService.saveDashboard(id, payload).pipe(
            map( (res: any) => {
                ctx.dispatch(new LoadDashboardSuccess(payload));
            }),
            catchError( error => ctx.dispatch(new LoadDashboardFail(error)))
        );
        */
    }

    @Action(LoadDashboardSuccess)
    loadDashboardSuccess(ctx: StateContext<DBStateModel>, { payload }: LoadDashboardSuccess) {
        ctx.patchState({
            id: payload.id,
            version: payload.content.version,
            createdBy: payload.createdBy,
            loaded: true,
            loading: false,
            path: '/' + payload.id + payload.fullPath,
            fullPath: payload.fullPath,
            loadedDB: payload
        });
    }

    @Action(LoadDashboardFail)
    loadDashboardFail(ctx: StateContext<DBStateModel>, { error }: LoadDashboardFail) {
        ctx.dispatch({ loading: false, loaded: false, error: error, loadedDB: {} });
    }

    @Action(SaveDashboard)
    saveDashboard(ctx: StateContext<DBStateModel>, { id: id, payload: payload }: SaveDashboard) {
            ctx.patchState({ status: 'save-progress', error: {} });
            return this.httpService.saveDashboard(id, payload).pipe(
                map( (res: any) => {
                    ctx.dispatch(new SaveDashboardSuccess(res.body));
                }),
                catchError( error => ctx.dispatch(new SaveDashboardFail(error)))
            );
    }

    @Action(SaveDashboardSuccess)
    saveDashboardSuccess(ctx: StateContext<DBStateModel>, { payload }: SaveDashboardSuccess) {
        const state = ctx.getState();
        // we dont need to upload loadedDB here, do that will cause its state updated.
        ctx.patchState({...state,
            id: payload.id,
            path: '/' + payload.id + payload.fullPath,
            fullPath: payload.fullPath,
            status: 'save-success'
        });
    }

    @Action(SaveDashboardFail)
    saveDashboardFail(ctx: StateContext<DBStateModel>, { error }: LoadDashboardFail) {
        const state = ctx.getState();
        ctx.patchState({...state, status: 'save-failed', error: error });
    }

    @Action(LoadSnapshot)
    loadSnapshot(ctx: StateContext<DBStateModel>, { id }: LoadSnapshot) {
        ctx.patchState({ loading: true});
        return this.httpService.getSnapshotById(id).pipe(
            map(res => {
                const dashboard: any = res.body;
                this.dbService.updateTimeFromURL(dashboard);
                if (dashboard.content.version && dashboard.content.version === this.dbConverterService.currentVersion) {
                    this.dbService.updateTplVariablesFromURL(dashboard);
                    ctx.dispatch(new LoadSnapshotSuccess(dashboard));
                } else {
                    ctx.dispatch(new MigrateAndLoadSnapshot(id, dashboard));
                }
            }),
            catchError( error => ctx.dispatch(new LoadSnapshotFail(error)))
        );
    }

    @Action(MigrateAndLoadSnapshot)
    migrateAndLoadSnapshot(ctx: StateContext<DBStateModel>, { id: id, payload: payload }: MigrateAndLoadSnapshot) {
        this.dbConverterService.convert(payload).subscribe((res) => {
            this.dbService.updateTplVariablesFromURL(res);
            ctx.dispatch(new LoadSnapshotSuccess(res));
        });
    }

    @Action(LoadSnapshotSuccess)
    loadSnapshotSuccess(ctx: StateContext<DBStateModel>, { payload }: LoadSnapshotSuccess) {
        ctx.patchState({
            id: payload.id,
            version: payload.content.version,
            createdBy: payload.createdBy,
            loaded: true,
            loading: false,
            path: payload.path,
            fullPath: '/' + payload.path.split('/')[2],
            loadedDB: payload
        });
    }

    @Action(LoadSnapshotFail)
    loadSnapshotFail(ctx: StateContext<DBStateModel>, { error }: LoadSnapshotFail) {
        ctx.dispatch({ loading: false, loaded: false, error: error, loadedDB: {} });
    }

    @Action(SaveSnapshot)
    saveSnapshot(ctx: StateContext<DBStateModel>, { id: id, payload: payload }: SaveSnapshot) {
        ctx.patchState({ status: 'save-progress', error: {} });
        return this.httpService.saveSnapshot(id, payload).pipe(
            map( (res: any) => {
                ctx.dispatch(new SaveSnapshotSuccess(res.body));
            }),
            catchError( error => ctx.dispatch(new SaveSnapshotFail(error)))
        );
    }

    @Action(SaveSnapshotSuccess)
    saveSnapshotSuccess(ctx: StateContext<DBStateModel>, { payload }: SaveSnapshotSuccess) {
        const state = ctx.getState();
        ctx.patchState({...state,
            lastSnapshotId: payload.id,
            status: 'save-snapshot-success'
        });
    }

    @Action(SaveSnapshotFail)
    saveSnapshotFail(ctx: StateContext<DBStateModel>, { error }: SaveSnapshotFail) {
        const state = ctx.getState();
        ctx.patchState({...state, status: 'save-snapshot-failed', error: error });
    }

    @Action(DeleteDashboard)
    deleteDashboard(ctx: StateContext<DBStateModel>, { id: id }: DeleteDashboard) {
        ctx.patchState({ status: 'delete-progress', error: {} });
        return this.httpService.deleteDashboard(id).pipe(
            map( (dashboard: any) => {
                ctx.dispatch(new DeleteDashboardSuccess(dashboard));
            }),
            catchError( error => ctx.dispatch(new DeleteDashboardFail(error)))
        );
    }

    @Action(DeleteDashboardSuccess)
    deleteDashboardSuccess(ctx: StateContext<DBStateModel>, { payload }: DeleteDashboardSuccess) {
        const state = ctx.getState();
        ctx.patchState({...state,
          path: '/' + payload.id + payload.fullPath,
          fullPath: payload.fullPath,
          status: 'delete-success'
        });
    }

    @Action(DeleteDashboardFail)
    deleteDashboardFail(ctx: StateContext<DBStateModel>, { error }: DeleteDashboardFail) {
        const state = ctx.getState();
        ctx.patchState({...state, status: 'delete-failed', error: error });
    }

    @Action(SetDashboardStatus)
    setDashboardStatus(ctx: StateContext<DBStateModel>, { status, resetError }: SetDashboardStatus) {
        const patchData: any = { status };
        if (resetError) {
          patchData.error = {};
        }
        ctx.patchState(patchData);
    }

    @Action(ResetDBtoDefault)
    resetDBtoDefault(ctx: StateContext<DBStateModel>, {}: ResetDBtoDefault) {
        // reset dashboard to defaults
        ctx.patchState({
            id: '',
            version: 0,
            loading: false,
            loaded: false,
            error: {},
            status: '',
            path: '_new_',
            fullPath: '',
            loadedDB: {},
            lastSnapshotId: ''
        });

        // reset some children states
        ctx.dispatch([
            new UpdateWidgets([]),
            new ClearWidgetsData(),
            new UpdateMeta({title: '', description: '', labels: []})
        ]);
    }
}
