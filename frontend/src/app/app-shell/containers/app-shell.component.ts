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
    Component,
    HostBinding,
    OnDestroy,
    OnInit,
    ViewChild,
    Input,
    OnChanges,
    SimpleChanges,
    Inject,
    ViewEncapsulation
} from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable, Subscription} from 'rxjs';

import {
    MatDrawer
} from '@angular/material';

import { NavigatorSidenavComponent } from '../components/navigator-sidenav/navigator-sidenav.component';
import { IntercomService, IMessage } from '../../core/services/intercom.service';

import {
    AppShellState,
    NavigatorState,
    SetSideNavOpen,
    SSGetUserProfile,
} from '../state';

import {
    DbfsState,
    DbfsLoadResources,
    DbfsInitialized,
    DbfsResourcesState,
    DbfsLoadUserRecents
} from '../../shared/modules/dashboard-filesystem/state';

import {
    ChangeNavigatorApp,
    UpdateNavigatorSideNav
} from '../state/navigator.state';

import { filter, map, reduce, withLatestFrom } from 'rxjs/operators';
import { ThemeService } from '../../shared/modules/theme/services/theme.service';
import { ResetDBtoDefault } from '../../dashboard/state';
import { AppConfigService } from '../../core/services/config.service'

@Component({
    selector: 'app-shell',
    templateUrl: './app-shell.component.html',
    styleUrls: [ './app-shell.component.scss' ],
    encapsulation: ViewEncapsulation.None
})
export class AppShellComponent implements OnInit, OnChanges, OnDestroy {

    @HostBinding('class.app-shell') private _hostClass = true;

    @Input() fullUrlPath: string;

    // new state
    private subscription: Subscription = new Subscription();

    @Select(NavigatorState.getCurrentApp) currentApp$: Observable<string>;
    @Select(NavigatorState.getSideNavOpen) sideNavOpen$: Observable<boolean>;
    @Select(NavigatorState.getSideNavMode) sidenavMode$: Observable<string>;
    @Select(NavigatorState.getDrawerOpen) drawerOpen$: Observable<boolean>;

    @Select(AppShellState.getCurrentMediaQuery) mediaQuery$: Observable<string>;

    @Select(AppShellState.getUserProfile) userProfile$: Observable<any>;
    userProfile: any = {};

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<boolean>;

    // if the active user is admin
    isAdminMember: boolean = false;

    // View Children
    @ViewChild('drawer', { read: MatDrawer }) private drawer: MatDrawer;
    @ViewChild(NavigatorSidenavComponent) private sideNav: NavigatorSidenavComponent;

    activeNavSection = '';
    drawerMode = 'side'; // over | side;
    drawerOpened = false;
    sideNavOpen = true; // the skinny icon bar
    activeMediaQuery = '';

    // global error Message bar
    messageBarVisible = false;
    messageBarData: any = {
        type: 'error',
        message: 'Info'
    };

    messageBarIconMap: any = {
        info: 'd-information-circle',
        error: 'd-stop-warning-solid',
        success: 'd-check-circle',
        warning: 'd-warning-solid'
    };

    sideNavTopGap: number = 0;
    private resourcesReady: boolean = false;
    private pendingRecent: any = {};

    // first load flag
    // tslint:disable-next-line: no-inferrable-types
    private firstLoad: boolean = true;

    private routedApp: any = '';

    clipboardAvailable = false;
    readonly = false;

