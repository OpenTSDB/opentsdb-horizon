import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { ConsoleService } from '../../../../../core/services/console.service';
import { HttpService } from '../../../../../core/http/http.service';
import { DbfsResourcesState, DbfsLoadTopFolder } from '../../../../../shared/modules/dashboard-filesystem/state';

import { NotificationService } from '../../../../services/notification.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    selector: 'app-notification-panel',
    templateUrl: './notification-panel.component.html'
})
export class NotificationPanelComponent implements OnInit, OnDestroy {

    @HostBinding('class.notification-panel') private _hostClass = true;

    // Subscriptions
    private subscription: Subscription = new Subscription();

    /*  local variables */

    editorData: any = false;
    viewMode: string = 'list'; // list || edit || create

    panelReady: boolean = false;

    private notificationStore: any = {};
    private rootPath = '/namespace/yamas';

    get activeNotification(): any {
        const widgets = this.notificationWidgets;
        const idx = widgets.findIndex((el) => el.settings.notification.enabled);

        return (idx > -1) ? widgets[idx] : false;
    }

    get disabledNotifications(): any[] {
        const widgets = this.notificationWidgets.filter((el) => !el.settings.notification.enabled);
        return widgets;
    }

    get notificationWidgets(): any[] {
        if (!this.notificationStore.content || !this.notificationStore.content.widgets) {
            return [];
        }
        return this.notificationStore.content.widgets;
    }

    constructor(
        private store: Store,
        private notificationService: NotificationService,
        private console: ConsoleService,
        private http: HttpService,
        private utils: UtilsService
    ) { }

    ngOnInit() {
        // check for the special dashboard file used
        // to store the notifications
        this.checkNotificationFile();
    }

    /* EVENTS */

    // actions that come from the list
    listAction(event: any) {

        switch (event.action) {
            /*
                Create & Edit will trigger the notification editor view
            */
            case 'create notification':
                // this.activeNotification = false;
                this.editorData = this.notificationService.getInputPrototype(this.notificationStore.content.widgets);
                this.viewMode = 'create';
                break;
            case 'edit notification':
                this.editorData = this.utils.deepClone(this.notificationStore.content.widgets[event.payload.index]);
                this.viewMode = 'edit';
                break;
            /*
                Delete, Disable, Enable will trigger a function to update notification passed
            */
            case 'delete notification':
                this.deleteNotification(event.payload.notification, event.payload.index);
                break;
            case 'disable notification':
                this.enableNotification(event.payload.notification, event.payload.index, false);
                break;
            case 'enable notification':
                this.enableNotification(event.payload.notification, event.payload.index, true);
                break;
            default:
                break;
        }
    }

    // actions that come from the editor
    editorAction(event: any) {
        let index;
        switch (event.action) {
            case 'create notification':
                this.createNotification(event.payload);
                break;
            case 'update notification':
                index = this.findIndexById(event.payload.id);
                this.updateNotification(event.payload, index);
                break;
            case 'disable notification':
                index = this.findIndexById(event.payload.id);
                this.enableNotification(event.payload, index, false);
                break;
            case 'cancel action':
            default:
                break;
        }
        this.viewMode = 'list';
        this.editorData = {};
    }

    /* PRIVATES */

    private findIndexById(id: any) {
        return this.notificationStore.content.widgets.findIndex((el) => el.id === id);
    }

    private deleteNotification(data: any, index: any) {
        // remove the notification (NOTE: this is permanent)
        this.notificationStore.content.widgets.splice(index, 1);
        // save the store
        this.saveNotificationStore();
    }

    private createNotification(data: any) {
        // get new updatedTime and updatedBy values for the notification
        data.settings.notification = Object.assign(this.notificationService.getNewUpdateValues(), data.settings.notification);
        // push into widgets
        this.notificationStore.content.widgets.unshift(data);
        // save the store
        this.saveNotificationStore();
    }

    private updateNotification(data: any, index: any) {
        // get new updatedTime and updatedBy values for the notification
        data.settings.notification = Object.assign(this.notificationService.getNewUpdateValues(), data.settings.notification);
        // replace widget in store
        this.notificationStore.content.widgets[index] = data;
        this.console.ng('notificationStore', this.notificationStore);
        // save store
        this.saveNotificationStore();
    }

    // toggles notification enabled
    private enableNotification(data: any, index: any, enabled: boolean) {
        // if there is already an activeNotification, reset it
        if (this.activeNotification && data.id !== this.activeNotification.id && enabled) {
            const activeIndex = this.notificationStore.content.widgets.findIndex((el) => el.settings.notification.enabled);
            const activeNotification = this.notificationStore.content.widgets[activeIndex];
            activeNotification.settings.notification = Object.assign(
                this.notificationService.getNewUpdateValues(),
                activeNotification.settings.notification
            );
            activeNotification.settings.notification.enabled = false;
            this.notificationStore.content.widgets[activeIndex] = activeNotification;
        }
        // get new updatedTime and updatedBy values for the notification
        data.settings.notification = Object.assign(this.notificationService.getNewUpdateValues(), data.settings.notification);
        // enable notification
        data.settings.notification.enabled = enabled;
        // replace widget in store
        this.notificationStore.content.widgets[index] = data;
        this.console.ng('notificationStore', this.notificationStore);
        // save store
        this.saveNotificationStore();
    }

    private saveNotificationStore() {
        // this.console.action('SAVE NOTIFICATION STORE', this.notificationStore);
        // save notificationStore dashboard
        this.notificationService.saveNotificationStore(this.notificationStore)
            .subscribe(
                res => {
                    // this.console.success('SAVE NOTIFICATION STORE', res);
                },
                err => {
                    this.console.error('SAVE NOTIFICATION STORE', err);
                }
            );
    }

    private checkNotificationFile() {
        const folders = this.store.selectSnapshot(DbfsResourcesState.getFolderResources);

        // notifications file doesn't exist... create it
        if (!folders[this.rootPath].files.includes(this.rootPath + '/_notifications_')) {
            this.createNotificationFile();
        // else, notification file exists... load it
        } else {
            this.loadNotificationFile();
        }
    }

    /* Create the notification storage dashboard */
    private createNotificationFile() {
        this.console.action('CREATE NOTIFICATION FILE');

        this.notificationService.createNotificationStore()
            .subscribe(
                res => {
                    // this.console.success('SAVED NOTIFICATION FILE!!', res);
                    const ymsFolder = this.store.selectSnapshot(DbfsResourcesState.getFolderResource('/namespace/yamas'));
                    this.store.dispatch(new DbfsLoadTopFolder('namespace', ymsFolder.namespace, {}))
                        .subscribe(
                            () => {
                                setTimeout(() => {
                                    this.checkNotificationFile();
                                }, 200);
                            }
                        );
                },
                err => { this.console.error('SAVE NOTIFICATION FILE', err); }
            );
    }

    /* Loads the notification "dashboard" that has notification "widgets" */
    private loadNotificationFile() {
        // this.console.action('LOAD NOTIFICATION FILE');
        const files = this.store.selectSnapshot(DbfsResourcesState.getFileResources);
        const resource = files[this.rootPath + '/_notifications_'];

        this.http.getDashboardById(resource.id)
            .subscribe(
                res => {
                    // this.console.success('LOAD NOTIFICATION FILE', res);
                    this.notificationStore = res.body;
                    this.panelReady = true;
                },
                err => { this.console.error('LOAD NOTIFICATION FILE', err); }
            );
    }

    /* ngDestroy comes last */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
