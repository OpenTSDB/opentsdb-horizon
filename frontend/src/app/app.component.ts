import { Component, OnInit, HostBinding, OnDestroy} from '@angular/core';
import { AuthState } from './shared/state/auth.state';
import { Observable, interval, Subscription } from 'rxjs';
import { MatDialog} from '@angular/material';
import { Router,  NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LoginExpireDialogComponent } from './core/components/login-expire-dialog/login-expire-dialog.component';
import { Select } from '@ngxs/store';
//import { UniveralDataTooltipComponent } from './shared/modules/universal-data-tooltip/components/universal-data-tooltip/universal-data-tooltip.component';
import { UniversalDataTooltipService } from './shared/modules/universal-data-tooltip/services/universal-data-tooltip.service';


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
        private authService: AuthService,
        private ttSrvc: UniversalDataTooltipService
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

        //this.ttSrvc.addTTComponentToBody(UniveralDataTooltipComponent);

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

        const authCheck = interval(60 * 1000);
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
