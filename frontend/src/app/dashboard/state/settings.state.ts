import { State, Action, StateContext, Selector } from '@ngxs/store';
import { HttpService } from '../../core/http/http.service';
import { DashboardService } from '../services/dashboard.service';
import { DateUtilsService } from '../../core/services/dateutils.service';
import { UtilsService } from '../../core/services/utils.service';

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
    downsample: {
        enabled: boolean;
        aggregator: string[];
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
    constructor(public readonly downsample: any) {}
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
        downsample: {
            enabled: false,
            aggregator: [],
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

    @Action(UpdateDownsample)
    updateDownsample(ctx: StateContext<DBSettingsModel>, { downsample }: UpdateDownsample) {
        const state = ctx.getState();
        ctx.patchState({...state, downsample: downsample});
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
        // console.log('** SETTING DASHBOARD TIME', ctx.getState());
    }

    @Action(UpdateDashboardTimeZone)
    updateDashboardTimeZone(ctx: StateContext<DBSettingsModel>, { zone }: UpdateDashboardTimeZone) {
        const state = ctx.getState();
        const time = {...state.time};
        time.zone = zone;
        ctx.patchState({ time: time });
        // console.log('** SETTING DASHBOARD TIME ZONE', ctx.getState());
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
        // console.log('** SETTING DASHBOARD TIME ON ZOOM', ctx.getState());
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
        // console.log('** SETTING DASHBOARD TIME ON ZOOM OUT', ctx.getState());
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
