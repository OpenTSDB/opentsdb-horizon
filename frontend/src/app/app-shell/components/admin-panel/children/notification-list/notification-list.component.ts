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
import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { ConsoleService } from '../../../../../core/services/console.service';

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
        private console: ConsoleService
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
        this.listActionOutput.emit({
            action: 'edit notification',
            payload: { notification, index }
        });
    }

    disableNotification(notification: any, index: any) {
        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
        }
        this.expandPanel(0);
        this.listActionOutput.emit({
            action: 'disable notification',
            payload: { notification, index }
        });
    }

    enableNotification(notification: any, index: any) {
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
    }

    cancelDeletion() {
        this.deleteConfirm = -1;
    }

    deleteNotification(notification: any, index: any) {

        if (index === 'active') {
            index = this.notifications.findIndex((el) => el.settings.notification.enabled);
        }

        if (
            this.deleteConfirm === -1 ||
            (this.deleteConfirm !== -1 && this.deleteConfirm !== this.notifications[index].id)
         ) {
            this.showDeleteConfirmation(index);
        } else {
            this.deleteConfirm = -1;
            this.listActionOutput.emit({
                action: 'delete notification',
                payload: { notification, index }
            });

        }
    }

    createNotification() {
        this.listActionOutput.emit({
            action: 'create notification'
        });
    }

}
