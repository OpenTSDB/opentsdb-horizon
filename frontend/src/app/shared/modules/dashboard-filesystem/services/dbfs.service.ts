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
import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AppConfigService } from '../../../../core/services/config.service';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DbfsService {
    constructor(
        private appConfig: AppConfigService,
        private http: HttpClient,
    ) {}

    /**
     * Error Handler
     *
     * to handle error with more info
     */

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            console.group(
                '%cERROR%cDbfsService :: An API error occurred',
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

    loadResources() {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/topFolders';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http.get(apiUrl, httpOptions);
    }

    getFolderByPath(path: string, topFolder?: any) {
        const params: any = {};
        let apiUrl: string;

        if (topFolder && topFolder.type && topFolder.value) {
            const tokenType =
                topFolder.type === 'user' ? 'userId' : 'namespace';
            apiUrl =
                this.appConfig.getConfig().configdb + '/dashboard/topFolders';
            params[tokenType] = topFolder.value;
        } else {
            apiUrl = this.appConfig.getConfig().configdb + '/dashboard' + path;
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params,
        };

        return this.http.get(apiUrl, httpOptions);
    }

    getUsersList() {
        const apiUrl = this.appConfig.getConfig().configdb + '/user/list';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http.get(apiUrl, httpOptions);
    }

    getNamespacesList() {
        const apiUrl = this.appConfig.getConfig().configdb + '/namespace';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http.get(apiUrl, httpOptions);
    }

    getUserFavoritesList(userid: string) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/favorite';

        const params: any = {
            userId: userid,
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params,
        };

        return this.http.get(apiUrl, httpOptions);
    }

    addUserFavorite(dbid: any) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/favorite';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const body: any = {
            id: dbid,
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            body,
        };

        // POST
        return this.http.post(apiUrl, body, httpOptions);
    }

    removeUserFavorite(dbid: any) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/favorite';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const body: any = {
            id: dbid,
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            body,
        };

        // DELETE
        return this.http.delete(apiUrl, httpOptions);
    }

    getUserFrequentList(userid?: string): Observable<any> {
        // DbfsService :: Get User Frequently Visited List [NOT IMPLEMENTED YET]

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return of({
            mockData: true,
            frequent: [],
        });
    }

    getUserRecentList(userId: string, limit: number) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/recent';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        limit = limit ? limit : 50;

        const params: any = {
            userId,
            limit,
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params,
        };

        return this.http.get(apiUrl, httpOptions);
    }

    createFolder(folder: any) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/folder';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .put(apiUrl, folder, httpOptions)
            .pipe(catchError(this.handleError));
    }

    trashFolder(sourceId: number, destinationId: number) {
        // this is basically a moveFolder action. The 3rd parameter is a trashFolder flag
        return this.moveFolder(sourceId, destinationId, true);
    }

    trashFile(sourceId: number, destinationId: number) {
        // this is basically a moveFolder action. The 3rd parameter is a trashFolder flag
        return this.moveFolder(sourceId, destinationId, true);
    }

    moveFolder(sourceId: number, destinationId: number, trashFolder?: boolean) {
        const body = { sourceId: sourceId, destinationId: destinationId };

        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/folder/move';

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .put(apiUrl, body, httpOptions)
            .pipe(catchError(this.handleError));
    }

    updateResource(type: string, payload: any) {
        const apiUrl =
            this.appConfig.getConfig().configdb + '/dashboard/' + type;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .put(apiUrl, payload, httpOptions)
            .pipe(catchError(this.handleError));
    }

    updateFolder(folder: any) {
        return this.updateResource('folder', folder);
    }

    updateFile(file: any) {
        return this.updateResource('file', file);
    }

    getResourceById(id: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/' + id;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
        };

        return this.http
            .get(apiUrl, httpOptions)
            .pipe(catchError(this.handleError));
    }
}
