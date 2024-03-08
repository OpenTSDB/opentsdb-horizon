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

import { Observable, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { DbfsResourcesState } from '../../../dashboard-filesystem/state';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { UntypedFormControl } from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'simple-recents-list',
    templateUrl: './simple-recents-list.component.html',
    styleUrls: ['./simple-recents-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimpleRecentsListComponent implements OnInit, OnDestroy {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-recents-list') private _componentClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // State
    @Select(DbfsResourcesState.getUserRecents) userRecents$: Observable<any[]>;
    userRecents: any[] = [];
    userRecentsDataSource = new MatTableDataSource([]);
    userRecentsFilter: UntypedFormControl = new UntypedFormControl('');

    constructor(private store: Store) {}

    ngOnInit() {
        this.subscription.add(
            this.userRecents$.subscribe((recs) => {
                this.userRecents = recs || [];
                this.userRecentsDataSource.data = this.userRecents;
            }),
        );

        this.subscription.add(
            this.userRecentsFilter.valueChanges.subscribe((val) => {
                this.userRecentsDataSource.filter = val;
            }),
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
