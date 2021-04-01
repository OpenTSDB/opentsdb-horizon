import {
    State,
    StateContext,
    Action,
    Selector,
    createSelector
} from '@ngxs/store';



import { HttpService } from '../../core/http/http.service';
import { AlertConverterService } from '../services/alert-converter.service';
import { ConsoleService } from '../../core/services/console.service';

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
        private console: ConsoleService
    ) { }

    @Selector() static getAlertDetails(state: AlertStateModel) {
        return state.data;
    }

    @Selector()
    static getError(state: AlertStateModel) {
        return state.error;
    }

    @Action(GetAlertDetailsById)
    getAlertDetailsById(ctx: StateContext<AlertStateModel>, { id: id }: GetAlertDetailsById) {
        this.console.action('Alert::getAlertDetailsById', {id});
        const state = ctx.getState();
        ctx.patchState({ status: 'loading', loaded: false, error: {} });
        this.httpService.getAlertDetailsById(id).subscribe(
            data => {
                this.console.success('Alert::getAlertDetailsById', {data});
                data = this.alertConverter.convert(data);
                ctx.patchState({data: data, status: 'success', loaded: true, error: {}});
            },
            err => {
                this.console.error('Alert::getAlertDetailsById', {error: err});
                ctx.patchState({ data: {}, status: 'failed', loaded: false, error: err });
            }
        );
    }
}
