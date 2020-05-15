import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { LoggerService } from '../../../../../core/services/logger.service';
import { HttpService } from '../../../../../core/http/http.service';
import { DbfsResourcesState, DbfsCreateFolder, DbfsLoadSubfolder } from '../../../../state';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-notification-panel',
    templateUrl: './notification-panel.component.html'
})
export class NotificationPanelComponent implements OnInit, OnDestroy {

    @HostBinding('class.notification-panel') private _hostClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    /*  local variables */
    activeNotification: boolean = false;
    notificationData: any = {};

    constructor(
        private store: Store,
        private logger: LoggerService,
        private http: HttpService
    ) { }

    ngOnInit() {
        // check for the special folder used
        // to store the notifications
        this.checkNotificationFolder();
    }



    /* Privates */

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

    /* ngDestroy comes last */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
