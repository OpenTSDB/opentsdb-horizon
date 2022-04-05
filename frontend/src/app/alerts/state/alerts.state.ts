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
import {
    State,
    StateContext,
    Action,
    Selector,
    Store
} from '@ngxs/store';


import { HttpService } from '../../core/http/http.service';
import { AlertsService } from '../services/alerts.service';
import { forkJoin } from 'rxjs';

import { UtilsService } from '../../core/services/utils.service';
import { DbfsState, DbfsResourcesState, DbfsLoadNamespacesList } from '../../shared/modules/dashboard-filesystem/state';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';


export interface AlertModel {
    id: number;
    counts: {
        bad: number;
        warn: number;
        good: number;
        snoozed: number;
    };
    name: string;
    labels: string[];
    namespace: string;
    groupLabels: any[];
    contacts: any[];
    created: any;
    modified: any;
    recipient: any;
    recipientsKeys?: string[];
    snoozed: boolean;
    disabled: boolean;
    alerting: boolean;
}

export interface AlertsStateModel {
    userNamespaces: any[];
    allNamespaces: any[];
    selectedNamespace: any;
    loading: boolean;
    loaded: any;
    error: any;
    saveError: any;
    actionResponse: any;
    actionStatus: string;
    alerts: AlertModel[];
    stats: any;
    snoozes: any[];
    alertTypeFilter: string;
    editItem: any;
    readOnly: boolean;
}

/* actions */
export class LoadNamespaces {
    static readonly type = '[Alerts] Load namespaces';
    constructor(
        public readonly options?: any
    ) { }
}

export class SetNamespace {
    static readonly type = '[Alerts] Set Namespace';
    constructor(public namespace: string) {}
}

export class LoadAlerts {
    static readonly type = '[Alerts] Load Alerts';
    constructor(public options: any) {}
}

export class LoadAlertsStats {
    static readonly type = '[Alerts] Load Alerts Stats';
    constructor(public options: any) {}
}

export class SaveAlerts {
    static readonly type = '[Alerts] Save Alerts';
    constructor(public namespace: string, public payload: any) {}
}

export class DeleteAlerts {
    static readonly type = '[Alerts] Delete Alerts';
    constructor(public namespace: string, public payload: any) {}
}

export class ToggleAlerts {
    static readonly type = '[Alerts] Toggle Alerts';
    constructor(public namespace: string, public payload: any) {}
}

export class LoadSnoozes {
    static readonly type = '[Alerts] Load Snoozes';
    constructor(public options: any) {}
}

export class SaveSnoozes {
    static readonly type = '[Alerts] Save Snoozes';
    constructor(public namespace: string, public payload: any) {}
}

export class DeleteSnoozes {
    static readonly type = '[Alerts] Delete Snoozes';
    constructor(public namespace: string, public payload: any) {}
}


export class CheckWriteAccess {
    static readonly type = "[Alerts] Check write Access";
    constructor(public payload: any) {}
}

export class ClearNamespace {
    static readonly type = '[Alerts] Clears Namespace';
    constructor() {}
}

/* state define */
@Injectable()
@State<AlertsStateModel>({
    name: 'Alerts',
    defaults: {
        userNamespaces: [],
        allNamespaces: [],
        selectedNamespace: '',
        loading: false,
        loaded: {
            userNamespaces: false,
            allNamespaces: false
        },
        error: {},
        saveError: {}, // handles dialog create/update error
        actionResponse: {},
        alerts: [],
        stats: {},
        snoozes: [],
        actionStatus: '',
        alertTypeFilter: 'all', // all, alerting, snoozed, disabled
        editItem: {},
        readOnly: false
    }
})

export class AlertsState {
    sub: Subscription;
    sub2: Subscription;
    constructor(
        private httpService: HttpService,
        private alertsService: AlertsService,
        private utils: UtilsService,
        private store: Store
    ) { }

    /* SELECTORS */
    @Selector()
    static getUserNamespaces(state: AlertsStateModel) {
        return state.userNamespaces;
    }

    @Selector()
    static getAllNamespaces(state: AlertsStateModel) {
        return state.allNamespaces;
    }

    @Selector()
    static getSelectedNamespace(state: AlertsStateModel) {
        return state.selectedNamespace;
    }

    @Selector()
    static getLoading(state: AlertsStateModel) {
        return state.loading;
    }

    @Selector()
    static getLoaded(state: AlertsStateModel) {
        return state.loaded;
    }

    @Selector()
    static getEditItem(state: AlertsStateModel) {
        return state.editItem;
    }

