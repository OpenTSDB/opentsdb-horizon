import { Injectable } from '@angular/core';
import { UtilsService } from '../../core/services/utils.service';
import { DashboardConverterService } from '../../core/services/dashboard-converter.service';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { Store } from '@ngxs/store';
import { DbfsState, DbfsResourcesState } from '../state';
import { HttpService } from '../../core/http/http.service';
import { LoggerService } from '../../core/services/logger.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(
        private utils: UtilsService,
        private dbService: DashboardService,
        private dbConverterService: DashboardConverterService,
        private store: Store,
        private http: HttpService,
        private logger: LoggerService
    ) { }

    // create the "_notifications_" dashboard
    createNotificationStore() {
        const folders = this.store.selectSnapshot(DbfsResourcesState.getFolderResources);
        const ymsFolder = folders['/namespace/yamas'];

        const dbProto = this.getNotificationPrototype();

        const payload: any = {
            name: '_notifications_',
            parentId: ymsFolder.id,
            content: dbProto
        };

        return this.http.saveDashboard('_new_', payload);
    }

    // save the "_notifications_" dashboard
    saveNotificationStore(data: any) {
        const payload: any = {
            id: data.id,
            content: data.content
        };
        this.logger.api('saveNotificationStore', payload);
        return this.http.saveDashboard(payload.id, payload);
    }

    /* will use dashboard prototype for notification container from dashboardService */
    getNotificationPrototype(type = 'info'): any {
        const notificationProto: any = this.utils.deepClone(this.dbService.getDashboardPrototype());
        notificationProto.settings.meta.title = '_notifications_';
        notificationProto.settings.meta.description = 'Dashboard storage for Horizon notifications';
        notificationProto.widgets = []; // reset widgets to empty
        notificationProto.version = this.dbConverterService.getDBCurrentVersion();

        return notificationProto;
    }

    /* will use widget prototype for notification from dashboardService */
    getInputPrototype(widgets= []): any {
        const inputProto: any = this.utils.deepClone(this.dbService.getWidgetPrototype('MarkdownWidgetComponent', widgets));
        inputProto.settings.title = 'new notification';
        inputProto.settings.summary = '';

        // trim down the unneccessary items
        inputProto.settings.time = {};

        // reset visual to match values for markdown
        inputProto.settings.visual = {
            text: '',
            backgroundColor: '#FFFFFF',
            font: 'default',
            textColor: '#000000'
        };

        // now notification specific
        const time = Date.now();
        const user = this.store.selectSnapshot(DbfsState.getUser());
        inputProto.settings.notification = {
            enabled: false,
            createdTime: time,
            createdBy: user.userid,
            updatedTime: time,
            updatedBy: user.userid,
            type: 'info'
        };

        /* NOTE:
            Notification Label (shows in admin list) = widget.settings.title
            Notification Summary (global notification summary) = widget.settings.summary
            Notification Details (global notification "read more" details) = widget.settings.visual.text
        */

        return inputProto;
    }

    // since notifications are stored as "widgets"
    // there isn't a mechanism to track updated time
    // and by who. So we use this function to generate
    // that data so it can be appended to the notification widget
    getNewUpdateValues(): any {
        const updatedTime = Date.now();
        const updatedBy = this.store.selectSnapshot(DbfsState.getUser());
        const updateValues: any = {
            updatedTime,
            updatedBy
        }
        return updateValues;
    }
}
