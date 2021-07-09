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
import { DashboardService } from '../services/dashboard.service';
import { DateUtilsService } from '../../core/services/dateutils.service';
import { UtilsService } from '../../core/services/utils.service';
import * as deepEqual from 'fast-deep-equal';

export interface DBSettingsModel {
    mode: string;
    time: {
        start: string;
        end: string;
        zone: string;
    };
    initialZoomTime: {
        start: string;
        end: string;
        zone: string;
    };
    refresh: {
        auto: number;
        duration: number;
    };
    meta: {
        title: string;
        description: string;
        labels: Array<any>; // [{label: ''}]
    };
    tplVariables: {
        namespaces: string[];
        tvars: any[];
    };
    tot: {
        period: string;
        value: number;
    };
    downsample: {
        aggregators: string[];
        customUnit: string;
        customValue: string;
        value: string;
    }
}

const defaultInitialZoomTime = {start: '', end: '', zone: ''};

export class UpdateMode {
    public static type = '[Dashboard] Update Mode';
    constructor(public readonly mode: string) {}
}

export class UpdateDashboardTime {
    public static type = '[Dashboard] Update DashboardTime';
    constructor(public readonly time: any) {}
}

export class UpdateDashboardTimeOnZoom {
    public static type = '[Dashboard] Update Dashboard Zoom Time';
    constructor(public readonly zoomTime: any) {}
}

export class UpdateDashboardTimeOnZoomOut {
    public static type = '[Dashboard] Update Dashboard Zoom Out Time';
    constructor() {}
}

export class UpdateDashboardTimeZone {
    public static type = '[Dashboard] Update Dashboard Timezone';
    constructor(public readonly zone: string) {}
}

export class UpdateDashboardAutoRefresh {
    public static type = '[Dashboard] Set Auto Refresh';
    constructor(public readonly refresh: any) {}
}

export class LoadDashboardSettings {
    public static type = '[Dashboard] Load Dashboard Settings';
    constructor(public readonly settings: any) {}
}

export class UpdateDashboardTitle {
    public static type = '[Dashboard] Update Title';
    constructor(public readonly title: string) {}
}

export class UpdateVariables {
    public static type = '[Dashboard] Update Variables';
    // tplVars is object with namespaces and vars properties
    // tplVars : { namespaces: [], vars: []}
    constructor(public readonly tplVars: any) {}
}

export class UpdateMeta {
    public static type = '[Dashboard] Update Meta';
    constructor(public readonly meta: any) {}
}

export class UpdateDownsample {
    public static type ='[Dashboard] Update Downsample';
    constructor(public readonly payload: any) {}
}

export class UpdateToT {
    public static type ='[Dashboard] Update ToT';
    constructor(public readonly payload: any) {}
}

@State<DBSettingsModel>({
    name: 'Settings',
    defaults: {
        mode: 'dashboard',
        time: {
            start: '1h',
            end: 'now',
            zone: 'local'
        },
        initialZoomTime: defaultInitialZoomTime,
        refresh: {
            auto: 0,
            duration: 0
        },
        meta: {
            title: '',
            description: '',
            labels: []
        },
        tplVariables: {
            namespaces: [],
            tvars: []
        },
        tot: {
            period: '',
            value: 0
        },
        downsample: {
            aggregators: [''],
            customUnit: '',
            customValue: '',
            value: 'auto'
        }
    }
})

export class DBSettingsState {
    constructor( private httpService: HttpService, private dbService: DashboardService,
        private dateUtilsService: DateUtilsService, private utilsService: UtilsService ) {}

    @Selector() static getDashboardSettings(state: DBSettingsModel ) {
        return state;
    }

    @Selector() static GetDashboardMode(state: DBSettingsModel) {
        return state.mode;
    }

    @Selector() static getDashboardTime(state: DBSettingsModel) {
        return state.time;
    }

    @Selector() static getDashboardAutoRefresh(state: DBSettingsModel) {
        return state.refresh;
    }

    @Selector() static getMeta(state: DBSettingsModel) {
        return state.meta;
    }

    @Selector() static getTplVariables(state: DBSettingsModel) {
        return state.tplVariables;
    }

    @Selector() static getInitialZoomTime(state: DBSettingsModel) {
        return state.initialZoomTime;
    }

