import {
    State,
    Action,
    Selector,
    StateContext
} from '@ngxs/store';

import {
    DbfsState
} from '../../shared/modules/dashboard-filesystem/state/dbfs.state';

import { MediaObserver } from '@angular/flex-layout';
import { LoggerService } from '../../core/services/logger.service';

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
    }/*,
    children: [
        DbfsState
    ]*/
})

export class NavigatorState {
    constructor (
        public mediaObserver: MediaObserver,
        private logger: LoggerService // importing this to use static method to check for flexLayout media query
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
        this.logger.action(ChangeNavigatorApp.type, {app});
        const state = ctx.getState();
        ctx.patchState({...state, currentApp: app });
    }

    @Action(UpdateNavigatorSideNav)
    updateNavigatorSide(ctx: StateContext<NavigatorStateModel>, { payload }: UpdateNavigatorSideNav) {
        this.logger.action(UpdateNavigatorSideNav.type, payload);
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
        this.logger.action(ResetNavigator.type);
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
        this.logger.action(SetSideNavOpen.type, {sideNavOpen});
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sideNavOpen
        });
    }

    @Action(SetSideNavMode)
    SetSideNavMode(ctx: StateContext<NavigatorStateModel>, { sideNavMode }: SetSideNavMode) {
        this.logger.action(SetSideNavMode.type, {sideNavMode});
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sideNavMode
        });
    }

    @Action(SetDrawerOpen)
    SetDrawerOpen(ctx: StateContext<NavigatorStateModel>, { drawerOpen }: SetDrawerOpen) {
        this.logger.action(SetDrawerOpen.type, {drawerOpen});
        const state = ctx.getState();
        ctx.setState({
            ...state,
            drawerOpen
        });
    }

}
