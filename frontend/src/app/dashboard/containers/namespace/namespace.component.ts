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
    nsDbfsLoaded: boolean = false;

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
                    if (!this.namespacesLoaded) {
                        this.loadNamespaceList()
                            .subscribe(
                                () => {
                                    setTimeout(() => {
                                        this.loadNamespaceData();
                                    });
                                }
                            )
                    } else {
                        this.loadNamespaceData()
                    }
                }
            })
        );

        this.subscription.add(this.dynamicLoaded$.subscribe( data => {
            this.logger.log('dynamicLoaded', data);
            if (!data.namespaces) {
                this.loadNamespaceList()
            } else {
                this.namespacesLoaded = data.namespaces;
            }

        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            this.nsListItems = namespaces;
            // this.logger.log('nsListItems DATA', namespaces);
        }));

    }


    formattedFolderData(nsPath: string): any[] {
        const folderData: any = this.nsDbfs[nsPath];
        this.logger.ng('FOLDER DATA', folderData);

        const data: any[] = [];

        for (let i = 0; i < folderData.subfolders.length; i++) {
            let item: any = {...folderData.subfolders[i]};
            if (!item.hidden && !item.trashFolder) {
                item.dataType = 'folder';
                data.push(item);
            }
        }

        for (let i = 0; i < folderData.files.length; i++) {
            let item: any = {...folderData.files[i]};
            if (!item.hidden) {
                item.dataType = 'file';
                data.push(item);
            }
        }
        this.logger.ng('DATA', data);
        return data;
    }

    navigateToNamespace(item: any) {
        this.router.navigateByUrl('/d/namespace/'+item.alias);
    }

    navigateToFolder(item: any) {

    }

    dashboardDetails(item: any) {

    }

    /* privates */
    private loadNamespaceList() {
        return this.store.dispatch(
            new DbfsLoadNamespacesList({})
        );
    }

    private loadNamespaceData() {
        this.store.dispatch(new DbfsLoadTopFolder('namespace', this.nsAlias, {}))
            .subscribe(
                () => {
                    setTimeout(() => {
                        this.nsDbfs[':nsroot:'] = this.store.selectSnapshot(DbfsResourcesState.getFolderResource('/namespace/' + this.nsAlias));
                        this.nsDbfsLoaded = true;
                        this.logger.log('NS DBFS', this.nsDbfs);
                    }, 200);
                }
            );
    }

    /* ON DESTROY LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}
