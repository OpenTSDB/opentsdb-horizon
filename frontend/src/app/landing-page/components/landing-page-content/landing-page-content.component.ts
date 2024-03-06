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
    OnInit,
    OnDestroy,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { IntercomService } from '../../../core/services/intercom.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from '../../../core/services/config.service';

import { Select, Store } from '@ngxs/store';

import { DbfsState } from '../../../shared/modules/dashboard-filesystem/state';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'landing-page-content',
    templateUrl: './landing-page-content.component.html',
    styleUrls: ['./landing-page-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LandingPageContentComponent implements OnInit, OnDestroy {
    @HostBinding('class.landing-page-content') private _hostClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // state stuff
    @Select(DbfsState.getUser()) user$: Observable<any>;
    user: any;

    /** Local variables */

    // TODO: this should be in user profile somewhere
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    showHero: boolean = true;

    // Search query string
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    searchQuery: string = '';

    // Selected search context
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    searchContext: string = 'dashboard';

    // options for the search context dropdown menu in the search field
    fakeSearchContextOptions: Array<any> = [
        {
            label: 'Dashboards',
            value: 'dashboard',
        },
        {
            label: 'Namespaces',
            value: 'namespace',
        },
        /* {
            label: 'Metrics',
            value: 'metric'
        },*/
        {
            label: 'Users',
            value: 'user',
        },
    ];

    // AutoSuggest
    // TODO: Replace this with empty array that gets filled out by result from service call
    fakeQuerySuggestions: Array<any> = [
        {
            label: 'suggestion label 1',
        },
        {
            label: 'suggestion label 2',
        },
        {
            label: 'suggestion label 3',
        },
        {
            label: 'suggestion label 4',
        },
        {
            label: 'suggestion label 5',
        },
        {
            label: 'suggestion label 6',
        },
        {
            label: 'suggestion label 7',
        },
        {
            label: 'suggestion label 8',
        },
        {
            label: 'suggestion label 9',
        },
        {
            label: 'suggestion label 10',
        },
    ];

    /** Form Group */
    searchFormGroup: UntypedFormGroup;

    appName;

    constructor(
        // private dbService: DashboardService,
        private interCom: IntercomService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: UntypedFormBuilder,
        private snackBar: MatSnackBar,
        private store: Store,
        private appConfig: AppConfigService,
    ) {}

    ngOnInit() {
        this.appName = this.appConfig.getConfig().name;
        this.createSearchForm();
        this.subscription.add(
            this.route.queryParams.subscribe((params) => {
                if (params['db-delete']) {
                    this.snackBar.open('Dashboard has been deleted.', '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'top',
                        duration: 5000,
                        panelClass: 'info',
                    });
                }
            }),
        );

        this.subscription.add(
            this.user$.subscribe((user) => {
                this.user = user;
            }),
        );
    }

    createSearchForm() {
        this.searchFormGroup = this.fb.group({
            searchQuery: new UntypedFormControl(this.searchQuery),
            searchContext: new UntypedFormControl(this.searchContext),
        });
    }

    closeHero() {
        // close the hero
        this.showHero = false;
    }

    createDashboard() {
        this.router.navigate(['d', '_new_']);
    }

    // TODO: Get this link to opentsdb guide to work
    gotoOpenTSDBGuide() {
        alert('TODO: get link to opentsdb/horion guide');
    }

    /** AUTO SUGGESTION */

    /**
     * * If user hits enter, the input is valid and that option must exist in the list
     */
    queryKeydown(event: any) {
        this.searchQuery = this.searchFormGroup.get('searchQuery').value;
    }
    /**
     * * Event fired when an autocomplete option is selected
     */
    querySuggestOptionSelected(event: any) {
        this.searchQuery = event.option.value;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