    constructor(
        private interCom: IntercomService,
        private store: Store,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private themeService: ThemeService,
        private appConfig: AppConfigService,
        @Inject(DOCUMENT) private document: any
    ) {

        this.readonly = this.appConfig.getConfig().readonly;
        if ( this.readonly ) return;
        // prefetch the navigator first data
        this.store.dispatch(new DbfsLoadResources()).pipe(
            map(rs => {
                this.resourcesReady = true;
                if (this.pendingRecent.resource) {
                    // update recents?
                    this.store.dispatch(
                        new DbfsLoadUserRecents(null, null, {})
                    );
                }
            })
        ).subscribe(() => {
            // check if initialized
            const initialized = this.store.selectSnapshot(DbfsState.getInitialized);
            if (!initialized) {
                this.store.dispatch(new DbfsInitialized());
            }
        });

        // get some router events
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {

            const urlParts = event.urlAfterRedirects.split('?');
            const urlPath = (urlParts && urlParts.length > 0) ? urlParts[0].split('/') : [];

            // not sure if we need to store urlParams, but pulling it out in case.
            // TODO: find out if we want to store urlParams
            let urlParams: any = '';
            if (urlParts && urlParts[1]) {
                urlParams = urlParts[1];
            }

            if (urlPath && urlPath.length > 0) {
                // remove first item... should be empty element anyways
                urlPath.shift();
                // second item in arrant should be which horizon app we are in. extract it
                const app = urlPath.shift();

                // should clipboard be available
                this.clipboardAvailable = (app === 'd' || app === 'a');

                // if admin, lets set that as currentApp
                if (app === 'admin') {
                    this.store.dispatch(new ChangeNavigatorApp('admin'));
                }

                // doing it this way, in case we want to add in different tracking later (like alerts, or aura when we add it in)
                if (app === 'd' || app === 'snap') {
                    // YAY! we are in dashboard land
                    const dbId = urlPath.shift();
                    const dbFullPath = '/' + urlPath.join('/');
                    // assuming we don't want to track NEW (but we will want to track it after it was saved)
                    if (dbId !== '_new_') {

                        // the fullpath could possibly be wrong, but we store it anyway
                        // we'll do the lookup based on the ID if the path is not found in the resource cache
                        const payload = {
                            id: dbId,
                            fullPath: dbFullPath,
                            type: 'file',
                            urlParams
                        };

                        if (!this.resourcesReady) {
                            // FIRST LOAD... need to store it as pending till the resources state is ready
                            this.pendingRecent = {
                                resource: payload,
                                url: event.urlAfterRedirects
                            };
                        } else {
                            // resource state has already been loaded, so lets just store it

                            // update recents
                            this.store.dispatch(
                                new DbfsLoadUserRecents(null, null, {})
                            );
                        }
                    }
                }

                if (app === 'main' && this.resourcesReady) {
                    // we are on landing page
                    // open the navigator
                    this.drawer.open();
                    this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: 'dashboard' }));

                    // update recents
                    this.store.dispatch(
                      new DbfsLoadUserRecents(null, null, {})
                    );
                }

