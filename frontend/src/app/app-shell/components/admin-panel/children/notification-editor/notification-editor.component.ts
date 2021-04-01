import { Component, OnInit, HostBinding, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { ConsoleService } from '../../../../../core/services/console.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    selector: 'app-notification-editor',
    templateUrl: './notification-editor.component.html'
})
export class NotificationEditorComponent implements OnInit, OnDestroy {
    @HostBinding('class.notification-editor') private _hostClass = true;

    @Input() mode: string = 'create';
    @Input() notificationData: any = {};

    @Output() editorActionOutput = new EventEmitter();

    // Subscriptions
    private subscription: Subscription = new Subscription();

    // local variables
    get activeNotification(): boolean {
        if (!this.notificationData.settings) {
            return false;
        }
        return this.notificationData.settings.notification.enabled;
    }

    notificationForm: FormGroup;

    formChangeSub: Subscription;

    constructor(
        private console: ConsoleService,
        private fb: FormBuilder,
        private utils: UtilsService
    ) {}

    ngOnInit() {
        this.notificationForm = this.fb.group({
            type: new FormControl(this.notificationData.settings.notification.type, [Validators.required]),
            title: new FormControl(this.notificationData.settings.title, [Validators.required]),
            summary: new FormControl(this.notificationData.settings.summary, [Validators.required]),
            detail: new FormControl(this.notificationData.settings.visual.text)
        });

    }

    /* BEHAVIORS */

    createNotificationAction() {
        // check for form validity
        if (this.notificationForm.valid) {
            // if good, format data, and emit
            const notificationData = this.getUpdatedNotificationData();
            this.editorActionOutput.emit({
                action: 'create notification',
                payload: notificationData
            });
        }
    }

    updateNotificationAction() {
        // check for form validity
        if (this.notificationForm.valid) {
            // if good, format data, and emit
            const notificationData = this.getUpdatedNotificationData();
            this.editorActionOutput.emit({
                action: 'update notification',
                payload: notificationData
            });
        }
    }

    disableNotificationAction() {
        // check for form validity
        if (this.notificationForm.valid) {
            // if good, format data, and emit
            const notificationData = this.getUpdatedNotificationData();
            this.editorActionOutput.emit({
                action: 'disable notification',
                payload: notificationData
            });
        }
    }

    cancelAction() {
        this.editorActionOutput.emit({
            action: 'cancel action'
        });
    }

    /* PRIVATES */

    // normalize form values into the notification data
    private getUpdatedNotificationData() {
        const formValues = this.notificationForm.getRawValue();
        const data = this.utils.deepClone(this.notificationData);
        data.settings.notification.type = formValues.type;
        data.settings.title = formValues.title;
        data.settings.summary = formValues.summary;
        data.settings.visual.text = formValues.detail;
        return data;
    }


    /* NG DESTROY ALWAYS LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
