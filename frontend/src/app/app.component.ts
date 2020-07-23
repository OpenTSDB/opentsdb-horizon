import { Component, OnInit, HostBinding, OnDestroy} from '@angular/core';
import { AuthState } from './shared/state/auth.state';
import { Observable, interval, Subscription } from 'rxjs';
import { MatDialog} from '@angular/material';
import { Router,  NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LoginExpireDialogComponent } from './core/components/login-expire-dialog/login-expire-dialog.component';
import { Select } from '@ngxs/store';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {
    @HostBinding('class.app-root') hostClass = true;
    @Select(AuthState.getAuth) auth$: Observable<string>;

    /** Local variables */
    title = 'app';
    fullUrlPath: string;
    authCheckSub: Subscription;

    constructor(
        private dialog: MatDialog,
        private router: Router,
        private authService: AuthService
    ) {
        // register this router events to capture url changes
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            // after resolve path, this is the url the app uses
            this.fullUrlPath = event.urlAfterRedirects;
          }
        });
    }

    ngOnInit() {
        this.auth$.subscribe(auth => {
            if (auth === 'invalid') {
                // console.log('open auth dialog');
                this.dialog.open(LoginExpireDialogComponent, {
                    disableClose: true
                });
            } else if (auth === 'valid') {
                this.dialog.closeAll();
            }
        });
        // change hearth beat to every 10 mins instead of 1 min
        const authCheck = interval(600 * 1000);
        this.authCheckSub = authCheck.subscribe(val => {
            return this.authService.getCookieStatus(true)
                .subscribe(
                        (res) => {
                            console.log("heatbeat check res", res);
                        }
                );
        });
    }

    ngOnDestroy() {
        this.authCheckSub.unsubscribe();
    }
}
