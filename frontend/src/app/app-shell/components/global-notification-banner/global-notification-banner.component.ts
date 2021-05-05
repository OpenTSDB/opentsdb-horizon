import {
    Component,
    EventEmitter,
    Output,
    OnInit,
    HostBinding,
    AfterViewInit,
    OnDestroy
} from '@angular/core';

import {
    DbfsState
} from '../../../shared/modules/dashboard-filesystem/state/dbfs.state';

import {
    DbfsResourcesState,
    DbfsLoadTopFolder,
} from '../../../shared/modules/dashboard-filesystem/state/dbfs-resources.state';

import { Subscription, Observable, interval } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ConsoleService } from '../../../core/services/console.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { HttpService } from '../../../core/http/http.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'global-notification-banner',
    templateUrl: './global-notification-banner.component.html',
    styleUrls: ['./global-notification-banner.component.scss']
})
export class GlobalNotificationBannerComponent implements OnInit, OnDestroy, AfterViewInit {

    @HostBinding('class.global-notification-component') private _hostClass = true;
    @HostBinding('class.notification-visible') private _visible = false; // true/false
    @HostBinding('class.info-notification') private _infoType = false;
    @HostBinding('class.alert-notification') private _alertType = false;

    @Output() globalNotificationVisible: EventEmitter<any> = new EventEmitter();

    // Subscriptions
    private subscription: Subscription = new Subscription();

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    showDetail = false;

    notification: any = {
        id: '',
        type: '',
        summary: ''
        // detail is optional
        // detail?: ''
    };

    private rootPath = '/namespace/yamas';

    private resourcesReady = false;

    constructor(
        private store: Store,
        private localStorage: LocalStorageService,
        private http: HttpService,
        private console: ConsoleService,
    ) {
        if (!localStorage.hasKey('globalNotifications')) {
            // initialize global notifications dismissal cache
            const globalNotificationCache = {
                lastNotification: null,
                dismissedCache: [],
                cacheLastCleared: Date.now()
            };
            localStorage.setLocal('globalNotification', JSON.stringify(globalNotificationCache));
        }
    }

    ngOnInit() {
        this.subscription.add(this.resourcesLoaded$.subscribe(loaded => {
            if (loaded === true) {
                this.resourcesReady = true;
                this.checkNotificationFile();
            }
        }));

        // possibly disable polling if an alert is already visible?
        const notificationCheck = interval(60 * 1000);
        this.subscription.add(notificationCheck.subscribe(() => {
            if (this.resourcesReady) {
                this.checkNotificationFile();
            }
        }));
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.globalNotificationVisible.emit({ visible: this._visible });
        }, 200);
    }

    /* NOTIFICATION ACTIONS */
    showNotification() {
        this._visible = true;
        this.globalNotificationVisible.emit({ visible: this._visible });
    }

    dismissNotification() {
        this._visible = false;
        this.globalNotificationVisible.emit({ visible: this._visible });
        // TODO: save id to dismissed cache in localstorage
        const gnCache = JSON.parse(this.localStorage.getLocal('globalNotification'));
        if (!gnCache.dismissedCache.includes(this.notification.id)) {
            gnCache.dismissedCache.push(this.notification.id);
            this.localStorage.setLocal('globalNotification', JSON.stringify(gnCache));
        }
    }

    /* DETAIL ACTIONS */
    showNotificationDetail() {
        this.showDetail = true;
    }

    hideNotificationDetail() {
        this.showDetail = false;
    }

    /** PRIVATES */

    private checkNotificationFile() {
        const folders = this.store.selectSnapshot(DbfsResourcesState.getFolderResources);

        // check for rootPath folder
        if (!folders[this.rootPath]) {
            // rootpath does not exist... need to load it
            this.loadRootPath();
        } else {
            // rootpath exists
            // check for notificationStore file
            if (folders[this.rootPath].files.includes(this.rootPath + '/_notifications_')) {
                this.loadNotificationFile();
            }
            // NOTE: we only load file if it exists
            // Do not create here, because user might not have permission
            // create is only in admin panel
        }
    }

    private loadRootPath() {
        const namespace = this.rootPath.split('/').pop();
        this.store.dispatch(new DbfsLoadTopFolder('namespace', namespace, {}))
                .subscribe(
                    () => {
                        setTimeout(() => {
                            this.checkNotificationFile();
                        }, 200);
                    }
                );
    }

    private loadNotificationFile() {
        // this.console.action('LOAD NOTIFICATION FILE');
        const files = this.store.selectSnapshot(DbfsResourcesState.getFileResources);
        const resource = files[this.rootPath + '/_notifications_'];

        this.http.getDashboardById(resource.id)
            .subscribe(
                (res: any) => {
                    // this.console.success('LOAD NOTIFICATION FILE', res);
                    this.checkForActiveNotification(res.body.content.widgets);
                },
                err => { this.console.error('LOAD NOTIFICATION FILE', err); }
            );
    }

    private checkForActiveNotification(notifications: any[]) {

        const activeIndex = notifications.findIndex((el: any) => el.settings.notification.enabled);

        if (activeIndex !== -1) {
            this.parseNotification(notifications[activeIndex]);
        }
    }

    private parseNotification(data: any) {

        // tslint:disable-next-line: prefer-const
        let globalNofication: any = {
            id: data.id,
            type: data.settings.notification.type,
            summary: data.settings.summary
        };

        // add detail if there is any
        const detail: string = data.settings.visual.text;
        if (detail.length > 0) {
            globalNofication.detail = detail;
        }

        // set hostbinding classes
        this._infoType = globalNofication.type === 'info';
        this._alertType = globalNofication.type === 'alert';

        // assign notification
        this.notification = globalNofication;

        // update localstorage
        const gnCache = JSON.parse(this.localStorage.getLocal('globalNotification'));
        gnCache.lastNotification = globalNofication.id;
        this.localStorage.setLocal('globalNotification', JSON.stringify(gnCache));

        // show notification
        this.showNotification();
    }

    /** ON DESTROY LAST */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
