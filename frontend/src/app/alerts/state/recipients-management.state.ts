import { State, Action, StateContext, Selector } from '@ngxs/store';
import { HttpService } from '../../core/http/http.service';
import { map, catchError } from 'rxjs/operators';

export interface RecipientsModel {
    namespace: string;
    recipients: Array<any>;
}

export interface RecipientsManagamentStateModel {
    loading: boolean;
    error: any;
    recipients: RecipientsModel;
    lastUpdated: any;
}

/* GET *********************/
export class GetRecipients {
    public static type = '[Recipients] Load for Namespace';
    constructor(
        public readonly namespace: string
    ) {}
}

export class LoadRecipientsSuccess {
    public static type = '[Recipients] Load for Namespace [SUCCESS]';
    constructor(
        public readonly namespace: string,
        public readonly recipients: Array<any>
    ) { }
}

export class LoadRecipientsFail {
    public static type = '[Recipients] Load for Namespace [FAIL]';
    constructor(
        public readonly namespace: string,
        public readonly options?: any
    ) { }
}

/* POST *********************/
export class PostRecipient {
    public static type = '[Recipients] Post for Namespace';
    constructor(
        public readonly data: any
    ) {}
}

export class PostRecipientSuccess {
    public static type = '[Recipients] Post for Namespace [SUCCESS]';
    constructor(
        public readonly data: any
    ) { }
}

export class PostRecipientFail {
    public static type = '[Recipients] Post for Namespace [FAIL]';
    constructor(
        public readonly data: any
    ) { }
}

/* PUT *********************/

export class UpdateRecipient {
    public static type = '[Recipients] PUT for Namespace';
    constructor(
        public readonly data: any
    ) {}
}

export class UpdateRecipientSuccess {
    public static type = '[Recipients] PUT for Namespace [SUCCESS]';
    constructor(
        public readonly data: any
    ) { }
}

export class UpdateRecipientFail {
    public static type = '[Recipients] PUT for Namespace [FAIL]';
    constructor(
        public readonly data: any
    ) { }
}

/* DELETE *********************/
export class DeleteRecipient {
    public static type = '[Recipients] Delete for Namespace';
    constructor(
        public readonly data: any
    ) {}
}

export class DeleteRecipientSuccess {
    public static type = '[Recipients] Delete for Namespace [SUCCESS]';
    constructor(
        public readonly data: any
    ) { }
}

export class DeleteRecipientFail {
    public static type = '[Recipients] Delete for Namespace [FAIL]';
    constructor(
        public readonly data: any
    ) { }
}

@State<RecipientsManagamentStateModel>({
    name: 'Recipients',
    defaults: {
        recipients: {
            namespace: '',
            recipients: []
        },
        error: {},
        loading: false,
        lastUpdated: {}
    }
})

export class RecipientsState {
    constructor(private httpService: HttpService) { }

    @Selector() static GetRecipients(state: RecipientsManagamentStateModel) {
        return state.recipients;
    }

    @Selector() static GetErrors(state: RecipientsManagamentStateModel) {
        return state.error;
    }

    @Selector() static GetLastUpdated(state: RecipientsManagamentStateModel) {
        return state.lastUpdated;
    }

    // GET
    @Action(GetRecipients)
    getRecipients(ctx: StateContext<RecipientsManagamentStateModel>, { namespace }: GetRecipients) {
        const state = ctx.getState();
        ctx.patchState({ loading: true });
        return this.httpService.getRecipients(namespace).pipe(
            map((payload: any) => {
                ctx.dispatch(new LoadRecipientsSuccess(namespace, payload.body));
            }),
            catchError(error => ctx.dispatch(new LoadRecipientsFail(error)))
        );
    }

    @Action(LoadRecipientsSuccess)
    loadRecipientsSuccess(ctx: StateContext<RecipientsManagamentStateModel>, recipients) {
        // console.log('#### NAMESPACE RECIPIENTS SUCCESS ####', recipients);
        const state = ctx.getState();
        ctx.setState({ ...state, recipients: recipients, loading: false, });
    }

    @Action(LoadRecipientsFail)
    loadRecipientsFail(ctx: StateContext<RecipientsManagamentStateModel>, error) {
        // console.log('#### NAMESPACE RECIPIENTS FAIL ####', error);
        const state = ctx.getState();
        ctx.setState({ ...state, loading: false, error });
    }

    // POST
    @Action(PostRecipient)
    postRecipient(ctx: StateContext<RecipientsManagamentStateModel>, { data }: PostRecipient) {
        return this.httpService.postRecipient(data).pipe(
            map((payload: any) => {
                ctx.dispatch(new PostRecipientSuccess(payload.body));
            }),
            catchError(error => ctx.dispatch(new PostRecipientFail(error)))
        );
    }

    @Action(PostRecipientSuccess)
    postRecipientSuccess(ctx: StateContext<RecipientsManagamentStateModel>, recipient) {
        // console.log('#### RECIPIENT POST SUCCESS ####', recipient);
        const state = ctx.getState();
        let recipients = { ...state.recipients };
        recipients = this.appendRecipientToRecipients(recipient.data, recipients);
        ctx.setState({ ...state, recipients: recipients, loading: false, });
    }

