/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DbfsLoadNamespacesList, DbfsLoadTopFolder, DbfsResourcesState } from '../../../shared/modules/dashboard-filesystem/state';
import { CdkService } from '../../../core/services/cdk.service';
import { IntercomService } from '../../../core/services/intercom.service';

@Component({
    selector: 'app-namespace',
    templateUrl: './namespace.component.html',
    styleUrls: ['./namespace.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NamespaceComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-namespace') private hostClass = true;

    @Select(DbfsResourcesState.getResourcesLoaded) dbfsReady$: Observable<boolean>;
    @Select(DbfsResourcesState.getDynamicLoaded) dynamicLoaded$: Observable<any>;
    @Select(DbfsResourcesState.getNamespacesList) namespacesData$: Observable<any[]>;

    nsData$: Observable<any>;
    dbfsReady: boolean = false;
    namespacesLoaded: boolean = false;
    activeMediaQuery: string = '';

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
        private interCom: IntercomService
    ) {
        const namespaceList = false;
        this.subscription.add(this.dbfsReady$.subscribe(value => {
            this.dbfsReady = value;
        }));

        this.subscription.add(
            this.router
                .events.pipe(
                    filter(event => event instanceof NavigationEnd),
                    map(() => {
                        if (this.activatedRoute.snapshot.data['namespaceList']) {
                            return this.activatedRoute.snapshot.data['namespaceList'];
                        }
                        return namespaceList;
                    })
                ).subscribe((nsList: boolean) => {
                    this.namespaceListMode = nsList;

                    if (this.namespaceListMode) {
                        this.namespaceNavbarPortal = new TemplatePortal(this.namespaceListNavbarTmpl, undefined, {});
                        // intercom here to open navigator to namepsace list
                        this.interCom.requestSend( {
                            action: 'changeToSpecificNamespaceView',
                            payload: 'namespaceList'
                        });

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
                //this.console.log('ROUTE PARAMS', params);
                if (params && params['nsalias']) {
                    this.nsAlias = params['nsalias'];
                    if (!this.namespacesLoaded) {
                        this.loadNamespaceList()
                            .subscribe(
                                () => {
                                    setTimeout(() => {
                                        this.loadNamespaceData();
                                        // intercom here to open navigator to specific page
                                        this.interCom.requestSend( {
                                            action: 'changeToSpecificNamespaceView',
                                            payload: this.nsAlias
                                        });

                                    }, 100);
                                }
                            )
                    } else {
                        this.loadNamespaceData();
                        // intercom here to open navigator to specific page
                        this.interCom.requestSend( {
                            action: 'changeToSpecificNamespaceView',
                            payload: this.nsAlias
                        });

                    }
                }
            })
        );

        this.subscription.add(this.dynamicLoaded$.subscribe( data => {
            if (!data.namespaces) {
                this.loadNamespaceList()
            } else {
                this.namespacesLoaded = data.namespaces;
            }

        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            this.nsListItems = namespaces;
        }));

    }


    formattedFolderData(nsPath: string): any[] {
        const folderData: any = this.nsDbfs[nsPath];
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
                    }, 200);
                }
            );
    }

    /* ON DESTROY LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}
