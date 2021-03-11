import { TemplatePortal } from '@angular/cdk/portal';
import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CdkService } from '../../../core/services/cdk.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-user') private hostClass = true;

    userListMode: boolean = false;

    userAlias: string = '';

    private subscription: Subscription = new Subscription();

    // portal templates
    @ViewChild('userListNavbarTmpl') userListNavbarTmpl: TemplateRef<any>;
    @ViewChild('userDetailNavbarTmpl') userDetailNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    userNavbarPortal: TemplatePortal;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdkService: CdkService,
        private logger: LoggerService
    ) {
        const userList = false;
        this.subscription.add(
            this.router
                .events.pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => {
                        this.logger.log('ROUTE CHILD', this.activatedRoute);
                        if (this.activatedRoute.snapshot.data['userList']) {
                            return this.activatedRoute.snapshot.data['userList'];
                        }
                        return userList;
                    })
                ).subscribe((nsList: boolean) => {
                    this.userListMode = nsList;

                    if (this.userListMode) {
                        this.userNavbarPortal = new TemplatePortal(this.userListNavbarTmpl, undefined, {});
                    } else {
                        this.userNavbarPortal = new TemplatePortal(this.userDetailNavbarTmpl, undefined, {});
                    }
                    this.cdkService.setNavbarPortal(this.userNavbarPortal);
                })
        );
    }

    ngOnInit() {
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
