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
@Injectable()
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
        private alertConverter: AlertConverterService
    ) { }

    @Selector() static getSnoozeDetails(state: SnoozeStateModel) {
        return state.data;
    }

    @Action(GetSnoozeDetailsById)
    getSnoozeDetailsById(ctx: StateContext<SnoozeStateModel>, { id: id }: GetSnoozeDetailsById) {
        ctx.patchState({ status: 'loading', loaded: false, error: {} });
        this.httpService.getSnoozeDetailsById(id).subscribe(
            data => {
                ctx.patchState({data: data, status: 'success', loaded: true, error: {}});
            },
            err => {
                ctx.patchState({ data: {}, status: 'failed', loaded: false, error: err });
            }
        );
    }
}
