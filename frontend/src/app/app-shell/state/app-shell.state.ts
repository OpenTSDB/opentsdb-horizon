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
import { State , Action, Selector, StateContext, Store} from '@ngxs/store';
import { map, catchError } from 'rxjs/operators';


import {
    AppShellService
} from '../services/app-shell.service';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';

/** Model interface */
export interface AppShellStateModel {
    currentTheme: string;
    currentMediaQuery: string;
    userProfile: any;
    error: any;
}

/** Action Definitions */
export class SetTheme {
    static readonly type = '[AppShell] Set Theme';
    constructor(public theme: string) {}
}

export class SetCurrentMediaQuery {
    static readonly type = '[AppShell] Set current media query';
    constructor(public currentMediaQuery: string) {}
}

 export class SSGetUserProfile {
    public static type = '[DashboardNavigator] get user profile';
    constructor() {}
}

export class SSGetUserProfileSuccess {
    static readonly type = '[DashboardNavigator] Get User profile [SUCCESS]';
    constructor(
        public readonly response: any
    ) {}
}

export class SSGetUserProfileFail {
    static readonly type = '[DashboardNavigator] Get User profile [FAIL]';
    constructor(
        public readonly error: any
    ) {}
}

export class SSCreateUserProfile {
    public static type = '[DashboardNavigator] create user profile';
    constructor() {} // no data needed, it reads okta cookie
}

export class SSCreateUserProfileSuccess {
    static readonly type = '[DashboardNavigator] Create User profile [SUCCESS]';
    constructor(
        public readonly response: any
    ) {}
}

export class SSCreateUserProfileFail {
    static readonly type = '[DashboardNavigator] Create User profile [FAIL]';
    constructor(
        public readonly error: any
    ) {}
}


/** Define State */
@Injectable()
@State<AppShellStateModel>({
    name: 'AppShell',
    defaults: {
        currentTheme: 'developing',
        currentMediaQuery: '',
        userProfile: {
            loaded: false
        },
        error: false
    }
})

export class AppShellState {

    // subscription to media query change
    mediaWatcher$: Subscription;

    constructor (
        private service: AppShellService,
        private store: Store,
        private mediaObserver: MediaObserver
    ) {
        this.mediaWatcher$ = mediaObserver.media$.subscribe((change: MediaChange) => {
            const currentMediaQuery = change ? change.mqAlias : '';
            this.store.dispatch(new SetCurrentMediaQuery(currentMediaQuery));
        });
    }

    /** Selectors */

    @Selector()
    static getError(state: AppShellStateModel) {
        return state.error;
    }

    @Selector()
    static getUserProfile(state: AppShellStateModel) {
        return state.userProfile;
    }

    @Selector()
    static getCurrentTheme(state: AppShellStateModel) {
        return state.currentTheme;
    }

    @Selector()
    static getCurrentMediaQuery(state: AppShellStateModel) {
        return state.currentMediaQuery;
    }

    /**************************
     * UTILS
     **************************/

    /** Actions */
    @Action(SetTheme)
    setTheme(ctx: StateContext<AppShellStateModel>, { theme }: SetTheme) {
        const state = ctx.getState();
        ctx.patchState({...state, currentTheme: theme });
    }

    @Action(SetCurrentMediaQuery)
    setCurrentMediaQuery(ctx: StateContext<AppShellStateModel>, { currentMediaQuery }: SetCurrentMediaQuery) {
        const state = ctx.getState();
        ctx.setState({...state, currentMediaQuery });
    }


    @Action(SSGetUserProfile)
    GetUserProfile(ctx: StateContext<AppShellStateModel>, { }: SSGetUserProfile) {
        // AppShellState :: Get user profile
        const state = ctx.getState();
        return this.service.getUserProfile().pipe(
            map( (payload: any) => {
                ctx.dispatch(new SSGetUserProfileSuccess(payload));
            }),
            catchError( error => ctx.dispatch(new SSGetUserProfileFail(error)))
        );
    }

    @Action(SSGetUserProfileSuccess)
    GetUserProfileSuccess(ctx: StateContext<AppShellStateModel>, { response }: SSGetUserProfileSuccess) {
        const state = ctx.getState();
        const userProfile = response.body;
        userProfile.loaded = true;

        // AppShellState :: Get user profile - response

        ctx.setState({
            ...state,
            userProfile
        });
    }

    @Action(SSGetUserProfileFail)
    GetUserProfileFail(ctx: StateContext<AppShellStateModel>, { error }: SSGetUserProfileFail) {
        // throw error since previous call should create user if not there.
        console.group(
            '%cERROR%cAppShellState :: Get user profile',
            'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
            'color: #ff0000; padding: 4px 8px; font-weight: bold'
        );
        console.log('%cErrorMsg', 'font-weight: bold;', error);
        console.groupEnd();

        ctx.dispatch({error: error});
    }
}
