import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { LoggerService } from '../../../../../core/services/logger.service';

@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {
    @HostBinding('class.notification-list') private _hostClass = true;

    @Input() active: any = false;
    @Input() notifications: any[] = [];

    @Output() listActionOutput = new EventEmitter();

    /* local variables */
    panelExpanded: any = 'active';
    deleteConfirm: any = -1; // if confirming, it will be index of Notification, otherwise -1

    constructor(
        private logger: LoggerService
    ) { }

    ngOnInit() {
        if (!this.active) {
            this.panelExpanded = 0;
        }
    }

    /* BEHAVIORS */

    expandPanel(panelId: any) {
        this.panelExpanded = panelId;
    }

    editNotification(notification: any, index: any) {
        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
        }
        // this.logger.log('EDIT NOTIFICATION', { notification, index});
        this.listActionOutput.emit({
            action: 'edit notification',
            payload: { notification, index }
        });
    }

    disableNotification(notification: any, index: any) {
        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
        }
        // this.logger.log('DISABLE NOTIFICATION', { notification, index});
        this.expandPanel(0);
        this.listActionOutput.emit({
            action: 'disable notification',
            payload: { notification, index }
        });
    }

    enableNotification(notification: any, index: any) {
        // this.logger.log('ENABLE NOTIFICATION', { notification, index});
        // should check if there is active already
        // if there is active, should prompt user to confirm active switch to new notification
        this.expandPanel('active');
        this.listActionOutput.emit({
            action: 'enable notification',
            payload: { notification, index }
        });
    }

    showDeleteConfirmation(index: any) {
        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
        }
        const notification = this.notifications[index];
        this.deleteConfirm = notification.id;
       //  this.logger.log('showDeleteConfirm', {deleteConfirm: this.deleteConfirm, index, notification});
    }

    cancelDeletion() {
        this.deleteConfirm = -1;
        // this.logger.log('cancelDeletion');
    }

    deleteNotification(notification: any, index: any) {

        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
            // this.logger.log('DELETE [ACTIVE] NOTIFICATION', { notification, index});
        }

        if (
            this.deleteConfirm === -1 ||
            (this.deleteConfirm !== -1 && this.deleteConfirm !== this.notifications[index].id)
         ) {
            // this.logger.log('NEEDS DELETE CONFIRMATION', { notification, index});
            this.showDeleteConfirmation(index);
        } else {
            // this.logger.log('DELETE NOTIFICATION', { notification, index});

            this.deleteConfirm = -1;
            this.listActionOutput.emit({
                action: 'delete notification',
                payload: { notification, index }
            });

        }
    }

    createNotification() {
        // this.logger.event('CLICK CREATE NOTIFICATION');
        this.listActionOutput.emit({
            action: 'create notification'
        });
    }

}
