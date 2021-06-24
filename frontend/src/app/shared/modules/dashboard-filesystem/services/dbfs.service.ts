import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AppConfigService } from  '../../../../core/services/config.service';
import { catchError} from 'rxjs/operators';

import { ConsoleService } from '../../../../core/services/console.service';

@Injectable({
    providedIn: 'root'
})
export class DbfsService {

    constructor(
        private appConfig: AppConfigService,
        private console: ConsoleService,
        private http: HttpClient
    ) { }

    /**
     * Error Handler
     *
     * to handle error with more info
     */

    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.console.error('DbfsService :: An API error occurred', error.error.message);
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

    loadResources() {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/topFolders';

        this.console.api('DbfsService :: Load Resources', { apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.get(apiUrl, httpOptions);
    }

    getFolderByPath(path: string, topFolder?: any) {
        const params: any = {};
        let apiUrl: string;

        if (topFolder && topFolder.type && topFolder.value) {
            const tokenType = (topFolder.type === 'user') ? 'userId' : 'namespace';
            apiUrl = this.appConfig.getConfig().configdb + '/dashboard/topFolders';
            params[tokenType] = topFolder.value;
        } else {
            apiUrl = this.appConfig.getConfig().configdb + '/dashboard' + path;
        }

        this.console.api('DbfsService :: Get Folder By Path', { path, topFolder, apiUrl, params });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params
        };

        return this.http.get(apiUrl, httpOptions);

    }

    getUsersList() {
        const apiUrl = this.appConfig.getConfig().configdb + '/user/list';

        this.console.api('DbfsService :: Get Users List', { apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.get(apiUrl, httpOptions);

    }

    getNamespacesList() {
        const apiUrl = this.appConfig.getConfig().configdb + '/namespace';

        this.console.api('DbfsService :: Get Namespaces List', { apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.get(apiUrl, httpOptions);

    }

    getUserFavoritesList(userid: string) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/favorite';

        this.console.api('DbfsService :: Get User Favorites List', { apiUrl, userid });

        const params: any = {
            userId : userid
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params
        };

        return this.http.get(apiUrl, httpOptions);
    }

    addUserFavorite(dbid: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/favorite';

        this.console.api('DbfsService :: Add User Favorite', { dbid, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const body: any = {
            'id': dbid
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            body
        };

        // POST
        return this.http.post(apiUrl, body, httpOptions);

    }

    removeUserFavorite(dbid: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/favorite';

        this.console.api('DbfsService :: Add User Favorite', { dbid, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const body: any = {
            'id': dbid
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            body
        };

        // DELETE
        return this.http.delete(apiUrl, httpOptions);

    }

    getUserFrequentList(userid?: string): Observable<any> {
        this.console.api('DbfsService :: Get User Frequently Visited List [NOT IMPLEMENTED YET]');

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return of({
            mockData: true,
            frequent: []
        });
    }

    getUserRecentList(userId: string, limit: number) {

        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/recent';

        this.console.api('DbfsService :: Get User Recently Visited List', {userId, limit});

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        limit = (limit) ? limit : 50;

        const params: any = {
            userId,
            limit
        };

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json',
            params
        };

        return this.http.get(apiUrl, httpOptions);
    }

    createFolder(folder: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/folder';

        this.console.api('DashboardNavigatorService :: Create Dashboard Folder', { folder, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.put(apiUrl, folder, httpOptions).pipe(
            catchError(this.handleError)
        );
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
        const body = { 'sourceId': sourceId, 'destinationId': destinationId };

        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/folder/move';

        // tslint:disable-next-line:max-line-length
        this.console.api('DashboardNavigatorService :: ' + ((trashFolder) ? 'Trash' : 'Move') + ' Dashboard Folder', { body, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.put(apiUrl, body, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    updateResource(type: string, payload: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/' + type;

        this.console.api('DashboardNavigatorService :: Update Dashboard ' + type.toUpperCase(), { id: payload.id, payload, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.put(apiUrl, payload, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    updateFolder(folder: any) {
        return this.updateResource('folder', folder);
    }

    updateFile(file: any) {
        return this.updateResource('file', file);
    }

    getResourceById(id: any) {
        const apiUrl = this.appConfig.getConfig().configdb + '/dashboard/' + id;

        this.console.api('DashboardNavigatorService :: Get Dashboard By Id ', { id, apiUrl });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const httpOptions: any = {
            headers,
            withCredentials: true,
            responseType: 'json'
        };

        return this.http.get(apiUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

}