    @Selector()
    static getReadOnly(state: AlertsStateModel) {
        return state.readOnly;
    }

    @Selector()
    static getError(state: AlertsStateModel) {
        return state.error;
    }

    @Selector()
    static getSaveError(state: AlertsStateModel) {
        return state.saveError;
    }

    @Selector()
    static getActionResponse(state: AlertsStateModel) {
        return state.actionResponse;
    }

    @Selector()
    static getAlerts(state: AlertsStateModel) {
        return state.alerts;
    }

    @Selector()
    static getAlertsStats(state: AlertsStateModel) {
        return state.stats;
    }

    @Selector()
    static getSnoozes(state: AlertsStateModel) {
        return state.snoozes;
    }

    @Selector()
    static getActionStatus(state: AlertsStateModel) {
        return state.actionStatus;
    }

    /* ACTIONS */

    @Action(LoadNamespaces)
    loadNamespaces(ctx: StateContext<AlertsStateModel>, { options }: LoadNamespaces) {
        //this.console.state('AlertsState :: Load namespaces', { options });
        const state = ctx.getState();
       if (!state.loaded.userNamespaces) {
        ctx.patchState({ loading: true, error: {} });

            let req1: any;
            let req2: any;

            // check if ALL namespaces have been loaded by DBFS
            const dynamicLoaded: any = this.store.selectSnapshot(DbfsResourcesState.getDynamicLoaded);

            if (dynamicLoaded.namespace) {
                // They have been loaded already
                req1 = this.store.selectSnapshot(DbfsState.getUserMemberNamespaceData());
                req2 = this.store.selectSnapshot(DbfsResourcesState.getNamespacesList);

                ctx.patchState({
                    userNamespaces: req1,
                    allNamespaces: req2,
                    loading: false,
                    loaded: { userNamespaces: true, allNamespaces: true}
                });
            } else {
                // they have NOT been loaded already
                this.store.dispatch(new DbfsLoadNamespacesList({})).subscribe( (data: any) => {

                    req1 = this.store.selectSnapshot(DbfsState.getUserMemberNamespaceData());
                    req2 = this.store.selectSnapshot(DbfsResourcesState.getNamespacesList);

                    ctx.patchState({
                        userNamespaces: req1,
                        allNamespaces: req2,
                        loading: false,
                        loaded: { userNamespaces: true, allNamespaces: true}
                    });
                }, error => {
                    ctx.patchState({ error: error });
                });
            }

            /* const req1 = this.alertsService.getUserNamespaces();
            const req2 = this.alertsService.getNamespaces();

            return forkJoin([req1,  req2]).subscribe((res: any[]) => {
                const req1sort = res[0].sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(a.name, b.name);
                });
                const req2sort = res[1].sort((a: any, b: any) => {
                    return this.utils.sortAlphaNum(a.name, b.name);
                });
                ctx.patchState({
                    userNamespaces: req1sort,
                    allNamespaces: req2sort,
                    loading: false,
                    loaded: { userNamespaces: true, allNamespaces: true}
                });
                },
                error => {
                    ctx.patchState({ error: error });
                }
            );*/
        }
    }

    @Action(SetNamespace)
    SetNamespace(ctx: StateContext<AlertsStateModel>, { namespace }: SetNamespace) {
        const state = ctx.getState();
        const userNamespaces = state.userNamespaces;
        let fixedNamespace: string = "";

        state.allNamespaces.forEach(d => {
            if (d.name.toLowerCase() === namespace.toLowerCase()) { fixedNamespace = d.name; }
        });

        const readOnly = (userNamespaces.find( (d: any) => d.name === fixedNamespace ) === undefined) ? true : false;

        if (fixedNamespace !== "") {
            ctx.patchState({ selectedNamespace: fixedNamespace, readOnly });
        }
    }

    @Action(CheckWriteAccess)
    checkWriteAccess(ctx: StateContext<AlertsStateModel>, { payload }: CheckWriteAccess) {
        const state = ctx.getState();
        const userNamespaces = state.userNamespaces;
        const readOnly = (userNamespaces.find( (d: any) => d.name === payload.namespace ) === undefined) ? true : false;

        ctx.patchState( { editItem: payload, readOnly } );
    }

    @Action(LoadAlerts)
    loadAlerts(ctx: StateContext<AlertsStateModel>, { options }: LoadAlerts) {
        ctx.patchState({ actionStatus: 'save-progress', error: {}});
        if ( this.sub ) {
            this.sub.unsubscribe();
        }
        this.sub = this.httpService.getAlerts(options).subscribe(
            alerts => {
                ctx.patchState({ alerts: alerts});
                if ( alerts.length ) {
                    ctx.dispatch(new LoadAlertsStats(options));
                }
            },
            error => {
                ctx.patchState({ error: error });
            }
        );

    }

