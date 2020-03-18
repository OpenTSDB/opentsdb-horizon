import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, Observable } from 'rxjs';
import { DbfsResourcesState, DbfsCreateFolder, DbfsLoadSubfolder } from '../../../../state';
import { Store } from '@ngxs/store';
import { LoggerService } from '../../../../../core/services/logger.service';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../../../core/http/http.service';

@Component({
    selector: 'app-notification-editor',
    templateUrl: './notification-editor.component.html'
})
export class NotificationEditorComponent implements OnInit, OnDestroy {
    @HostBinding('class.notification-editor') private _hostClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // state items

    // local variables
    activeNotification: boolean = false;
    notificationData: any = {};
    editMode: boolean = false;

    notificationForm: FormGroup;

    formChangeSub: Subscription;

    constructor(
        private store: Store,
        private logger: LoggerService,
        private http: HttpService,
        private fb: FormBuilder
    ) {
        this.notificationForm = this.fb.group({
            type: 'info', // default is info
            summary: '',
            detail: ''
        });
    }

    ngOnInit() {
        // if you get this far, means you are an admin, and that some data has been loaded
        // lets get that data
        this.checkNotificationFolder();

        this.formChangeSub = this.notificationForm.valueChanges.subscribe(changes => {
            this.logger.ng('FORM CHANGES', changes);
        });
    }


    /* PRIVATES */
    private checkNotificationFolder() {
        const folders = this.store.selectSnapshot(DbfsResourcesState.getFolderResources);

        // notification folder doesn't exist... create it
        if (!folders['/namespace/yamas/_notifications_']) {
            const ymsFolder = folders['/namespace/yamas'];

            const payload: any = {
                name: '_notifications_',
                parentId: ymsFolder.id
            };

            const createNotificationFolder = this.store.dispatch(new DbfsCreateFolder(payload, {}));
            createNotificationFolder.subscribe( () => {
                // folder should be created, so run routine again
                this.checkNotificationFolder();
            },
            (err) => {
                this.logger.error('PANEL CREATE NOTIFICATION FOLDER', err);
            });

        } else {
            const folder = folders['/namespace/yamas/_notifications_'];
            const loadNotificationFolder = this.store.dispatch(new DbfsLoadSubfolder(folder.fullPath, {}))
            .pipe(
                map(data => {
                    this.logger.log('DATA', data);
                    return data.DBFS.DataResources;
                })
            )
            .subscribe(data => {
                this.logger.log('PANEL NOTIFICATION FOLDER DATA', data);
                const files = data.folders['/namespace/yamas/_notifications_'].files;
                if (files.length > 2) {
                    // assuming the naming convention was adhered to
                    // first item in list will be our notification file path
                    const file = data.files[files[0]];

                    // double check to make sure it matches naming convention
                    const nameRegex = /\d{4}-\d{2}-\d{2}:(INFO|ALERT)/gmi;
                    const nameTest = nameRegex.test(file.name);

                    if (
                        nameTest
                    ) {
                        // now need to fetch notification dashboard data
                        this.http.getDashboardById(file.id).subscribe((resp: any) => {
                            this.parseNotification(resp.body);
                        });
                    }
                }

                loadNotificationFolder.unsubscribe();
            });
        }
    }

    private parseNotification(data: any) {
        this.logger.log('PANEL PARSE NOTIFICATION', data);
        this.activeNotification = true;
        this.notificationData = data;
    }

    /* NG DESTROY ALWAYS LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
