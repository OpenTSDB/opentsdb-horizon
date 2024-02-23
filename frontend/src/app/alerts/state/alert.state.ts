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
import {
    State,
    StateContext,
    Action,
    Selector
} from '@ngxs/store';

import { HttpService } from '../../core/http/http.service';
import { AlertConverterService } from '../services/alert-converter.service';

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
@Injectable()
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
            notification: {},
        },
    },
})
export class AlertState {
    constructor(
        private httpService: HttpService,
        private alertConverter: AlertConverterService,
    ) {}

    @Selector() static getAlertDetails(state: AlertStateModel) {
        return state.data;
    }

    @Selector()
    static getError(state: AlertStateModel) {
        return state.error;
    }

    @Action(GetAlertDetailsById)
    getAlertDetailsById(
        ctx: StateContext<AlertStateModel>,
        { id: id }: GetAlertDetailsById,
    ) {
        const state = ctx.getState();
        ctx.patchState({ status: 'loading', loaded: false, error: {} });
        this.httpService.getAlertDetailsById(id).subscribe(
            (data) => {
                data = this.alertConverter.convert(data);
                ctx.patchState({
                    data: data,
                    status: 'success',
                    loaded: true,
                    error: {},
                });
            },
            (err) => {
                ctx.patchState({
                    data: {},
                    status: 'failed',
                    loaded: false,
                    error: err,
                });
            },
        );
    }
}
