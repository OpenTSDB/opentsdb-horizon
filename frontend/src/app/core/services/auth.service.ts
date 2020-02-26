import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { SetAuth } from '../../shared/state/auth.state';
import { Observable , of} from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient, private store: Store) {
        //console.log('auth service store=>', this.store);
    }

    /*
        renews the cookie.
        image.src follows the browser redirects and renews the auth cookies
    */
    canCookieRenewed() {
        const self = this;
        return new Observable((observer) => {
            const image = new Image();
            image.src = '/heartbeatimg?t=' + new Date().getTime();
            image.onload = function() {
                observer.next('cookie-renewed');
                self.store.dispatch(new SetAuth('valid'));
            };
            image.onerror = function(e) {
                observer.next('cookie-invalid');
                observer.complete();
                self.store.dispatch(new SetAuth('invalid'));
            };
        });
    }

    /*
        checks the login cookie. It will try to renew the cookie when the cookie is expired.
        returns Observable<string> cookie-valid | cookie-invalid | cookie-renewed | cookie-check-error
    */
    getCookieStatus() {
        const self = this;
        self.store.dispatch(new SetAuth('unknown'));
        return this.http.get('/heartbeat')
            .pipe(
                map(
                    (res) => {
                        self.store.dispatch(new SetAuth('valid'));
                        return of('cookie-valid');
                    }
                ),
                catchError(
                    error => {
                        if ( error.status === 401 ) {
                            return this.canCookieRenewed();
                        }
                        return of('cookie-check-error');
                    }
                )
            );
    }
}
