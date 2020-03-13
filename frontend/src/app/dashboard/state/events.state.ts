import { State, Action, StateContext, Selector } from '@ngxs/store';
import { HttpService } from '../../core/http/http.service';
import { map, catchError } from 'rxjs/operators';
import { LoggerService } from '../../core/services/logger.service';

export interface EventsModel {
    eventQueries: any[];
    events: any[];
}

export interface EventsStateModel {
    loading: boolean;
    error: any;
    events: EventsModel;
    lastUpdated: any;
    buckets: any[];
    time: any;
    timezone: any;
    selectedBucketIndex: number;
}

/* GET *********************/

export class EventsGenericError {
    static readonly type = '[Events] Error happened';
    constructor(
        public readonly error: any,
        public readonly label: string = 'Generic Error'
    ) {}
}

export class GetEvents {
    public static type = '[Events] Get Events';
    constructor(
        public readonly time: any,
        public readonly eventQueries: any[],
        public readonly wid: string,
        public readonly limit?: number
    ) { }
}

export class GetEventsSuccess {
    public static type = '[Events] Get Events Success';
    constructor(
        public readonly response: any,
        public readonly origParams: any
    ) {}
}

export class GetEventsFailed {
    public static type = '[Events] Get Events Failed';
    constructor(
        public readonly response: any,
        public readonly wid: string
    ) {}
}

export class SetEventBuckets {
    public static type = '[Events] Set Event Buckets';
    constructor (
        public readonly buckets: any[]
    ) {}
}

export class SetEventsSelectedBucketIndex {
    public static type = '[Events] Set Selected Bucket Index';
    constructor (
        public readonly index: number
    ) {}
}

export class SetEventsTimeRange {
    public static type = '[Events] Set Time Range';
    constructor (
        public readonly time: any
    ) {}
}

export class SetEventsTimeZone {
    public static type = '[Events] Set Time Zone';
    constructor (
        public readonly timezone: any
    ) {}
}

// export class LoadEventsSuccess {
//     public static type = '[Events] Load [SUCCESS]';
//     constructor(
//         public readonly query: string,
//         public readonly events: Array<any>
//     ) { }
// }

// export class LoadEventsFail {
//     public static type = '[Events] Load [FAIL]';
//     constructor(
//         public readonly query: string,
//         public readonly options?: any
//     ) { }
// }


@State<EventsStateModel>({
    name: 'Events',
    defaults: {
        events: {
            eventQueries: [],
            events: []
        },
        buckets: [],
        time: {
            startTime: 0,
            endTime: 0
        },
        timezone: 'utc',
        selectedBucketIndex: -1,
        error: {},
        loading: false,
        lastUpdated: {}
    }
})

export class EventsState {
    constructor(
        private httpService: HttpService,
        private logger: LoggerService
    ) { }

    @Selector()
    static GetEvents(state: EventsStateModel) {
        return state.events;
    }

    @Selector()
    static getBuckets(state: EventsStateModel) {
        return state.buckets;
    }

    @Selector()
    static getSelectedBucketIndex(state: EventsStateModel) {
        return state.selectedBucketIndex;
    }

    @Selector()
    static getTimeRange(state: EventsStateModel) {
        return state.time;
    }

    @Selector()
    static getTimezone(state: EventsStateModel) {
        return state.timezone;
    }

    // @Selector() static GetErrors(state: EventsStateModel) {
    //     console.log('getEvents error');
    //     return state.error;
    // }

    // @Selector() static GetLastUpdated(state: EventsStateModel) {
    //     console.log('getEvents last updated');
    //     return state.lastUpdated;
    // }

    @Action(GetEvents)
    getEvents(ctx: StateContext<EventsStateModel>, { time, eventQueries, wid, limit }: GetEvents) {

        this.logger.action(GetEvents.type, { time, eventQueries, wid });
        ctx.patchState({loading: true});

        return this.httpService.getEvents(wid, time, eventQueries, limit).pipe(
            map( (response: any) => {
                return ctx.dispatch(new GetEventsSuccess(response, { time, eventQueries, wid, limit } ));
            }),
            catchError( error => ctx.dispatch(new GetEventsFailed(error, wid)) )
        );
    }

    @Action(GetEventsSuccess)
    getEventsSucess(ctx: StateContext<EventsStateModel>, { response, origParams }: GetEventsSuccess) {
        this.logger.success(GetEventsSuccess.type, { response, origParams });

        const state = ctx.getState();

        const events = response;

        ctx.setState({...state,
            events,
            buckets: [],
            selectedBucketIndex: -1,
            time: origParams.time,
            loading: false,
            error: null
        });
    }

    @Action(GetEventsFailed)
    getEventsFailed(ctx: StateContext<EventsStateModel>, { response, wid }: GetEventsFailed) {
        this.logger.error(GetEventsFailed.type, { response });
        const state = ctx.getState();
        const events: any = { events: [], wid, error: response.error.error.message};
        ctx.setState({ ...state, loading: false, error: response.error.error.message, events});
    }

    // @Action(LoadEventsSuccess)
    // loadEventsSuccess(ctx: StateContext<EventsStateModel>, events) {
    //     console.log('#### EVENTS SUCCESS ####', events);
    //     const state = ctx.getState();
    //     ctx.setState({ ...state, events: events, loading: false, });
    // }

    // @Action(LoadEventsFail)
    // loadEventsFail(ctx: StateContext<EventsStateModel>, error) {
    //     console.log('#### EVENTS FAIL ####', error);
    //     const state = ctx.getState();
    //     ctx.setState({ ...state, loading: false, error });
    // }

    @Action(SetEventBuckets)
    setEventBuckets(ctx: StateContext<EventsStateModel>, { buckets }: SetEventBuckets) {
        ctx.patchState({ buckets });
    }

    @Action(SetEventsSelectedBucketIndex)
    setSelectedBucketIndex(ctx: StateContext<EventsStateModel>, { index }: SetEventsSelectedBucketIndex) {
        ctx.patchState({ selectedBucketIndex: index });
    }

    @Action(SetEventsTimeRange)
    setTimeRange(ctx: StateContext<EventsStateModel>, { time }: SetEventsTimeRange) {
        ctx.patchState({ time });
    }

    @Action(SetEventsTimeZone)
    setTimeZone(ctx: StateContext<EventsStateModel>, { timezone }: SetEventsTimeZone) {
        ctx.patchState({ timezone });
    }

    @Action(EventsGenericError)
    eventsGenericError(ctx: StateContext<EventsStateModel>, { error, label }: EventsGenericError) {
        this.logger.error('State :: ' + label, error);
        ctx.patchState({ error });
    }

}
