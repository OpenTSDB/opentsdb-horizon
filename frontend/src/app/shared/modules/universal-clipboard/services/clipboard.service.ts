import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { HttpService } from '../../../../core/http/http.service';
import { DashboardConverterService } from '../../../../core/services/dashboard-converter.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { UtilsService } from '../../../../core/services/utils.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';

import { DbfsState, DbfsResourcesState, DbfsCreateFolder } from '../../dashboard-filesystem/state';
import { DbfsService } from '../../dashboard-filesystem/services/dbfs.service';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {

    private clipboardResourcePath: string;

    /* STREAMS */
    private _drawerState: Subject<string> = new Subject(); // tooltip data
    $drawerState: Observable<string>;

    constructor(
        private utils: UtilsService,
        private dbService: DashboardService,
        private dbConverterService: DashboardConverterService,
        private store: Store,
        private http: HttpService,
        private dbfs: DbfsService,
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

    getNewUpdateValues(): any {
        const updatedTime = Date.now();
        const updatedBy = this.store.selectSnapshot(DbfsState.getUser());
        const updateValues: any = {
            updatedTime,
            updatedBy
        };
        return updateValues;
    }

    // find clipboard resource folder
    clipboardFolderResource() {
        console.log('******************************');
        this.logger.api('clipboardFolderResource');
        console.log('******************************');
        // get current logged in user
        const user = this.store.selectSnapshot(DbfsState.getUser());
        // get current user clipboard file
        const cbResource = this.store.selectSnapshot(DbfsResourcesState.getFolderResource('/user/' + user.alias + '/_clipboard_'));
        if (cbResource.notFound) {
           return false;
        }

        this.logger.log('clipboardResource', {user, cbResource});
        return cbResource;
    }

    createClipboardResource(title: string) {
        this.logger.api('createClipboardResource', {title});

        const clipboardProto: any = this.utils.deepClone(this.dbService.getDashboardPrototype());
        clipboardProto.settings.meta.title = title || 'Default clipboard';
        clipboardProto.settings.meta.description = 'storage for widget clipboard';
        clipboardProto.widgets = []; // reset widgets to empty
        clipboardProto.version = this.dbConverterService.getDBCurrentVersion();

        // clipboardFolder
        const cbFolder = this.clipboardFolderResource();

        const payload: any = {
            name: title,
            parentId: cbFolder.id,
            content: clipboardProto
        };

        this.logger.log('CB PAYLOAD', payload);
        return this.saveClipboard('_new_', payload);
    }

    saveClipboard(id: any, payload: any) {
        this.logger.api('saveClipboard', {id, payload});
        return this.http.saveDashboard(id, payload);
    }

    loadClipboard(id: any) {
        this.logger.api('loadClipboard', {id});
        return this.http.getDashboardById(id);
    }

    sortClipboards(items: any[]): any[] {
        this.logger.api('sortClipboards', {items});
        const defaultIdx = items.findIndex(item => item.name === 'Default clipboard');
        const defaultClipboard = items.splice(defaultIdx, 1);

        items.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(a.name, b.name);
        });

        items.unshift(defaultClipboard[0]);

        return items;
    }

    generateUniqueClipboardItemId(widgetId: any) {
        const cbId = this.utils.generateId(6);
        return widgetId + ':' + cbId;
    }
}
