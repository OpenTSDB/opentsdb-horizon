import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

import { LoggerService } from '../../core/services/logger.service';
import { namespace } from 'd3';

@Injectable()
export class DbfsService {

    constructor(
        private logger: LoggerService,
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
            this.logger.error('DbfsService :: An API error occurred', error.error.message);
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
        const apiUrl = environment.configdb + '/dashboard/topFolders';

        this.logger.api('DbfsService :: Load Resources', { apiUrl });

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
            apiUrl = environment.configdb + '/dashboard/topFolders';
            params[tokenType] = topFolder.value;
        } else {
            apiUrl = environment.configdb + '/dashboard' + path;
        }

        this.logger.api('DbfsService :: Get Folder By Path', { path, topFolder, apiUrl, params });

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
        const apiUrl = environment.configdb + '/user/list';

        this.logger.api('DbfsService :: Get Users List', { apiUrl });

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
        const apiUrl = environment.configdb + '/namespace';

        this.logger.api('DbfsService :: Get Namespaces List', { apiUrl });

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

    createFolder(folder: any) {
        const apiUrl = environment.configdb + '/dashboard/folder';

        this.logger.api('DashboardNavigatorService :: Create Dashboard Folder', { folder, apiUrl });

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
        const body = {
            sourceId,
            destinationId
        };

        const apiUrl = environment.configdb + '/dashboard/folder/move';

        // tslint:disable-next-line:max-line-length
        this.logger.api('DashboardNavigatorService :: ' + ((trashFolder) ? 'Trash' : 'Move') + ' Dashboard Folder', { body, apiUrl});

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
        const apiUrl = environment.configdb + '/dashboard/' + type;

        this.logger.api('DashboardNavigatorService :: Update Dashboard ' + type.toUpperCase(), { id: payload.id, payload, apiUrl });

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

}
