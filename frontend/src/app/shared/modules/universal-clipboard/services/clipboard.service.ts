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
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpService } from '../../../../core/http/http.service';
import { DashboardConverterService } from '../../../../core/services/dashboard-converter.service';
import { UtilsService } from '../../../../core/services/utils.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';

import {
    DbfsState,
    DbfsResourcesState,
} from '../../dashboard-filesystem/state';
import { DbfsService } from '../../dashboard-filesystem/services/dbfs.service';

@Injectable({
    providedIn: 'root',
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
    ) {
        this.$drawerState = this._drawerState.asObservable();
        this.setDrawerState('closed');
    }

    drawerStateListen(): Observable<string> {
        return this._drawerState.asObservable();
    }

    setDrawerState(val: string) {
        this._drawerState.next(val);
    }

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            console.group(
                '%cERROR%cWidgetClipboardService :: An API error occurred',
                'color: #ffffff; background-color: #ff0000; padding: 4px 8px; font-weight: bold;',
                'color: #ff0000; padding: 4px 8px; font-weight: bold',
            );
            console.log(
                '%cErrorMsg',
                'font-weight: bold;',
                error.error.message,
            );
            console.groupEnd();
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                    `body was: ${error.error}`,
            );
        }
        return throwError('Something bad happened; please try again later.');
    }

    getNewUpdateValues(): any {
        const updatedTime = Date.now();
        const updatedBy = this.store.selectSnapshot(DbfsState.getUser());
        const updateValues: any = {
            updatedTime,
            updatedBy,
        };
        return updateValues;
    }

    // find clipboard resource folder
    clipboardFolderResource() {
        // get current logged in user
        const user = this.store.selectSnapshot(DbfsState.getUser());
        // get current user clipboard file
        const cbResource = this.store.selectSnapshot(
            DbfsResourcesState.getFolderResource(
                '/user/' + user.alias + '/_clipboard_',
            ),
        );
        if (!cbResource || cbResource.notFound) {
            return false;
        }

        return cbResource;
    }

    createClipboardResource(title: string) {
        const clipboardProto: any = this.utils.deepClone(
            this.dbService.getDashboardPrototype(),
        );
        clipboardProto.settings.meta.title = title || 'Default clipboard';
        clipboardProto.settings.meta.description =
            'storage for widget clipboard';
        clipboardProto.widgets = []; // reset widgets to empty
        clipboardProto.version = this.dbConverterService.getDBCurrentVersion();

        // clipboardFolder
        const cbFolder = this.clipboardFolderResource();

        const payload: any = {
            name: title,
            parentId: cbFolder.id,
            content: clipboardProto,
        };

        return this.saveClipboard('_new_', payload);
    }

    saveClipboard(id: any, payload: any) {
        return this.http.saveDashboard(id, payload);
    }

    loadClipboard(id: any) {
        return this.http.getDashboardById(id);
    }

    sortClipboards(items: any[]): any[] {
        const defaultIdx = items.findIndex(
            (item) => item.name === 'Default clipboard',
        );
        const defaultClipboard = items.splice(defaultIdx, 1);

        items.sort((a: any, b: any) => this.utils.sortAlphaNum(a.name, b.name));

        items.unshift(defaultClipboard[0]);

        return items;
    }

    generateUniqueClipboardItemId(widgetId: any) {
        const cbId = this.utils.generateId(6);
        return widgetId + ':' + cbId;
    }
}