    @Action(LoadAlertsStats)
    loadAlertsStats(ctx: StateContext<AlertsStateModel>, { options }: LoadAlertsStats) {
        if ( this.sub2 ) {
            this.sub2.unsubscribe();
        }
        this.sub2 =  this.httpService.getAlertsStats(options).subscribe(
            res => {
                const alertCounts = {};
                if ( res.error === undefined && res.results ) {
                    const sData = res.results[0].data;
                    for ( let i = 0; i < sData.length; i++ ) {
                        const alertId = parseInt(sData[i].tags._alert_id, 10);
                        alertCounts[alertId] = sData[i].summary;
                    }
                }
                ctx.patchState({ stats: alertCounts});
            },
            error => {
                ctx.patchState({ error: error });
            }
        );

    }

    @Action(SaveAlerts)
    saveAlerts(ctx: StateContext<AlertsStateModel>, { namespace, payload }: SaveAlerts) {
        ctx.patchState({ actionStatus: 'save-progress', saveError: {}});
        return this.httpService.saveAlert(namespace, payload).subscribe(
            res => {
                ctx.patchState({ actionStatus: payload.data[0].id ? 'update-success' : 'add-success', saveError: null});
            },
            error => {
                ctx.patchState({ actionStatus: payload.data[0].id ? 'update-failed' : 'add-failed', saveError: error });
            }
        );

    }


    @Action(DeleteAlerts)
    deleteAlerts(ctx: StateContext<AlertsStateModel>, { namespace, payload:payload }: DeleteAlerts) {
        ctx.patchState({ actionStatus: 'delete-progress', error: {}});
        return this.httpService.deleteAlerts(namespace, payload).subscribe(
            res => {
                ctx.patchState({ actionStatus: 'delete-success'});
                ctx.dispatch(new LoadAlerts({namespace: namespace}));
            },
            error => {
                ctx.patchState({ error: error });
            }
        );

    }

    @Action(ToggleAlerts)
    toggleAlerts(ctx: StateContext<AlertsStateModel>, { namespace, payload:payload }: DeleteAlerts) {
        ctx.patchState({ actionStatus: 'toggle-progress', error: {}});
        return this.httpService.saveAlert(namespace, payload).subscribe(
            res => {
                ctx.patchState({ actionStatus: payload.data[0].enabled ? 'enable-success' : 'disable-success'});
                ctx.dispatch(new LoadAlerts({namespace: namespace}));
            },
            error => {
                ctx.patchState({ error: error });
            }
        );

    }

    @Action(LoadSnoozes)
    LoadSnoozes(ctx: StateContext<AlertsStateModel>, { options }: LoadSnoozes) {
        ctx.patchState({ error: {}});
        return this.httpService.getSnoozes(options).subscribe(
            snoozes => {
                ctx.patchState({ snoozes: snoozes});
            },
            error => {
                ctx.patchState({ error: error });
            }
        );

    }

    @Action(SaveSnoozes)
    saveSnoozes(ctx: StateContext<AlertsStateModel>, { namespace, payload }: SaveSnoozes) {
        ctx.patchState({ actionStatus: 'save-progress', saveError: {}});
        return this.httpService.saveSnooze(namespace, payload).subscribe(
            res => {
                ctx.patchState({ actionStatus: payload.data[0].id ? 'snooze-update-success' : 'snooze-add-success'});
                ctx.dispatch(new LoadSnoozes({namespace: namespace}));
            },
            error => {
                ctx.patchState({ actionStatus: payload.data[0].id ? 'snooze-update-failed' : 'snooze-add-failed', saveError: error });
            }
        );
    }

    @Action(DeleteSnoozes)
    deleteSnoozes(ctx: StateContext<AlertsStateModel>, { namespace, payload:payload }: DeleteSnoozes) {
        ctx.patchState({ actionStatus: 'snooze-delete-progress', error: {}});
        return this.httpService.deleteSnoozes(namespace, payload).subscribe(
            res => {
                ctx.patchState({ actionStatus: 'snooze-delete-success'});
                ctx.dispatch(new LoadSnoozes({namespace: namespace}));
            },
            error => {
                ctx.patchState({ error: error });
            }
        );
    }

    @Action(ClearNamespace)
    clearNamespace(ctx: StateContext<AlertsStateModel>) {
        ctx.patchState({ selectedNamespace: '' });
    }
}
