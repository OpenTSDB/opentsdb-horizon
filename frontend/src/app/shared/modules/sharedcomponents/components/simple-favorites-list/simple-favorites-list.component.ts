import {
    Component,
    OnInit,
    HostBinding,
    OnDestroy
} from '@angular/core';

import { Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState } from '../../../dashboard-filesystem/state';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ConsoleService } from '../../../../../core/services/console.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'simple-favorites-list',
    templateUrl: './simple-favorites-list.component.html'
})
export class SimpleFavoritesListComponent implements OnInit, OnDestroy {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-favorites-list') private _componentClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // state
    @Select(DbfsResourcesState.getUserFavorites) userFavorites$: Observable<any[]>;
    userFavorites: any[] = [];
    userFavoritesDataSource = new MatTableDataSource([]);
    userFavoritesFilter: FormControl = new FormControl('');

    constructor(
        private store: Store,
        private console: ConsoleService,
        private router: Router
    ) { }

    ngOnInit() {
        this.subscription.add(this.userFavorites$.subscribe(favs => {
            this.userFavorites = favs || [];
            this.userFavoritesDataSource.data = this.userFavorites;
        }));

        this.subscription.add(this.userFavoritesFilter.valueChanges.subscribe(val => {
            this.userFavoritesDataSource.filter = val;
        }));
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
