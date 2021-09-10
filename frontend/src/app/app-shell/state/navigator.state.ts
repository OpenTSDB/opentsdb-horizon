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
import {
    State,
    Action,
    Selector,
    StateContext
} from '@ngxs/store';

import { MediaObserver } from '@angular/flex-layout';

/** Model interface */
export interface NavigatorStateModel {
    currentApp: string;
    sideNav: {
        opened: boolean;
    };
    sideNavOpen: boolean;
    sideNavMode: string;
    drawerOpen: boolean;
}

/** Action Definitions */

export class ChangeNavigatorApp {
    static readonly type = '[Navigator] Change Navigator App';
    constructor(public app: string) {}
}

export class UpdateNavigatorSideNav {
    static readonly type = '[Navigator] Update Navigator SideNav Options';
    constructor(public payload: any) {}
}

export class ResetNavigator {
    static readonly type = '[Navigator] Reset Navigator';
    constructor() {}
}

export class SetDrawerOpen {
    static readonly type = '[Navigator] Toggle drawer open';
    constructor(
        public readonly drawerOpen: boolean
    ) {}
}

export class SetSideNavMode {
    static readonly type = '[Navigator] Side Nav Mode';
    constructor(
        public readonly sideNavMode: string
    ) {}
}

export class SetSideNavOpen {
    static readonly type = '[Navigator] Toggle side nav open';
    constructor(
        public readonly sideNavOpen: boolean
    ) {}
}

/** Define State
 *
 * Navigator Children
 * - DashboardNavigatorState
 *
 * Possible New Navigator Children
 * - metric explorer
 * - alerts
 * - status
 * - annotations
 * - admin
 * - favorites
 * - namespaces
 * - resources
*/

@State<NavigatorStateModel>({
    name: 'Navigator',
    defaults: {
        currentApp: 'dashboard',
        sideNav: {
            opened: false
        },
        sideNavOpen: true,
        sideNavMode: 'side',
        drawerOpen: false
    }
})

export class NavigatorState {
    constructor (
        public mediaObserver: MediaObserver,
    ) {}

    /** Selectors */
    @Selector()
    static getCurrentApp(state: NavigatorStateModel) {
        return state.currentApp;
    }
    // might remove this... not sure yet
    @Selector()
    static getNavigatorSideNav(state: NavigatorStateModel) {
        return state.sideNav;
    }

    @Selector()
    static getSideNavOpen(state: NavigatorStateModel) {
        return state.sideNavOpen;
    }

    @Selector()
    static getSideNavMode(state: NavigatorStateModel) {
        return state.sideNavMode;
    }

    @Selector()
    static getDrawerOpen(state: NavigatorStateModel) {
        return state.drawerOpen;
    }

    /** Action */

    @Action(ChangeNavigatorApp)
    changeNavigatorApp(ctx: StateContext<NavigatorStateModel>, { app }: ChangeNavigatorApp) {
        const state = ctx.getState();
        ctx.patchState({...state, currentApp: app });
    }

    @Action(UpdateNavigatorSideNav)
    updateNavigatorSide(ctx: StateContext<NavigatorStateModel>, { payload }: UpdateNavigatorSideNav) {
        const state = ctx.getState();
        const drawerOpen = payload.mode === 'side' && payload.currentApp !== '';
        const sideNavOpen = !(this.mediaObserver.isActive('xs'));
        const currentApp = payload.currentApp;
        ctx.setState({
            ...state,
            sideNavOpen,
            currentApp,
            drawerOpen,
            sideNav: { opened: sideNavOpen }
        });
    }

    @Action(ResetNavigator)
    ResetNavigator(ctx: StateContext<NavigatorStateModel>, {}: ResetNavigator) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sideNavOpen: !(this.mediaObserver.isActive('xs')),
            sideNavMode: 'side',
            drawerOpen: false
        });
    }

    @Action(SetSideNavOpen)
    SetSideNavOpen(ctx: StateContext<NavigatorStateModel>, { sideNavOpen }: SetSideNavOpen) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sideNavOpen
        });
    }

    @Action(SetSideNavMode)
    SetSideNavMode(ctx: StateContext<NavigatorStateModel>, { sideNavMode }: SetSideNavMode) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sideNavMode
        });
    }

    @Action(SetDrawerOpen)
    SetDrawerOpen(ctx: StateContext<NavigatorStateModel>, { drawerOpen }: SetDrawerOpen) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            drawerOpen
        });
    }

}
