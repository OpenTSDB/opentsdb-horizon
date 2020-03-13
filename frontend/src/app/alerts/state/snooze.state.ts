import {
    State,
    StateContext,
    Action,
    Selector,
    createSelector
} from '@ngxs/store';



import { HttpService } from '../../core/http/http.service';
import { AlertConverterService } from '../services/alert-converter.service';
import { LoggerService } from '../../core/services/logger.service';

export interface SnoozeStateModel {
    status: string;
    error: any;
    loaded: boolean;
    data: any;
}


export class GetSnoozeDetailsById {
    static readonly type = '[Snooze] Get Snooze Details By Id';
    constructor(public id: number) {}
}


/* state define */
@State<SnoozeStateModel>({
    name: 'Snooze',
    defaults: {
        status: '',
        error: {},
        loaded: false,
        data: {
            id: null,
            namespace: '',
            notification: {}
        }
    }
})

export class SnoozeState {
    constructor(
        private httpService: HttpService,
        private alertConverter: AlertConverterService,
        private logger: LoggerService
    ) { }

    @Selector() static getSnoozeDetails(state: SnoozeStateModel) {
        return state.data;
    }

    @Action(GetSnoozeDetailsById)
    getSnoozeDetailsById(ctx: StateContext<SnoozeStateModel>, { id: id }: GetSnoozeDetailsById) {
        this.logger.action('Snooze::getSnoozeDetailsById', {id});
        ctx.patchState({ status: 'loading', loaded: false, error: {} });
        this.httpService.getSnoozeDetailsById(id).subscribe(
            data => {
                this.logger.success('Snooze::getSnoozeDetailsById', {data});
                ctx.patchState({data: data, status: 'success', loaded: true, error: {}});
            },
            err => {
                this.logger.error('Snooze::getSnoozeDetailsById', {error: err});
                ctx.patchState({ data: {}, status: 'failed', loaded: false, error: err });
            }
        );
    }
}
