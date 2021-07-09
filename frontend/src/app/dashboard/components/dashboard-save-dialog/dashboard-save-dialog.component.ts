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
import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    HostBinding,
    AfterViewInit,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatMenuTrigger } from '@angular/material';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import { Select, Store } from '@ngxs/store';

import { DbfsState, DbfsResourcesState, DbfsLoadResources, DbfsLoadSubfolder } from '../../../shared/modules/dashboard-filesystem/state';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dashboard-save-dialog',
    templateUrl: './dashboard-save-dialog.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSaveDialogComponent implements OnInit, OnDestroy, AfterViewInit {

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    @Select(DbfsState.getUser(false, true)) user$: Observable<any>;
    user: any = {};

    @Select(DbfsResourcesState.getFolderResources) folders$: Observable<any>;
    folders: any = {};

    @Select(DbfsResourcesState.getFileResources) files$: Observable<any>;
    files: any = {};

    @Select(DbfsState.getUserMemberNamespaceData()) namespacesData$: Observable<any[]>;
    namespaceOptions: any[] = [];

    @HostBinding('class.dashboard-save-dialog') private _hostClass = true;

    selectedNamespace: String | null;

    // namespaceOptions = [];
    filteredNamespaceOptions: Observable<any[]>;

    userFolders: any[] = [];
    namespaceFolders: any[] = [];

    /** Form Variables */

    saveForm: FormGroup = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      //namespace: new FormControl(''), // NOTE: may not need anymore
      //isPersonal: new FormControl(false), // NOTE: may not need anymore
      dbSaveLocation: new FormControl('')
    });

    // listenSub: Subscription;
    error: any;

    // tslint:disable-next-line: no-inferrable-types
    formReady: boolean = false;

    miniNavOpen: boolean = false;
    @ViewChild(MatMenuTrigger, {read: MatMenuTrigger}) miniNavSelectTrigger: MatMenuTrigger;
    private selectedSaveFolder: any;

    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DashboardSaveDialogComponent>,
        private utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public dbData: any
    ) {}

    // form accessors should come after form initialized
    // get title()      { return this.saveForm['controls']['title']; }
    // get namespace()  { return this.saveForm['controls']['namespace']; }
    // get isPersonal() { return this.saveForm['controls']['isPersonal']; }

    ngOnInit() {
        this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
            if (loaded === false) {
                // resources should have been loaded already, but just in case
                this.store.dispatch(new DbfsLoadResources());
            } else {
                // we wait till resources have been loaded in order to set form validator
                // this.saveForm.setValidators(this.duplicateDashboard());
                setTimeout(() => {
                  this.createForm();
                }, 200);
            }
        }));

        this.subscription.add(this.user$.subscribe( user => {
            this.user = user;
        }));

        this.subscription.add(this.folders$.subscribe( folders => {
            this.folders = folders;
        }));

        this.subscription.add(this.files$.subscribe( files => {
            this.files = files;
        }));

        // NOTE: may not need this anymore
        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            namespaces.sort((a: any, b: any) => {
                return this.utils.sortAlphaNum(a.name, b.name);
            });

            this.namespaceOptions = namespaces;
        }));


    }

    ngAfterViewInit() {}

    // NOTE: simplify this
    private createForm() {
        // set up form & form control validators

        this.saveForm['controls']['title'].setValue(this.dbData.title);

        //this.saveForm['controls']['dbSaveLocation'].setValue('/user/'+this.user.alias);
        this.selectedSaveFolder = this.store.selectSnapshot(DbfsResourcesState.getFolderResource('/user/'+this.user.alias));

        this.saveForm.setValidators(this.duplicateDashboard());

        this.formReady = true;
    }

    get saveLocationVal(): string {
        return this.saveForm['controls']['dbSaveLocation'].value;
    }

    // Custom Validator for Duplicate
    // this is a simple test to check for existing dashboard in the top level
    // of either the personal folder or namespace folder
    duplicateDashboard() {
      const self = this;
      return (group: FormGroup): {[key: string]: any} => {

        const dbName = group['controls']['title'] ? (<string>group['controls']['title'].value).toLowerCase().replace(/\s+/gmi, '-') : '';
        const parent = self.store.selectSnapshot(DbfsResourcesState.getFolder(self.selectedSaveFolder.fullPath));

        const check  = parent.files.includes(dbName);

        if (check) {
          const error: any = {
            duplicateDashboard: true
          };
          return error;
        }
      };
    }

    // similar to duplicateDashboard, but this is called one last time
    // when 'save' is clicked
    isDuplicateDashboard() {

        const dbName = this.saveForm['controls']['title'] ?
                       (<string>this.saveForm['controls']['title'].value).toLowerCase().replace(/\s+/gmi, '-') : '';

        const parent = this.store.selectSnapshot(DbfsResourcesState.getFolder(this.selectedSaveFolder.fullPath));

        const check: boolean = parent.files.includes(dbName);

        if (check) {
            this.saveForm.get('title').setErrors({duplicateDashboard: true});
        }

        return !check;
    }

    // NOTE: may not need this anymore
    dashboardSaveToChanged(e: any) {
        if ('isPersonal' === e.value) {
            this.saveForm['controls']['namespace'].disable(); // disable namespace control
        } else if ('isNamespace' === e.value){
            this.saveForm['controls']['namespace'].enable(); // enable namespace control
        }
    }

    // NOTE: may not need this anymore
    filterNamespace(val: string): string[] {
        return this.namespaceOptions.filter(option => {
            if (val === '') {
                return option.name;
            } else {
                return option.name.toLowerCase().includes(val.toLowerCase().trim());
            }
        });
    }

    /**
     * * If user hits enter, the input is valid and that option must exist in the list
     * * Is this still necessary?
     * * NOTE: may not need anymore || modify?
     */
    namespaceKeydown(event: any) {
        // tslint:disable-next-line: max-line-length
        const nsIndex = this.namespaceOptions.findIndex((item: any) => item.name.toLowerCase() === this.saveForm['controls']['namespace'].value.toLowerCase().trim());
        if (this.saveForm['controls']['namespace'].valid && nsIndex >= 0) {
            this.saveForm['controls']['namespace'].setValue(this.namespaceOptions[nsIndex].name);
            this.selectedNamespace = this.namespaceOptions[nsIndex].name;
        }
    }
    /**
     * * Event fired when an autocomplete option is selected
     * * NOTE: may not need anymore
     */
    namespaceOptionSelected(event: any) {
        this.saveForm['controls']['namespace'].setValue(event.option.value);
        this.selectedNamespace = event.option.value;
    }

    // NOTE: may not need anymore || modify?
    isValidNamespaceSelected() {
        if ( this.saveForm['controls']['namespace'].status === 'DISABLED' ) {
             return true;
        }
        const namespace = this.saveForm['controls']['namespace'].value.toLowerCase().trim();
        const errors: any = {};

        if ( namespace === '') {
            errors.required = true;
        }
        if ( namespace && this.namespaceOptions.findIndex(d => namespace === d.name.toLowerCase() ) === -1 ) {
            errors.invalid = true;
        }
        this.saveForm['controls']['namespace'].setErrors(Object.keys(errors).length ? errors : null);

        return Object.keys(errors).length === 0 ? true : false;
    }



    /** MINI NAV EVENTS */

    miniNavClosed(event: any) {
        this.miniNavOpen = false;
    }

    miniNavCancel(event: any) {
        this.miniNavSelectTrigger.closeMenu();
    }

    miniNavSelected(event: any) {
        if (event.action === 'miniNavSave') {
            this.miniNavSelectTrigger.closeMenu();
            this.selectedSaveFolder = event.payload;
            this.saveForm.get('dbSaveLocation').setValue(this.selectedSaveFolder.fullPath);
            // check if the folder has been loaded
            const folder = this.store.selectSnapshot(DbfsResourcesState.getFolder(this.selectedSaveFolder.fullPath));
            if (!folder.topFolder && !folder.loaded) {
                this.store.dispatch(new DbfsLoadSubfolder(folder.fullPath, {}));
            }
        }
    }

    saveLocationInputFocus() {
        this.miniNavOpen = true;
        this.miniNavSelectTrigger.openMenu();
    }

    toggleMiniNav() {
        if (this.miniNavOpen) {
            this.miniNavOpen = false;
            this.miniNavSelectTrigger.closeMenu();
        } else {
            this.miniNavOpen = true;
            this.miniNavSelectTrigger.openMenu();
            this
        }
    }

    /** SAVE BUTTON */
    saveDashboardAction() {
        if (!this.saveForm.valid) {
            // form not good
        } else if (
            // check is dashboard is duplicate
            this.isDuplicateDashboard()
        ) {
            // user accesible folders and namespaces are handled by the mini nav now
            // so whatever is selected is what the user has access to

            const data: any = {
                name: this.saveForm['controls']['title'].value,
                parentPath: this.selectedSaveFolder.fullPath,
                parentId: this.selectedSaveFolder.id
             };

             this.dialogRef.close(data);
        }

    }

    /* ON DESTROY */
    ngOnDestroy() {
      this.subscription.unsubscribe();

  }
}
