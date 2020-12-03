import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { HttpService } from '../../core/http/http.service';
import { DashboardConverterService } from '../../core/services/dashboard-converter.service';
import { LoggerService } from '../../core/services/logger.service';
import { UtilsService } from '../../core/services/utils.service';
import { DashboardService } from '../../dashboard/services/dashboard.service';

import { DbfsState, DbfsResourcesState } from '../state';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {

    private clipboardResourcePath: string;

    /* STREAMS */
    // $drawerState: BehaviorSubject<string> = new BehaviorSubject('closed');
    private _drawerState: Subject<string> = new Subject(); // tooltip data
    $drawerState: Observable<string>;

    constructor(
        private utils: UtilsService,
        private dbService: DashboardService,
        private dbConverterService: DashboardConverterService,
        private store: Store,
        private http: HttpService,
        private logger: LoggerService
    ) {
        this.$drawerState = this._drawerState.asObservable();
        this.setDrawerState('closed');
    }

    drawerStateListen(): Observable<string> {
        return this._drawerState.asObservable();
    }

    setDrawerState(val: string) {
        this.logger.api('setDrawerState', val);
        // this.$drawerState.next(val);
        this._drawerState.next(val);
    }

    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.logger.error('WidgetClipboardService :: An API error occurred', error.error.message);
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                `body was: ${error.error}`
            );
        }
        return throwError(
            'Something bad happened; please try again later.'
        );
    }

    createCopyStore() {
        // const folder
    }

    saveCopyStore() {

    }

    getNewUpdateValues(): any {
        const updatedTime = Date.now();
        const updatedBy = this.store.selectSnapshot(DbfsState.getUser());
        const updateValues: any = {
            updatedTime,
            updatedBy
        };
        return updateValues;
    }

    copyWidget(data: any) {
        if (!this.clipboardFolderResource()) {
            // resource does not exist... create it
            /*this.createClipboardResource().subscribe(
                res => {
                    this.logger.success('CREATED CLIPBOARD ');
                    const user = this.store.selectSnapshot(DbfsState.getUser());
                    const userFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder('/user/' + user.alias));
                    this.store.dispatch( new DbfsLoadTopFolder('user', user.alias, {}))
                        .subscribe(
                            () => {
                                // try copying again
                                setTimeout(() => {
                                    this.copyWidget(data);
                                });
                            }
                        );
                },
                err => { this.logger.error('CREATE CLIPBOARD RESOURCE', err); }
            );*/
        } else {
            this.logger.log('copyWidget', data);
            // copy actions
        }
    }

    /** PRIVATES */

    // find clipboard resource folder
    private clipboardFolderResource() {
        // get current logged in user
        const user = this.store.selectSnapshot(DbfsState.getUser());
        // get current user clipboard file
        //const cbResource = this.store.selectSnapshot(DbfsResourcesState.getFile('/user/' + user.alias + '/_clipboard_'));
        let cbResource = this.store.selectSnapshot(DbfsResourcesState.getFolder('/user/' + user.alias + '/_clipboard_'))
        if (cbResource.notFound) {
           return false;
        }

        this.logger.log('clipboardResource', {user, cbResource});
        return cbResource;
    }

    private createClipboardFolder() {

    }

    private createClipboardResource(title: string) {
        //this.logger.log('createClipboardResource', {user, clipboardResource});

        const clipboardProto: any = this.utils.deepClone(this.dbService.getDashboardPrototype());
        clipboardProto.settings.meta.title = '_clipboard_';
        clipboardProto.settings.meta.description = 'Dashboard storage for widget clipboard';
        clipboardProto.widgets = []; // reset widgets to empty
        clipboardProto.version = this.dbConverterService.getDBCurrentVersion();

        // get current logged in user
        const user = this.store.selectSnapshot(DbfsState.getUser());

        // user folder
        const userFolder = this.store.selectSnapshot(DbfsResourcesState.getFolder('/user/' + user.alias));

        const payload: any = {
            name: '_clipboard_',
            parentId: userFolder.id,
            content: clipboardProto
        };

        return this.http.saveDashboard('_new_', payload);
    }
}