                // check if there is a difference in routedApp
                // from the new app from url
                if (this.routedApp !== app) {
                    // previous routed app was dashboard
                    if (this.routedApp === 'd' || this.routedApp === 'snap') {
                        // need to reset dashboard state
                        let stateSnapshot: any = this.store.snapshot();
                        if (stateSnapshot.Dashboard !== undefined) {
                            // reset Dashboard
                            this.store.dispatch(new ResetDBtoDefault());
                        }
                    }

                    // set the new routedApp
                    this.routedApp = app;
                }
            }
        });

        console.log('%cFUCKER', 'background: red; color: white; padding: 2px;');
    }

    ngOnInit() {

        if ( this.readonly ) return;
        /*this.subscription.add(this.themeService.getActiveTheme().subscribe( theme => {
            this.setAppTheme(theme);
        }));*/

        this.subscription.add(this.mediaQuery$.subscribe(currentMediaQuery => {
            this.activeMediaQuery = currentMediaQuery;
            this.store.dispatch(new SetSideNavOpen((currentMediaQuery !== 'xs')));
        }));

        this.subscription.add(this.userProfile$.subscribe(data => {
            this.userProfile = data;

            if (!data.loaded) {
                this.store.dispatch(new SSGetUserProfile());
            }
        }));

        this.subscription.add(this.currentApp$.subscribe(app => {
            this.activeNavSection = app;

            // open drawer if on landing page
            if (app === 'main' && this.resourcesReady) {
                this.drawer.open();
                this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: 'dashboard' }));
            }
        }));

        this.subscription.add(this.sideNavOpen$.subscribe(isOpen => {
            this.sideNavOpen = isOpen;
        }));

        this.subscription.add(this.interCom.requestListen().subscribe((message: IMessage) => {
            switch (message.action) {
                // sets system message and type
                case 'systemMessage':
                    this.messageBarData = message.payload;
                    this.messageBarVisible = true;
                    break;
                // clears and resets system message
                case 'clearSystemMessage':
                    if (this.messageBarVisible) {
                        this.messageBarData = {};
                        this.messageBarVisible = false;
                    }
                    break;
                case 'changeToSpecificNamespaceView':
                case 'changeToSpecificUserView':
                    this.drawer.open();
                    this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: 'dashboard' }));
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.resourcesLoaded$.subscribe(resourcesLoaded => {
            if (resourcesLoaded) {
                const user = this.store.selectSnapshot(DbfsState.getUser());
                // NOTE: this user admin thing needs to be more robust
                // possibly set in the config
                this.isAdminMember = user.memberNamespaces.includes('admin');
            }
        }));
    }

    ngOnChanges(changes: SimpleChanges) {
        // when then path is changes
        if (changes.fullUrlPath && changes.fullUrlPath.currentValue) {
            // now do whatever with this full path
            const pathParts = changes.fullUrlPath.currentValue.split('/');
            pathParts.shift();

            const activeNav: any = { section: '' };
            switch (pathParts[0]) {
                case 'admin':
                    // admin
                    activeNav.section = 'admin';
                    break;
                case 'a':
                    // alerts
                    activeNav.section = 'alerts';
                    break;
                case 'd':
                case 'snap':
                    // dashboards
                    activeNav.section = 'dashboard';
                    break;
                default:
                    // default is dashboard
                    activeNav.section = 'main';
                    break;
            }

            if (this.firstLoad) {
                this.activeNavSection = activeNav.section;
                this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: this.activeNavSection }));
                this.firstLoad = false;
            }
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /** PRIVATE */


    /** BEHAVIORS */

    globalMessageVisibility(event: any) {
      if (event.visible) {
          this.sideNavTopGap = 30;
      } else {
          this.sideNavTopGap = 0;
      }
  }

    closeMessageBar() {
        this.messageBarVisible = false;
    }

    drawerClosedStart() {}

    drawerOpenChange(event: any) {
        // fixes expression changed error
        setTimeout(() => {
            this.drawerOpened = event;
        }, 0);
        this.interCom.requestSend({
            action: 'ResizeAllWidgets'
        });
    }

    /** EVENTS */

    navigationAction(event: any) {
        if (event.reset) {
            this.closeNavigator();
            this.activeNavSection = '';
            this.sideNav.resetActiveNav();
        } else {
            this.activeNavSection = event.section;

            switch (this.activeNavSection) {
                case 'alerts':
                    if (this.drawer.opened) {
                        this.closeNavigator();
                    }
                    this.router.navigate(['a']);
                    break;
                case 'dashboard':
                    if (!this.drawer.opened) {

                    }
                    this.drawer.open();
                    break;
                case 'admin':
                    if (!this.drawer.opened) {

                    }
                    this.drawer.open();
                    break;
                case 'settings':
                case 'metric-explorer':
                case 'status':
                case 'annotations':
                case 'favorites':
                case 'namespaces':
                case 'resources':
                case 'test':
                    this.drawer.open();
                    break;
                // can add more cases if needed
                default:
                    if (this.drawer.opened) {
                        this.closeNavigator();
                    }
                    break;
            }
        }
        this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: this.activeNavSection }));
    }

    closeNavigator() {
        this.drawer.close();
        this.drawerMode = 'side';
        if (this.activeMediaQuery === 'xs') {
            // this.store.dispatch(new SetSideNavOpen(!this.sideNavOpen));
            // this.sideNavOpen = !this.sideNavOpen;
        }
    }

    toggleDrawerMode(event?: any) {
        if (event && event.resetForMobile) {
            this.sidenavToggle();
            this.sideNavOpen = false;
        } else {

            if (event && event.drawerMode) {
                this.drawerMode = event.drawerMode;
            } else if (event && event.closeNavigator) {
                this.closeNavigator();
                this.activeNavSection = '';
                this.sideNav.resetActiveNav();
            } else {
                // this.drawerMode = (this.drawerMode === 'side') ? 'over' : 'side';
                this.drawerMode = 'side';
            }
            this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: this.activeNavSection }));
        }
    }

    sidenavToggle() {
        if (this.activeMediaQuery === 'xs') {
            if (this.drawer.opened) {
                this.store.dispatch(new UpdateNavigatorSideNav({ mode: this.drawerMode, currentApp: '' }));
                this.closeNavigator();
                this.sideNav.resetActiveNav();
            } else {
                this.sideNavOpen = !this.sideNavOpen;
            }
        }
    }


    /* APP THEME */
    private setAppTheme(theme: string) {
        this.document.body.setAttribute('theme', theme);
    }

}
