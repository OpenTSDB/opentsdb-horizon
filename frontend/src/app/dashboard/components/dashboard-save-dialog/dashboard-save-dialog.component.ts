import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    HostBinding
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

import { Select, Store } from '@ngxs/store';
import { DbfsResourcesState, DbfsLoadResources } from '../../../app-shell/state';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dashboard-save-dialog',
    templateUrl: './dashboard-save-dialog.component.html',
    styleUrls: []
})
export class DashboardSaveDialogComponent implements OnInit, OnDestroy {

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    @Select(DbfsResourcesState.getUser()) user$: Observable<any>;
    user: any = {};

    @Select(DbfsResourcesState.getFolderResources) folders$: Observable<any>;
    folders: any = {};

    @Select(DbfsResourcesState.getFileResources) files$: Observable<any>;
    files: any = {};

    @Select(DbfsResourcesState.getUserMemberNamespaceData()) namespacesData$: Observable<any[]>;
    namespaceOptions: any[] = [];



    @HostBinding('class.dashboard-save-dialog') private _hostClass = true;

    selectedNamespace: String | null;

    // namespaceOptions = [];
    filteredNamespaceOptions: Observable<any[]>;

    userFolders: any[] = [];
    namespaceFolders: any[] = [];

    /** Form Variables */

    saveForm: FormGroup;
    // listenSub: Subscription;
    error: any;

    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DashboardSaveDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any
    ) {
      // set up form & form control validators
      this.saveForm = this.fb.group({
          title: new FormControl(this.dbData.title, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
          namespace: new FormControl ( { value: this.dbData.namespace, disabled: this.dbData.isPersonal }),
          isPersonal: this.dbData.isPersonal
      });
      // NOTE: the form has a validator for itself that is added AFTER state resources have been loaded

    }

    ngOnInit() {
        this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
            if (loaded === false) {
                this.store.dispatch(new DbfsLoadResources());
            } else {
                // we wait till resources have been loaded in order to set form validator
                this.saveForm.setValidators(this.duplicateDashboard());
            }
        }));

        this.subscription.add(this.user$.subscribe( user => {
            // console.log('USER', {user});
            this.user = user;
        }));

        this.subscription.add(this.folders$.subscribe( folders => {
            // console.log('FOLDERS', {folders});
            this.folders = folders;
        }));

        this.subscription.add(this.files$.subscribe( files => {
            // console.log('FILES', {files});
            this.files = files;
        }));

        this.subscription.add(this.namespacesData$.subscribe( namespaces => {
            // console.log('NAMESPACES', {namespaces});
            this.namespaceOptions = namespaces;
        }));

        this.filteredNamespaceOptions = this.namespace.valueChanges
            .pipe(
                startWith(''),
                debounceTime(300),
                map(val => this.filterNamespace(val))
            );
    }

    // Custom Validator for Duplicate
    // this is a simple test to check for existing dashboard in the top level
    // of either the personal folder or namespace folder
    duplicateDashboard() {
      const self = this;
      return (group: FormGroup): {[key: string]: any} => {
        const saveType = ( group.controls['namespace'].enabled ) ? 'namespace' : 'user';
        const savePath: any = [saveType];
        const dbName = (<string>group.controls['title'].value).toLowerCase().replace(/\s+/gmi, '-');
        if (saveType === 'namespace') {
          savePath.push(group.controls['namespace'].value.trim().toLowerCase());
        } else {
          savePath.push(self.user.alias);
        }
        savePath.push(dbName);
        const check = self.files.hasOwnProperty('/' + savePath.join('/'));

        if (check) {
          const error: any = {
            duplicateDashboard: true
          };
          return error;
        }
      };
    }

    // form accessors should come after form initialized
    get title() { return this.saveForm.get('title'); }
    get namespace() { return this.saveForm.get('namespace'); }
    get isPersonal() { return this.saveForm.get('isPersonal'); }

    dashboardSaveToChanged(e: any) {
        if ('isPersonal' === e.value) {
            this.namespace.disable(); // disable namespace control
        } else if ('isNamespace' === e.value){
            this.namespace.enable(); // enable namespace control
        }
    }

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
     */
    namespaceKeydown(event: any) {
        const nsIndex = this.namespaceOptions.findIndex((item: any) => item.name.toLowerCase() === this.namespace.value.toLowerCase().trim());
        if (this.namespace.valid && nsIndex >= 0) {
            this.namespace.setValue(this.namespaceOptions[nsIndex].name);
            this.selectedNamespace = this.namespaceOptions[nsIndex].name;
        }
    }
    /**
     * * Event fired when an autocomplete option is selected
     */
    namespaceOptionSelected(event: any) {
        this.namespace.setValue(event.option.value);
        this.selectedNamespace = event.option.value;
    }

    isValidNamespaceSelected() {
        if ( this.namespace.status === 'DISABLED' ) {
             return true;
        }
        const namespace = this.namespace.value.toLowerCase().trim();
        const errors: any = {};
        // console.log(namespace, this.namespaceOptions.findIndex(d => namespace === d.name ));
        if ( namespace === '') {
            errors.required = true;
        }
        if ( namespace && this.namespaceOptions.findIndex(d => namespace === d.name.toLowerCase() ) === -1 ) {
            errors.invalid = true;
        }
        this.namespace.setErrors(Object.keys(errors).length ? errors : null);
        // console.log(this.namespace);

        return Object.keys(errors).length === 0 ? true : false;
    }

    /** SAVE BUTTON */
    saveDashboardAction() {
        if (!this.saveForm.valid) {
            // form not good
        } else if ( this.isValidNamespaceSelected() ) {
            // form is good, save it
            const data: any = { name: this.title.value};
            if ( this.namespace.enabled ) {
                // find the alias to build parentPath not the name
                const namespace = this.namespace.value.trim().toLowerCase();
                const nsIndex = this.namespaceOptions.findIndex((item: any) => item.name.toLowerCase() === namespace);
                const nsData = this.namespaceOptions[nsIndex];

                data.parentPath = '/namespace/' + nsData.alias;
                data.parentId = this.folders[data.parentPath].id;

            } else {
                const userFolder = this.folders['/' + this.user.userid.split('.').join('/')];
                data.parentPath = userFolder.path;
                data.parentId = userFolder.id;
            }
            this.dialogRef.close(data);
        }
    }

    /* ON DESTROY */
    ngOnDestroy() {
      this.subscription.unsubscribe();
  }
}
