import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetAuth } from '../../../shared/state/auth.state';

@Component({
  selector: 'app-login-warning-dialog',
  templateUrl: './login-expire-dialog.component.html'
})
export class LoginExpireDialogComponent {

    constructor(private store: Store) { }

    login() {
        const self = this;
        const w = 600;
        const h = 700;
        const left = (window.screen.width - w) / 2;
        const top = (window.screen.height - h) / 4;
        const win = window.open('/login', 'childWin', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        window.onmessage = function(e) {
            if ( e.data === 'login-success' ) {
                self.store.dispatch(new SetAuth('valid'));
            }
        };
    }
}
