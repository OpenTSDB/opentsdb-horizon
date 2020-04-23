import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { UtilsService } from '../../core/services/utils.service';

import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class AppShellService {

    constructor(
        private logger: LoggerService,
        private http: HttpClient
    ) {}

    /* to handle error  with more info */
    // TODO : Better Error messaging?
    handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {
            // a client-side or network error occured
            this.logger.error('AppShellService :: An API error occurred', error.error.message);
        } else {
            // the backend returned unsuccessful response code
            // the response body may contain clues of what went wrong
            console.error(
                `backend return code ${error.status}, ` +
                `body was: ${error.error}`
            );
            return throwError(error);
        }
        return throwError(
            'Something bad happened; please try again later.'
        );
    }

    getUserProfile() {
        const apiUrl = environment.configdb + '/user';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        this.logger.api('AppShellService :: Get User Profile', {
            apiUrl
        });

        // put will get or create based on existing of user
        return this.http.put(apiUrl, null, {
            headers: headers,
            withCredentials: true,
            observe: 'response'
        }).pipe(
            catchError(this.handleError)
        );
        /* return this.http.get(apiUrl, {
            headers: headers,
            withCredentials: true,
            observe: 'response'
        }).pipe(
            catchError(this.handleError)
        );*/
    }

    createUser() {
        const apiUrl = environment.configdb + '/user';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        this.logger.api('AppShellService :: Create User', {
            apiUrl
        });

        return this.http.post(apiUrl, {}, {
            // headers: headers,
            withCredentials: true,
            observe: 'response'
        }).pipe(
            catchError(this.handleError)
        );
    }
}
