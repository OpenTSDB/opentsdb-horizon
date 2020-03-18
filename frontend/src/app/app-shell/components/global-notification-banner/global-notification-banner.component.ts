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
} from '../../state/dbfs.state';

import {
  DbfsResourcesState,
  DbfsLoadSubfolder,
  DbfsLoadTopFolder,
} from '../../state/dbfs-resources.state';

import { Subscription, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LoggerService } from '../../../core/services/logger.service';
import { LocalStorageService } from '../../services/local-storage.service';
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

  constructor(
      private store: Store,
      private localStorage: LocalStorageService,
      private http: HttpService,
      private logger: LoggerService,
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
      this.subscription.add(this.resourcesLoaded$.subscribe( loaded => {
          if (loaded === true) {
              // check if yamas notifications folder is present, then check notification folder for messages
              this.checkYamasNSLoaded();
          }
      }));

      // possibly disable polling if an alert is already visible?
      const notificationCheck = interval(60 * 1000);
      this.subscription.add(notificationCheck.subscribe(() => {
          this.logger.action('NOTIFICATION CHECK');
          this.checkNotificationFolder();
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

  private checkYamasNSLoaded() {
      console.group('CHECK YAMAS NS LOADED');
      // need to check if notification folder has been loaded
      // should be fine for users in yamas namespace, but others will need to be loaded

      // check if user has access to yamas namespace
      const user = this.store.selectSnapshot(DbfsState.getUser());
      // this.logger.log('User', user);
      if (!user.memberNamespaces.includes('yamas')) {
          // console.log('NO YAMAS');
          // no yamas, so we need to load yamas topFolder
          const loadTopFolder = this.store.dispatch(new DbfsLoadTopFolder('namespace', 'yamas', {})).subscribe(data => {
              this.checkNotificationFolder();
              loadTopFolder.unsubscribe();
          });
      } else {
          // console.log('YAY! YAMAS!');
          // Yamas top folder should be loaded... now load notification folder
          this.checkNotificationFolder();
      }

      console.groupEnd();
  }

  private checkNotificationFolder() {
      // console.log('CHECK NOTIFICATION FOLDER');
      // by now, yamas topFolder should be loaded
      // need to load notifications folder
      const folders = this.store.selectSnapshot(DbfsResourcesState.getFolderResources);
      // this.logger.log('Folders', folders);

      if (!folders['/namespace/yamas/_notifications_']) {
          // uh oh... notifications folder doesn't exist.
          // yamas team will need to create since its possible the user can't
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
              this.logger.log('NOTIFICATION FOLDER DATA', data);
              const files = data.folders['/namespace/yamas/_notifications_'].files;
              if (files.length > 2) {
                  // assuming the naming convention was adhered to
                  // first item in list will be our notification file path
                  const file = data.files[files[0]];

                  // double check to make sure it matches naming convention
                  const nameRegex = /\d{4}-\d{2}-\d{2}:(INFO|ALERT)/gmi;
                  const nameTest = nameRegex.test(file.name);

                  // check if there is no notification
                  // or if there is a new notification that doesn't match the previous notification
                  // TODO: check against dismissed cache from local storage
                  const gnCache = JSON.parse(this.localStorage.getLocal('globalNotification'));

                  if (
                      nameTest &&
                      !gnCache.dismissedCache.includes(file.id) &&
                      (
                          !this.notification ||
                          (this.notification && this.notification.id !== file.id)
                      )
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
      this.logger.log('PARSE NOTIFICATION', data);

      // tslint:disable-next-line: prefer-const
      let globalNofication: any = {
          id: data.id,
          type: data.content.widgets[0].settings.visual.text,
          summary: data.content.widgets[1].settings.visual.text
      };

      // add detail if there is any
      const detail: string = data.content.widgets[2].settings.visual.text;
      if (detail.length > 0) {
          globalNofication.detail = detail;
      }

      // set hostbinding classes
      this._infoType = globalNofication.type === 'INFO';
      this._alertType = globalNofication.type === 'ALERT';

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