    @Selector() static getDownSample(state: DBSettingsModel) {
        return state.downsample;
    }

    @Selector() static getToT(state: DBSettingsModel) {
        return state.tot;
    }

    @Action(UpdateDownsample)
    updateDownsample(ctx: StateContext<DBSettingsModel>, { payload }: UpdateDownsample) {
        const state = ctx.getState();

        let downsample = {
            aggregators: payload.aggregators,
            value: payload.downsample,
            customUnit: '',
            customValue: ''
        }
        if (payload.downsample === 'custom') {
            downsample.customUnit = payload.customDownsampleUnit;
            downsample.customValue = payload.customDownsampleValue;
        }
        ctx.patchState({...state, downsample: downsample});
    }

    @Action(UpdateToT)
    updateToT(ctx: StateContext<DBSettingsModel>, { payload }: UpdateToT) {
        ctx.patchState({tot: payload});
    }

    @Action(UpdateMode)
    updateMode(ctx: StateContext<DBSettingsModel>, { mode }: UpdateMode) {
        const state = ctx.getState();
        ctx.patchState({...state, mode: mode});
    }

    @Action(UpdateDashboardTime)
    updateDashboardTime(ctx: StateContext<DBSettingsModel>, { time }: UpdateDashboardTime) {
        const state = ctx.getState();
        const newTime = {... time};
        newTime.zone = state.time.zone;
        ctx.patchState({...state, time: newTime, initialZoomTime: defaultInitialZoomTime });
    }

    @Action(UpdateDashboardTimeZone)
    updateDashboardTimeZone(ctx: StateContext<DBSettingsModel>, { zone }: UpdateDashboardTimeZone) {
        const state = ctx.getState();
        const time = {...state.time};
        time.zone = zone;
        ctx.patchState({ time: time });
    }

    @Action(UpdateDashboardTimeOnZoom)
    updateDashboardTimeOnZoom(ctx: StateContext<DBSettingsModel>, { zoomTime }: UpdateDashboardTimeOnZoom) {
        const state = ctx.getState();
        let t;
        let zTime;

        if (this.utilsService.hasInitialZoomTimeSet(state.initialZoomTime)) {
            zTime = {...state.initialZoomTime};
        } else { // first time zooming
            zTime = {...state.time};
        }

        t = {...zoomTime};
        t.zone = state.time.zone;
        ctx.setState({...state, time: {...t}, initialZoomTime: {...zTime} });
    }

    @Action(UpdateDashboardTimeOnZoomOut)
    updateDashboardTimeOnZoomOut(ctx: StateContext<DBSettingsModel>, { }: UpdateDashboardTimeOnZoomOut) {
        const state = ctx.getState();
        let t;
        if (this.utilsService.hasInitialZoomTimeSet(state.initialZoomTime)) {
            t = state.initialZoomTime;
        } else { // backup
            t = state.time;
        }
        ctx.setState({...state, time: {...t}, initialZoomTime: defaultInitialZoomTime});
    }

    @Action(UpdateDashboardAutoRefresh)
    UpdateDashboardAutoRefresh(ctx: StateContext<DBSettingsModel>, { refresh }: UpdateDashboardAutoRefresh) {
        ctx.patchState({refresh: refresh});
    }

    @Action(UpdateDashboardTitle)
    updateDashboardTitle(ctx: StateContext<DBSettingsModel>, { title }: UpdateDashboardTitle) {
        const state = ctx.getState();
        const meta = {...state.meta};
        meta.title = title;
        ctx.patchState({...state, meta: meta});
    }

    @Action(UpdateVariables)
    updateVariables(ctx: StateContext<DBSettingsModel>, { tplVars }: UpdateVariables) {
        const state = ctx.getState();
        ctx.patchState({...state, tplVariables: tplVars});
    }

    @Action(UpdateMeta)
    updateMeta(ctx: StateContext<DBSettingsModel>, { meta }: UpdateMeta) {
        const state = ctx.getState();
        ctx.patchState({...state, meta: meta});
    }
    @Action(LoadDashboardSettings)
    loadDashboardSettings(ctx: StateContext<DBSettingsModel>, { settings }: LoadDashboardSettings) {
        // just load the settings, not as new object
        // to avoid other settings listeners to fire off.
        ctx.setState(settings);
    }
}
