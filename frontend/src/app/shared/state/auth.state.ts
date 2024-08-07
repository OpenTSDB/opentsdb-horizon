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
import { State, Action, StateContext, Selector } from '@ngxs/store';

export class SetAuth {
    static type = '[Auth] Set Auth';

    constructor(public readonly payload: string) {}
}

export interface AuthStateModel {
    auth: string; // valid/invalid/unknown
}

@State<AuthStateModel>({
    name: 'authState',
    defaults: {
        auth: 'unknown',
    },
})
@Injectable()
export class AuthState {
    @Selector()
    static getAuth(state: AuthStateModel): string {
        return state.auth;
    }

    @Action(SetAuth)
    setAuth(ctx: StateContext<AuthStateModel>, { payload }: SetAuth): void {
        const state = ctx.getState();
        ctx.setState({ ...state, auth: payload });
    }
}