    @Action(PostRecipientFail)
    postRecipientsFail(ctx: StateContext<RecipientsManagamentStateModel>, error) {
        // console.log('#### NAMESPACE RECIPIENTS FAIL ####', error);
        const state = ctx.getState();
        ctx.setState({ ...state, loading: false, error });
    }

    // PUT
    @Action(UpdateRecipient)
    updateRecipient(ctx: StateContext<RecipientsManagamentStateModel>, { data }: UpdateRecipient) {
        return this.httpService.updateRecipient(data).pipe(
            map((payload: any) => {
                ctx.dispatch(new UpdateRecipientSuccess(payload.body));
            }),
            catchError(error => ctx.dispatch(new UpdateRecipientFail(error)))
        );
    }

    @Action(UpdateRecipientSuccess)
    updateRecipientSuccess(ctx: StateContext<RecipientsManagamentStateModel>, recipient) {
        // console.log('#### RECIPIENT UPDATE SUCCESS ####', recipient);
        const state = ctx.getState();
        // tslint:disable-next-line:prefer-const
        let recipients = {...state.recipients};
        recipients = this.modifyRecipient(recipient.data, recipients);

        const type = Object.keys(recipient.data)[0];
        if (recipient.data[type][0].id) {
            const lastUpdated = this.createLastUpdated(recipient.data, 'update');
            ctx.setState({ ...state, recipients, loading: false, lastUpdated });
        } else {
            ctx.setState({ ...state, recipients, loading: false, });
        }
    }

    @Action(UpdateRecipientFail)
    updateRecipientFail(ctx: StateContext<RecipientsManagamentStateModel>, error) {
        // console.log('#### RECIPIENT UPDATE FAIL ####', error);
        const state = ctx.getState();
        ctx.setState({ ...state, loading: false, error});
    }

    // DELETE
    @Action(DeleteRecipient)
    deleteRecipient(ctx: StateContext<RecipientsManagamentStateModel>, data) {
        return this.httpService.deleteRecipient(data.data).pipe(
            map((payload: any) => {
                ctx.dispatch(new DeleteRecipientSuccess(payload.body));
            }),
            catchError(error => ctx.dispatch(new DeleteRecipientFail(error)))
        );
    }

    @Action(DeleteRecipientSuccess)
    deleteRecipientSuccess(ctx: StateContext<RecipientsManagamentStateModel>, recipient) {
        // console.log('#### RECIPIENT DELETE SUCCESS ####', recipient);
        const state = ctx.getState();
        let recipients = { ...state.recipients };
        const lastUpdated = this.createLastUpdated(recipient.data, 'delete');
        recipients = this.removeRecipientFromRecipients(recipient.data, recipients);
        ctx.setState({ ...state, recipients: recipients, loading: false, lastUpdated });
    }

    @Action(DeleteRecipientFail)
    deleteRecipientFail(ctx: StateContext<RecipientsManagamentStateModel>, error) {
        // console.log('#### RECIPIENT DELETE FAIL ####', error);
        const state = ctx.getState();
        ctx.setState({ ...state, loading: false, error});
    }

    // HELPERS
    appendRecipientToRecipients(recipient, namespaceAndRecipients): any {
        const type = Object.keys(recipient)[0];
        const _namespaceAndRecipients = JSON.parse(JSON.stringify(namespaceAndRecipients));
        if (!_namespaceAndRecipients.recipients[type])  {
            _namespaceAndRecipients.recipients[type] = [];
        }
        _namespaceAndRecipients.recipients[type].push(recipient[type][0]);
        return _namespaceAndRecipients;
    }

    removeRecipientFromRecipients(recipient, namespaceAndRecipients): any {
        const type = Object.keys(recipient)[0];
        let index = 0;
        const _namespaceAndRecipients = JSON.parse(JSON.stringify(namespaceAndRecipients));
        // tslint:disable-next-line:forin
        for (let i = 0; i < _namespaceAndRecipients.recipients[type].length; i++) {
            if (_namespaceAndRecipients.recipients[type][i].id === recipient[type][0].id) {
                index = i;
                break;
            }
        }
        _namespaceAndRecipients.recipients[type].splice(index, 1);
        return _namespaceAndRecipients;
    }

    modifyRecipient(recipient, namespaceAndRecipients): any {
        const type = Object.keys(recipient)[0];
        const _namespaceAndRecipients = JSON.parse(JSON.stringify(namespaceAndRecipients));
        // tslint:disable-next-line:forin
        for (let i = 0; i < _namespaceAndRecipients.recipients[type].length; i++) {
            if (_namespaceAndRecipients.recipients[type][i].id === recipient[type][0].id) {
                // tslint:disable-next-line:forin
                for (let key in recipient[type][0] ) {
                    if (key.toLowerCase() !== 'namespace' &&
                        key.toLowerCase() !== 'type' &&
                        key.toLowerCase() !== 'newname') {
                            _namespaceAndRecipients.recipients[type][i][key] = recipient[type][0][key];
                    }
                }
                break;
            }
        }
        return _namespaceAndRecipients;
    }

    createLastUpdated(recipient, action: string) {
        const type = Object.keys(recipient)[0];
        const _recipient = recipient[type][0];
        _recipient.type = type;
        return { recipient: _recipient, action: action };
    }
}
