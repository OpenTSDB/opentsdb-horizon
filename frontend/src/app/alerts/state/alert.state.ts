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

export interface AlertStateModel {
    status: string;
    error: any;
    loaded: boolean;
    data: any;
}

export class GetAlertDetailsById {
    static readonly type = '[Alert] Get Alert Details By Id';
    constructor(public id: number) {}
}

/* state define */
@State<AlertStateModel>({
    name: 'Alert',
    defaults: {
        status: '',
        error: {},
        loaded: false,
        data: {
            id: null,
            namespace: '',
            name: '',
            type: 'SIMPLE',
            enabled: true,
            alertGroupingRules: [],
            labels: [],
            threshold: {},
            notification: {}
        }
    }
})

export class AlertState {
    constructor(
        private httpService: HttpService,
        private alertConverter: AlertConverterService,
        private logger: LoggerService
    ) { }

    @Selector() static getAlertDetails(state: AlertStateModel) {
        return state.data;
    }

    @Action(GetAlertDetailsById)
    getAlertDetailsById(ctx: StateContext<AlertStateModel>, { id: id }: GetAlertDetailsById) {
        this.logger.action('Alert::getAlertDetailsById', {id});
        const state = ctx.getState();
        ctx.patchState({ status: 'loading', loaded: false, error: {} });
        this.httpService.getAlertDetailsById(id).subscribe(
            data => {
                this.logger.success('Alert::getAlertDetailsById', {data});
                data = this.alertConverter.convert(data);
                ctx.patchState({data: data, status: 'success', loaded: true, error: {}});
            },
            err => {
                this.logger.error('Alert::getAlertDetailsById', {error: err});
                ctx.patchState({ data: {}, status: 'failed', loaded: false, error: err });
            }
        );
    }
}
