import {
    Component,
    OnInit,
    HostBinding,
    OnDestroy
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { DbfsResourcesState } from '../../../dashboard-filesystem/state';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { LoggerService } from '../../../../../core/services/logger.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'simple-recents-list',
    templateUrl: './simple-recents-list.component.html'
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
    userRecentsFilter: FormControl = new FormControl('');

    constructor(
        private store: Store,
        private logger: LoggerService
    ) { }

    ngOnInit() {
        this.subscription.add(this.userRecents$.subscribe(recs => {
            this.userRecents = recs || [];
            this.userRecentsDataSource.data = this.userRecents;
            // this.logger.log('RECS', this.userRecents);
        }));

        this.subscription.add(this.userRecentsFilter.valueChanges.subscribe(val => {
            this.userRecentsDataSource.filter = val;
        }));
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
