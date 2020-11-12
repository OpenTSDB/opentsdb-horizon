import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggerService } from '../../core/services/logger.service';
import { UtilsService } from '../../core/services/utils.service';

// not quite sure yet if I need these
import { Store } from '@ngxs/store';
import { DbfsState, DbfsResourcesState, DbfsLoadTopFolder } from '../../app-shell/state';
import { HttpService } from '../../core/http/http.service';
import { DashboardConverterService } from '../../core/services/dashboard-converter.service';

import { DashboardService } from './dashboard.service';
import { WidgetCopyModel } from '../state/widget-clipboard.state';





@Injectable()
export class WidgetClipboardService {

    private clipboardResourcePath: string;

    constructor(
        private utils: UtilsService,
        private dbService: DashboardService,
        private dbConverterService: DashboardConverterService,
        private store: Store,
        private http: HttpService,
        private logger: LoggerService
    ) { }

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

    copyWidget(data: WidgetCopyModel) {
        if (!this.clipboardResource()) {
            // resource does not exist... create it
            this.createClipboardResource().subscribe(
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
            );
        } else {
            this.logger.log('copyWidget', data);
            // copy actions
        }
    }

    // privates
    private clipboardResource() {
        // get current logged in user
        const user = this.store.selectSnapshot(DbfsState.getUser());
        // get current user clipboard file
        const cbResource = this.store.selectSnapshot(DbfsResourcesState.getFile('/user/' + user.alias + '/_clipboard_'));

        this.logger.log('checkForClipboardResource', {user, cbResource});
        return cbResource;
    }

    private createClipboardResource() {
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

