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
    HostBinding,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';

import { Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState } from '../../../dashboard-filesystem/state';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { UntypedFormControl } from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'simple-favorites-list',
    templateUrl: './simple-favorites-list.component.html',
    styleUrls: ['./simple-favorites-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimpleFavoritesListComponent implements OnInit, OnDestroy {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-favorites-list') private _componentClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // state
    @Select(DbfsResourcesState.getUserFavorites) userFavorites$: Observable<
    any[]
    >;
    userFavorites: any[] = [];
    userFavoritesDataSource = new MatTableDataSource([]);
    userFavoritesFilter: UntypedFormControl = new UntypedFormControl('');

    constructor(
        private store: Store,
        private router: Router,
    ) {}

    ngOnInit() {
        this.subscription.add(
            this.userFavorites$.subscribe((favs) => {
                this.userFavorites = favs || [];
                this.userFavoritesDataSource.data = this.userFavorites;
            }),
        );

        this.subscription.add(
            this.userFavoritesFilter.valueChanges.subscribe((val) => {
                this.userFavoritesDataSource.filter = val;
            }),
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
