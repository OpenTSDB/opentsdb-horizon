import { TemplatePortal } from '@angular/cdk/portal';
import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CdkService } from '../../../core/services/cdk.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
    selector: 'app-namespace',
    templateUrl: './namespace.component.html',
    styleUrls: ['./namespace.component.scss']
})
export class NamespaceComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-namespace') private hostClass = true;

    namespaceListMode: boolean = false;

    nsAlias: string = '';

    private subscription: Subscription = new Subscription();

    // portal templates
    @ViewChild('namespaceListNavbarTmpl') namespaceListNavbarTmpl: TemplateRef<any>;
    @ViewChild('namespaceDetailNavbarTmpl') namespaceDetailNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    namespaceNavbarPortal: TemplatePortal;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdkService: CdkService,
        private logger: LoggerService
    ) {
        logger.ng('NAMESPACE LANDING PAGE CONSTRUCT');
        const namespaceList = false;
        this.subscription.add(
            this.router
                .events.pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => {
                        this.logger.log('ROUTE CHILD', this.activatedRoute);
                        if (this.activatedRoute.snapshot.data['namespaceList']) {
                            return this.activatedRoute.snapshot.data['namespaceList'];
                        }
                        return namespaceList;
                    })
                ).subscribe((nsList: boolean) => {
                    this.namespaceListMode = nsList;

                    if (this.namespaceListMode) {
                        this.namespaceNavbarPortal = new TemplatePortal(this.namespaceListNavbarTmpl, undefined, {});
                    } else {
                        this.namespaceNavbarPortal = new TemplatePortal(this.namespaceDetailNavbarTmpl, undefined, {});
                    }
                    this.cdkService.setNavbarPortal(this.namespaceNavbarPortal);
                })
        );
    }

    ngOnInit() {


        this.subscription.add(
            this.activatedRoute.params.subscribe(params => {
                this.nsAlias = params['nsalias'];
                // do something else
            })
        );

    }




    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}
