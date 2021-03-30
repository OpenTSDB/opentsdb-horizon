import { TemplatePortal } from '@angular/cdk/portal';
import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DbfsLoadNamespacesList, DbfsLoadTopFolder, DbfsResourcesState } from '../../../app-shell/state';
import { CdkService } from '../../../core/services/cdk.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
    selector: 'app-namespace',
    templateUrl: './namespace.component.html',
    styleUrls: ['./namespace.component.scss']
})
export class NamespaceComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-namespace') private hostClass = true;

    @Select(DbfsResourcesState.getResourcesLoaded) dbfsReady$: Observable<boolean>;
    @Select(DbfsResourcesState.getDynamicLoaded) dynamicLoaded$: Observable<any>;
    @Select(DbfsResourcesState.getNamespacesList) namespacesData$: Observable<any[]>;
    nsData$: Observable<any>;
    dbfsReady: boolean = false;
    namespacesLoaded: boolean = false;

    namespaceListMode: boolean = false;
    nsListItems: any[] = [];

    nsAlias: string = '';
    nsDbfs: any = {};

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
        private store: Store,
        private logger: LoggerService
    ) {
        logger.ng('NAMESPACE LANDING PAGE CONSTRUCT');
        const namespaceList = false;
        this.subscription.add(this.dbfsReady$.subscribe(value => {
            this.dbfsReady = value;
        }));

        this.subscription.add(
            this.router
                .events.pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => {
                        //this.logger.log('ROUTE CHILD', this.activatedRoute);
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
                this.logger.log('ROUTE PARAMS', params);
                if (params && params['nsalias']) {
                    this.nsAlias = params['nsalias'];
                    // do something else
                    this.store.dispatch(new DbfsLoadTopFolder('namespace', this.nsAlias, {}))
                        .subscribe(
                            () => {
                                setTimeout(() => {
                                    this.nsDbfs = this.store.selectSnapshot(DbfsResourcesState.getFolderResource('/namespace/' + this.nsAlias));
                                    this.logger.log('NS DBFS', this.nsDbfs);
                                }, 200);
                            }
                        );


                }
            })
        );

        this.subscription.add(this.dynamicLoaded$.subscribe( data => {
            this.logger.log('dynamicLoaded', data);
            if (!data.namespaces) {
                this.store.dispatch(
                    new DbfsLoadNamespacesList({})
                );
            } else {
                this.namespacesLoaded = data.namespaces;
            }

        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            this.nsListItems = namespaces;
            // this.logger.log('nsListItems DATA', namespaces);
        }));

    }


    /* privates */

    /* ON DESTROY LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}
