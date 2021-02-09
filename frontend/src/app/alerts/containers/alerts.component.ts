import {
    Component,
    ElementRef,
    HostBinding,
    OnDestroy,
    OnInit,
    ViewChild,
    TemplateRef,
    Input,
    ChangeDetectorRef,
    AfterViewChecked
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import {
    MatPaginator,
    MatTableDataSource,
    MatSort,
    MatDialog,
    MatDialogRef,
    MatDialogConfig,
    MatSnackBar
} from '@angular/material';

import { Observable, Subscription, Subject } from 'rxjs';
import { delayWhen, filter, skip, distinctUntilChanged, debounce, debounceTime } from 'rxjs/operators';
import { HttpService } from '../../core/http/http.service';
import { AppConfigService } from "../../core/services/config.service";


import { Select, Store } from '@ngxs/store';

import {
    AlertsState,
    AlertModel,
    LoadNamespaces,
    CheckWriteAccess,
    LoadAlerts,
    LoadSnoozes,
    DeleteAlerts,
    DeleteSnoozes,
    ToggleAlerts,
    SaveAlerts,
    SetNamespace,
    SaveSnoozes,
    ClearNamespace
} from '../state/alerts.state';
import { DbfsResourcesState } from '../../app-shell/state/dbfs-resources.state';
import { AlertState, GetAlertDetailsById } from '../state/alert.state';
import { SnoozeState, GetSnoozeDetailsById } from '../state/snooze.state';

import { AlertDetailsComponent } from '../components/alert-details/alert-details.component';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { RecipientType } from '../components/alert-details/children/recipients-manager/models';

import { CdkService } from '../../core/services/cdk.service';
import { AuraDialogComponent } from '../../shared/modules/sharedcomponents/components/aura-dialog/aura-dialog.component';

import * as _moment from 'moment';
import { TemplatePortal } from '@angular/cdk/portal';
import { IntercomService, IMessage } from '../../core/services/intercom.service';
import { LoggerService } from '../../core/services/logger.service';
import { UtilsService } from '../../core/services/utils.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { SnoozeDetailsComponent } from '../components/snooze-details/snooze-details.component';
import { FormControl } from '@angular/forms';
import { DataShareService } from '../../core/services/data-share.service';
import { InfoIslandService } from '../../shared/modules/info-island/services/info-island.service';
const moment = _moment;

@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: []
})
export class AlertsComponent implements OnInit, OnDestroy, AfterViewChecked {

    @HostBinding('class.alerts-container-component') private _hostClass = true;
    // @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
        if (paginator && this.list === 'alerts' && this.alertsDataSource) {
            this.alertsDataSource.paginator = paginator;
        }
        if (paginator && this.list === 'snooze' && this.snoozesDataSource) {
            this.snoozesDataSource.paginator = paginator;
        }
    }
    @ViewChild(MatSort) set dataSourceSort(sortor: MatSort) {
        if (sortor && this.list === 'alerts' && this.alertsDataSource) {
            this.alertsDataSource.sort = sortor;
        }
        if (sortor && this.list === 'snooze' && this.snoozesDataSource) {
            this.snoozesDataSource.sort = sortor;
        }
    }

    @ViewChild('namespaceDropMenuTrigger', {read: ElementRef}) namespaceDropMenuTrigger: ElementRef;
    namespaceDropMenuTriggerWidth: string = '0px';

    @ViewChild('confirmDeleteDialog', { read: TemplateRef }) confirmDeleteDialogRef: TemplateRef<any>;

    @Input() response;

    private subscription: Subscription = new Subscription();

    @Select(AlertsState.getLoaded) loaded$: Observable<any>;
    stateLoaded: any = {};

    @Select(DbfsResourcesState.getResourcesLoaded) resourcesLoaded$: Observable<any>;

    @Select(AlertsState.getSelectedNamespace) selectedNamespace$: Observable<any>;
    selectedNamespace = '';

    hasNamespaceWriteAccess = false;

    @Select(AlertsState.getUserNamespaces) userNamespaces$: Observable<any[]>;
    userNamespaces: any[] = [];

    @Select(AlertsState.getAllNamespaces) allNamespaces$: Observable<any[]>;
    allNamespaces: any[] = [];

    allNamespacesDS = new MatTableDataSource([]);

    @Select(AlertState.getAlertDetails) alertDetail$: Observable<any>;
    @Select(AlertState.getError) alertDetailError$: Observable<any>;
    @Select(SnoozeState.getSnoozeDetails) snoozeDetail$: Observable<any>;

    // this gets dynamically selected depending on the tab filter.
    // see this.stateSubs['asActionResponse']
    // under the case 'setAlertTypeFilterSuccess'
    @Select(AlertsState.getAlerts) alerts$: Observable<any[]>;
    alerts: AlertModel[] = [];
    @Select(AlertsState.getSnoozes) snoozes$: Observable<any[]>;
    snoozes: AlertModel[] = [];
    alertListMeta: any = [];

    @Select(AlertsState.getActionStatus) status$: Observable<string>;

    // for the table datasource
    alertsDataSource; // dynamically gets reassigned after new alerts state is subscribed
    displayedColumns: string[] = [
        'select',
        'bad',
        'warn',
        'good',
        'unknown',
        'missing',
        'name',
        'type',
        'alertGroupingRules',
        'contacts',
        'updatedTime',
        'updatedBy'
        // 'sparkline' // hidden for now
    ];
    alertSearch: FormControl;
    snoozeSearch: FormControl;
    defaultDebounceTime = 500; // ms
    alertSearchDebounceTime = this.defaultDebounceTime; // ms
    snoozeSearchDebounceTime = this.defaultDebounceTime; // ms


    snoozesDataSource; // dynamically gets reassigned after new alerts state is subscribed
    snoozeDisplayedColumns: string[] = [
        'select',
        'name',
        'createdBy',
        'scope',
        'reason'
    ];

    // for batch selection
    selection = new SelectionModel<AlertModel>(true, []);

    @Select(AlertsState.getActionResponse) asActionResponse$: Observable<any>;
    @Select(AlertsState.getEditItem) editItem$: Observable<any>;
    @Select(AlertsState.getReadOnly) readOnly$: Observable<boolean>;
    @Select(AlertsState.getError) error$: Observable<any>;
    @Select(AlertsState.getSaveError) saveError$: Observable<any>;

    private _guid: any = false;
    get guid(): string {
        if (!this._guid) {
            this._guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                // tslint:disable-next-line:no-bitwise
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        return this._guid;
    }

    // ALL namespaces are retrieved from somewhere else
    namespaces: any[] = [];
    alertFilterTypes = ['all', 'alerting', 'snoozed', 'disabled'];
    alertsFilterRegexp = new RegExp('.*');
    snoozeFilterRegexp = new RegExp('.*');

    @ViewChild(AlertDetailsComponent) createAlertDialog: AlertDetailsComponent;
    @ViewChild(SnoozeDetailsComponent) snoozeDetailsComp: SnoozeDetailsComponent;

    detailsView = false;
    list = 'alerts';
    detailsMode = 'edit'; // 'edit' or 'view'
    configurationEditData: any = {};

    // confirmDelete Dialog
    confirmDeleteDialog: MatDialogRef<TemplateRef<any>> | null;

    // tslint:disable-next-line:no-inferrable-types
    sparklineMenuOpen: boolean = false;
    sparklineDisplay: any = { label: '', value: '' };
    sparklineDisplayMenuOptions: any[] = [
        {
            label: '1 HR',
            value: '1HR'
        },
        {
            label: '2 HR',
            value: '2HR'
        },
        {
            label: '3 HR',
            value: '3HR'
        },
        {
            label: '6 HR',
            value: '6HR'
        },
        {
            label: '12 HR',
            value: '12HR'
        },
        {
            label: '24 HR',
            value: '24HR'
        }
    ];

    // tslint:disable-next-line:no-inferrable-types
    namespaceDropMenuOpen: boolean = false;
    configLoaded$ = new Subject();
    auraUrl = '';

    error: any = false;

    // portal templates
    @ViewChild('alertspageNavbarTmpl') alertspageNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    alertspageNavbarPortal: TemplatePortal;
    auraDialog: MatDialogRef<AuraDialogComponent> | null;

    // for alert search
    whitelistKeys: string[] = ['name', 'type', 'labels', 'recipients', 'updatedTime', 'updatedBy'];
    nonZeroConditionalKeys: string[] = ['bad', 'warn', 'good', 'unknown', 'missing'];
    booleanConditionalKeys: string[] = ['enabled'];

    // where to navigate on save
    dashboardId = -1;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        private httpService: HttpService,
        private snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private location: Location,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private cdkService: CdkService,
        private interCom: IntercomService,
        private logger: LoggerService,
        private utils: UtilsService,
        private localStorageService: LocalStorageService,
        private dataShare: DataShareService,
        private infoIslandService: InfoIslandService,
        private appConfig: AppConfigService
    ) {
        this.sparklineDisplay = this.sparklineDisplayMenuOptions[0];

        // icons
        const svgIcons = ['email', 'http', 'oc', 'opsgenie', 'slack'];

        // add icons to registry... url has to be trusted
        for (const type of svgIcons) {
            matIconRegistry.addSvgIcon(
                type + '_contact',
                domSanitizer.bypassSecurityTrustResourceUrl('assets/' + type + '-contact.svg')
            );
        }
    }

    ngOnInit() {

        this.auraUrl = this.appConfig.getConfig().auraUI + '/#/aura/newquery';
        this.alertSearch = new FormControl();
        this.snoozeSearch = new FormControl();

        this.subscription.add(this.alertSearch.valueChanges.pipe(
            debounceTime(this.alertSearchDebounceTime)
        ).subscribe(val => {
            this.alertSearchDebounceTime = this.defaultDebounceTime;
            if ( !this.detailsView && val !== null ) {
                this.setRouterUrl();
            }
            val = val ? val : '';
            this.alertsFilterRegexp = new RegExp(val.toLocaleLowerCase().replace(/\s/g, '.*'));
            this.setTableDataSource(this.getFilteredAlerts(this.alertsFilterRegexp, this.alerts));
        }));

        this.subscription.add(this.snoozeSearch.valueChanges.pipe(
            debounceTime(this.snoozeSearchDebounceTime)
        ).subscribe(val => {
            this.snoozeSearchDebounceTime = this.defaultDebounceTime;
            val = val ? val : '';
            this.snoozeFilterRegexp = new RegExp(val.toLocaleLowerCase().replace(/\s/g, '.*'));
            this.setSnoozeTableDataSource(this.getFilteredSnoozes(this.snoozeFilterRegexp, this.snoozes));
        }));

        // setup navbar portal
        this.alertspageNavbarPortal = new TemplatePortal(this.alertspageNavbarTmpl, undefined, {});
        this.setNavbarPortal();

        this.subscription.add(this.loaded$.subscribe(data => {
            this.stateLoaded = JSON.parse(JSON.stringify(data));
        }));

        this.subscription.add(this.resourcesLoaded$.subscribe( rloaded => {
            const dynamicLoaded = this.store.selectSnapshot(AlertsState.getLoaded);
            if ( rloaded && !dynamicLoaded.allNamespaces) {
                this.store.dispatch(
                    new LoadNamespaces({
                        guid: this.guid,
                        responseRequested: true
                    })
                );
            }
        }));

        this.subscription.add(this.selectedNamespace$.subscribe(data => {
            this.selectedNamespace = data;
            if (this.selectedNamespace) {
                this.localStorageService.setLocal('defaultNS', data);
                // this.hasNamespaceWriteAccess = this.userNamespaces.find(d => d.name === this.selectedNamespace ) ? true : false;
                this.stateLoaded.alerts = false;
                this.stateLoaded.snooze = false;

                this.loadAlertsSnooze(this.list === 'alerts' ? ['alerts'] : ['alerts', 'snooze']);
            } else {
                this.hasNamespaceWriteAccess = false;
                this.alerts = [];
            }
        }));

        this.subscription.add(this.allNamespaces$.subscribe(data => {
            this.allNamespaces = data;
            // this.logger.log('NAMESPACES', this.allNamespaces);
            this.allNamespacesDS = new MatTableDataSource(this.allNamespaces);
            // this.logger.log('NAMESPACES_DS', this.allNamespacesDS);
            this.allNamespacesDS.filterPredicate = (data: any, filter: string) => {
                return data.name.toLowerCase().includes(filter.toLowerCase());
            };
        }));

        this.subscription.add(this.userNamespaces$.subscribe(data => {
            const dataCopy = this.utils.deepClone(data);
            dataCopy.sort((a: any, b: any) => {
                return this.utils.sortAlphaNum(a.name, b.name);
            });
            this.userNamespaces = dataCopy;

            if (this.stateLoaded.userNamespaces) {
                this.configLoaded$.next(true);
                this.configLoaded$.complete();
            }
        }));

        this.subscription.add(this.alerts$.pipe(skip(1)).subscribe(alerts => {
            this.stateLoaded.alerts = true;
            this.alerts = JSON.parse(JSON.stringify(alerts));
            this.setAlertListMeta();
            this.retriggerAlertSearch();
        }));

        this.subscription.add(this.snoozes$.pipe(skip(1)).subscribe(snoozes => {
            this.stateLoaded.snooze = true;
            this.snoozes = JSON.parse(JSON.stringify(snoozes));
            this.snoozes = this.snoozes.map((d: any) => {
                if ( d.filter && Object.keys(d.filter).length ) {
                    d.rawFilters = this.utils.getFiltersTsdbToLocal(d.filter);
                } else {
                    d.rawFilters = [];
                }
                return d;
            });
            this.retriggerSnoozeSearch();
        }));

        this.subscription.add(this.status$.subscribe(status => {
            let message = '';
            switch (status) {
                case 'add-success':
                case 'update-success':
                    message = 'Alert has been ' + (status === 'add-success' ? 'created' : 'updated') + '.';
                    this.detailsView = false;
                    // this.router.navigate(['a']);
                    // this.editMode = false;
                    break;
                case 'enable-success':
                    message = 'Alert has been enabled.';
                    break;
                case 'disable-success':
                    message = 'Alert has been disabled.';
                    break;
                case 'delete-success':
                    message = 'Alert has been deleted.';
                    break;
                case 'snooze-add-success':
                case 'snooze-update-success':
                    message = 'Snooze has been ' + (status === 'snooze-add-success' ? 'created' : 'updated') + '.';
                    this.detailsView = false;
                    break;
                case 'snooze-delete-success':
                    message = 'Snooze has been deleted.';
                    break;
            }
            if (message !== '') {
                this.snackBar.open(message, '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    duration: 5000,
                    panelClass: 'info'
                });
            }
            this.infoIslandService.closeIsland();
            this.retriggerAlertSearch();
            this.retriggerSnoozeSearch();
        }));

        this.subscription.add(this.editItem$.pipe(filter(data => Object.keys(data).length !== 0), distinctUntilChanged())
            .subscribe(data => {
                let _data = JSON.parse(JSON.stringify(data));

                // alert meta is needed when snooze add/edit
                // if ( this.list === 'snooze' && !this.stateLoaded.alerts ) {
                // this.store.dispatch(new LoadAlerts({namespace: _data.namespace}));
                // }
                // set the namespace if the user comes directly from edit url
                if (!this.selectedNamespace) {
                    this.setNamespace(_data.namespace, null);
                }
                if (_data.id === '_new_') {
                    if (this.list === 'alerts') {
                        _data = {
                            type: 'simple',
                            name: 'Untitled Alert'
                        };
                    }
                    _data.namespace = data.namespace;
                }
                this.openEditMode(_data);
            }));

        this.subscription.add(this.readOnly$.subscribe(readOnly => {
            this.hasNamespaceWriteAccess = !readOnly;
            const routeSnapshot = this.activatedRoute.snapshot.url;
            let modeCheck;
            // this.logger.log('READ ONLY?', {readOnly, routeUrl: this.router.url, activatedRoute: this.activatedRoute });

            if (routeSnapshot.length > 1 && this.utils.checkIfNumeric(routeSnapshot[0].path) && routeSnapshot[1].path !== '_new_') {

                // check if there is a mode in the url
                // purely aesthetic. If url has 'edit', but its readonly, it will still be readonly
                if (readOnly) {
                    modeCheck = routeSnapshot[routeSnapshot.length - 1];
                    // console.log('modeCheck', modeCheck.path);

                    // there is no mode in the url
                    if (modeCheck.path.toLowerCase() !== 'view' && modeCheck.path.toLowerCase() !== 'edit') {
                        // force view url path
                        const parts = routeSnapshot.map(item => item.path);
                        parts.unshift('/a');
                        parts.push('view');
                        this.location.go(parts.join('/'));
                    } else {
                        // mode is in url, so check if it matches edit, and forcibly change it to view
                        const parts = routeSnapshot.map(item => item.path);
                        parts.pop();
                        parts.unshift('/a');
                        parts.push('view');
                        this.location.go(parts.join('/'));
                    }

                    this.detailsMode = 'view';

                    // it's not readonly, check if mode in url. If not, add 'edit'
                    // if it has 'view' in the url, it will still pass
                } else if (!readOnly) {
                    modeCheck = routeSnapshot[routeSnapshot.length - 1];
                    // there is no mode in the url
                    if (!['view', 'edit', 'clone'].includes(modeCheck.path.toLowerCase())) {
                        // enforce mode in url path, defaulting to edit
                        const parts = routeSnapshot.map(item => item.path);
                        parts.unshift('/a');
                        parts.push('edit');
                        this.location.go(parts.join('/'));
                        this.detailsMode = 'edit';
                    } else {
                        this.detailsMode = modeCheck.path.toLowerCase();
                    }
                }
            }

        }));

        this.subscription.add(this.error$.subscribe(error => {

            if (Object.keys(error).length > 0) {
                this.error = error;
            } else {
                this.error = false;
            }
            // maybe intercom error for messaging bar?
        }));

        this.subscription.add(this.alertDetailError$.subscribe(error => {
            if (error && ( error.error || error.message) ) {
                // set system message bar
                this.interCom.requestSend({
                    action: 'systemMessage',
                    payload: {
                        type: 'error',
                        message: error.error || error.message
                    }
                });
            }
        }));

        this.subscription.add(this.saveError$.subscribe(error => {

            if (!error) {
                if (this.dashboardId > 0) {
                    this.location.go('d/' + this.dashboardId);
                    this.router.navigate(['d', this.dashboardId]);
                } else {
                    this.location.go('a/' + this.selectedNamespace);
                }
            }

            if (this.list === 'alerts' && this.createAlertDialog) {
                this.createAlertDialog.data.error = error;
            }
            if (this.list === 'snooze' && this.snoozeDetailsComp) {
                this.snoozeDetailsComp.data.error = error;
            }

            if ( error && ( error.error || error.message ) ) {
                // set system message bar
                this.interCom.requestSend({
                    action: 'systemMessage',
                    payload: {
                        type: 'error',
                        message: 'Saving Error: ' + ( error.error || error.message )
                    }
                });
            }
        }));


        // handle route for alerts
        this.subscription.add(this.activatedRoute.url.pipe(delayWhen(() => this.configLoaded$)).subscribe(url => {

            // this.logger.log('ROUTE CHANGE', { url });
            const queryParams = this.activatedRoute.snapshot.queryParams;
            this.clearSystemMessage();
            
            let defaultNS = this.getDefaultNamespace();
            if (this.dataShare.getData() && this.dataShare.getMessage() === 'WidgetToAlert' ) {
                this.createAlertFromWidget(this.dataShare.getData());
            } else if (url.length >= 1 && url[0].path === 'snooze') {
                this.list = 'snooze';
                if (url.length >= 2 && this.utils.checkIfNumeric(url[1].path)) {
                    this.store.dispatch(new GetSnoozeDetailsById(parseInt(url[1].path, 10)));
                } else if (url.length === 3 && url[2].path === '_new_') {
                    // new snooze
                    this.setNamespace(url[1].path);
                    this.store.dispatch(new CheckWriteAccess({ namespace: url[1].path, id: '_new_' }));
                } else {
                    this.detailsView = false;
                    // tslint:disable-next-line:max-line-length
                    const ns = url[1] && url[1].path ? url[1].path : defaultNS;
                    this.setNamespace(ns);
                    this.infoIslandService.closeIsland();
                }
            } else if (url.length === 1 && !this.utils.checkIfNumeric(url[0].path)) {
                // if only one item, and its not numeric, probably a namespace
                this.setNamespace(url[0].path, queryParams.q);
            } else if (url.length === 2 && url[1].path === '_new_') {
                // new alert
                this.setNamespace(url[0].path);
                this.store.dispatch(new CheckWriteAccess({ namespace: url[0].path, id: '_new_' }));
            } else if (
                (url.length === 2 &&
                    this.utils.checkIfNumeric(url[0].path) &&
                    (['view', 'edit', 'clone'].includes(url[1].path.toLocaleLowerCase()))) ||
                (url.length === 1 && this.utils.checkIfNumeric(url[0].path))
            ) {
                // abreviated alert url... probably came from alert email
                this.store.dispatch(new GetAlertDetailsById(parseInt(url[0].path, 10)));
            } else if (url.length > 2) {
                // load alert the alert
                this.store.dispatch(new GetAlertDetailsById(parseInt(url[0].path, 10)));
            } else if (url.length === 0 && this.detailsView && this.selectedNamespace.length > 0) {
                this.location.go('/a/' + (this.list === 'snooze' ? 'snooze/' : '') + this.selectedNamespace);
                this.detailsView = false;
                this.infoIslandService.closeIsland();
                this.setNavbarPortal();

            } else if ( defaultNS ) {
                // set a namespace... probably should update url?
                this.setNamespace(defaultNS);

                if (this.detailsView) {
                    this.detailsView = false;
                    this.infoIslandService.closeIsland;
                }
            }
        }));

        // check the edit access. skips the first time with default value
        this.subscription.add(this.alertDetail$.pipe(skip(1)).subscribe(data => {
            const routeSnapshot = this.activatedRoute.snapshot.url;
            let parts;
            const namespace = data.namespace ? data.namespace : this.getDefaultNamespace();
            // url path has 2 parts, (i.e. /a/1234/view)
            if (
                routeSnapshot.length === 2 &&
                this.utils.checkIfNumeric(routeSnapshot[0].path) &&
                (['view', 'edit', 'clone'].includes(routeSnapshot[1].path.toLowerCase()))
            ) {
                // fix the URL if it is abbreviated route from alert email
                parts = data.id ? ['/a', data.id, data.namespace, data.slug, routeSnapshot[1].path.toLowerCase()] : ['/a', namespace ];
                this.location.go(parts.join('/'));
                // set the namespace, since we probably didn't get it from the url
                this.setNamespace( namespace, null);

                // url path has 1 parts, (i.e. /a/1234)
            } else if (
                routeSnapshot.length === 1 &&
                this.utils.checkIfNumeric(routeSnapshot[0].path)
            ) {
                // fix the URL if it is abbreviated route from alert email
                parts = data.id ? ['/a', data.id, data.namespace, data.slug, 'view'] : ['/a', namespace ];
                this.location.go(parts.join('/'));
                // set the namespace, since we probably didn't get it from the url
                this.setNamespace(namespace, null);
            } else if ( !data.id ) {
                this.location.go('/a/' + namespace);
                this.setNamespace(namespace, null);
            }

            if ( data.id ) {
                this.store.dispatch(new CheckWriteAccess(data));
            }

        }));

        this.subscription.add(this.snoozeDetail$.pipe(skip(1)).subscribe(data => {
            this.store.dispatch(new CheckWriteAccess(data));
        }));

    }

    getDefaultNamespace() {
        let defaultNS = this.localStorageService.getLocal('defaultNS');
        defaultNS =  defaultNS && defaultNS !== null ? defaultNS : this.userNamespaces.length ? this.userNamespaces[0].name : this.allNamespaces[0].name;
        return defaultNS;
    }

    getFilteredAlerts(regexFilter: RegExp, alerts: AlertModel[]) {
        const filteredAlerts = [];
        for (const data of alerts) {
            const d: any = JSON.parse(JSON.stringify(data));
            d.updatedTime = this.formatAlertTimeModified(d);
            let sanitizedDataStr = '';
            for (let i = 0; i < Object.keys(d).length; i++) {
                const key = Object.keys(d)[i];
                if (this.whitelistKeys.includes(key)) {
                    sanitizedDataStr += ' ' + JSON.stringify(d[key]);
                } else if (this.nonZeroConditionalKeys.includes(key)) {
                    if (d[key] > 0) {
                        sanitizedDataStr += ' ' + key + ' ' + d[key];
                    }
                } else if (this.booleanConditionalKeys.includes(key)) {
                    if (key === 'enabled' && d[key]) {
                        sanitizedDataStr += ' enabled';
                    } else {
                        sanitizedDataStr += ' disabled';
                    }
                }
            }

            if (regexFilter.test(sanitizedDataStr.toLowerCase())) {
                filteredAlerts.push(data);
            }
        }
        return filteredAlerts;
    }

    getFilteredSnoozes(regexFilter: RegExp, snoozes: AlertModel[]) {
        const filteredSnoozes = [];
        for (const data of snoozes) {
            const d: any = JSON.parse(JSON.stringify(data));
            d.updatedTime = this.formatAlertTimeModified(d);
            let sanitizedDataStr = '';
            for (let i = 0; i < Object.keys(d).length; i++) {
                const key = Object.keys(d)[i];
                sanitizedDataStr += ' ' + JSON.stringify(d[key]);
                if (key === 'alertIds') {
                    sanitizedDataStr += ' ' + JSON.stringify(this.getAlertNamesByIds(d[key]));
                }
            }
            if (regexFilter.test(sanitizedDataStr.toLowerCase())) {
                filteredSnoozes.push(data);
            }
        }
        return filteredSnoozes;
    }

    clearSystemMessage() {
        this.interCom.requestSend({
            action: 'clearSystemMessage',
            payload: {}
        });
    }
    setNavbarPortal() {
        this.clearSystemMessage();
        this.cdkService.setNavbarPortal(this.alertspageNavbarPortal);
    }

    switchType(mode) {
        this.list = mode;
        this.loadAlertsSnooze([mode]);
        this.setRouterUrl();
        if (mode === 'alerts' && this.alertSearch.value !== '') {
            this.retriggerAlertSearch();
        } else if (mode === 'snooze' && this.snoozeSearch.value !== '') {
            this.retriggerSnoozeSearch();
        }
    }

    setNamespace(namespace, search = '') {
        if (this.selectedNamespace !== namespace) {
            this.store.dispatch(new SetNamespace(namespace));
            if ( this.alertSearch ) {
                this.alertSearch.setValue(search);
            }
        }

        if (this.snoozeSearch) {
            this.snoozeSearch.setValue('');
        }
    }

    handleNamespaceChange(namespace) {
        this.setNamespace(namespace);
        this.setRouterUrl();
    }

    loadAlertsSnooze(list) {
        if (list.includes('alerts')) {
            if (this.alertsDataSource) {
                this.alertsDataSource.data = [];
            }
            this.store.dispatch(new LoadAlerts({ namespace: this.selectedNamespace }));
        }
        if (list.includes('snooze')) {
            if (this.snoozesDataSource) {
                this.snoozesDataSource.data = [];
            }
            this.store.dispatch(new LoadSnoozes({ namespace: this.selectedNamespace }));
        }
    }

    setRouterUrl() {
        const prefix = this.list === 'snooze' ? 'a/snooze/' : 'a/';
        const search = this.alertSearch.value;
        const qs = this.list === 'alerts' && search ? '?q=' +  decodeURIComponent(search) : '';
        this.location.go(prefix + this.selectedNamespace + qs);
    }

    /** privates */
    private setTableDataSource(alerts: AlertModel[]) {
        this.alertsDataSource = new MatTableDataSource<AlertModel>(alerts);
        this.alertsDataSource.paginator = this.paginator;
    }

    private setSnoozeTableDataSource(snoozes: AlertModel[]) {
        this.snoozesDataSource = new MatTableDataSource<any>(snoozes);
    }

    setAlertListMeta() {
        const alertOptions = {};
        for (let i = 0; i < this.alerts.length; i++) {
            alertOptions[this.alerts[i].id] = { label: this.alerts[i].name, id: this.alerts[i].id, type: 'alert' };
            for (let j = 0; this.alerts[i].labels && j < this.alerts[i].labels.length; j++) {
                const label = this.alerts[i].labels[j];
                alertOptions[label] = { label: label, type: 'label' };
            }
        }
        this.alertListMeta = Object.values(alertOptions);
    }

    getAlertNamesByIds(ids) {
        let names = [];
        names = this.alerts.filter(d => ids.includes(d.id)).map(d => d.name);
        return names.length ? names : ids;
    }

    applyAllNamespaceDataFilter(dataFilter: string, event: any) {
        this.allNamespacesDS.filter = dataFilter;
        event.stopPropagation();
    }

    /* Utilities */
    ensureNamespaceMenuWidth() {
        const element = this.namespaceDropMenuTrigger.nativeElement;
        this.namespaceDropMenuTriggerWidth = `${element.clientWidth}px`;
    }

    ensureMenuWidth(element: any) {
        element = <ElementRef>element._elementRef;
        return `${element.nativeElement.clientWidth}px`;
    }

    /** batch selection tools */

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.alertsDataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.alertsDataSource.data.forEach(row => this.selection.select(row));
    }

    /** bulk actions */

    // NOTE: adding stubs for now. Noticed the UI has buttons for this, but there were no functions assigned

    bulkDisableAlerts() {
        // TODO: get list of selected items, then disable (see this.toggleAlert)
    }

    bulkDeleteAlerts() {
        // TODO: get list of selected items, then do delete confirmation, then delete (see this.deleteItem)
    }

    /** actions */

    toggleAlert(alertObj: any) {
        this.store.dispatch(new ToggleAlerts(this.selectedNamespace, { data: [{ id: alertObj.id, enabled: !alertObj.enabled }] }));
    }

    editAlert(element: any) {
        // console.log('****** WRITE ACCESS ******', this.hasNamespaceWriteAccess);
        // check if they have write access
        const mode = (this.hasNamespaceWriteAccess) ? 'edit' : 'view';
        this.detailsMode = mode;

        this.location.go('a/' + element.id + '/' + element.namespace + '/' + element.slug + '/' + mode);
        this.store.dispatch(new GetAlertDetailsById(element.id));
    }

    cloneAlert(element: any) {
        const mode = (this.hasNamespaceWriteAccess) ? 'clone' : 'view';
        this.detailsMode = mode;

        this.location.go('a/' + element.id + '/' + element.namespace + '/' + element.slug + '/' + mode);
        this.store.dispatch(new GetAlertDetailsById(element.id));
    }

    viewAlert(element: any) {
        this.detailsMode = 'view';
        this.location.go('a/' + element.id + '/' + element.namespace + '/' + element.slug + '/view');
        this.store.dispatch(new GetAlertDetailsById(element.id));
    }

    createAlert(type: string) {
        this.detailsMode = 'edit';
        const data = {
            type: type,
            namespace: this.selectedNamespace,
            name: 'Untitled Alert'
        };
        this.openEditMode(data);
        this.location.go('a/' + this.selectedNamespace + '/_new_');
        this.clearSystemMessage();
    }

    createAlertFromWidget(payload) {
        const type = this.getAlertTypeFromWidget(payload.widget);
        this.selectedNamespace = payload.namespace;
        this.detailsMode = 'edit';
        const data = {
            type: type,
            namespace: this.selectedNamespace,
            name: 'Alert from widget ' + payload.widget.settings.title,
            queries: {},
            notification: {
                body: 'Created from dashboard: ' + 'https://yamas.ouroath.com/d/' + payload.dashboardId
            },
            createdFrom: {
                dashboardId: payload.dashboardId,
                widgetId: payload.widget.id,
            }
        };

        if (type === 'simple') {
            const convertedQuery = this.convertQueryFromDashboardToAlert(payload.widget.queries, payload.tplVariables);
            data.queries = {
                raw: convertedQuery
            };
        }
        if (type === 'event') {
            const convertedQuery = this.convertEventQueryFromDashboardToAlert(payload.widget.eventQueries);
            data.queries = {
                eventdb: convertedQuery
            };
        }
        this.openEditMode(data);
        this.location.go('a/' + this.selectedNamespace + '/_new_');
    }

    getAlertTypeFromWidget(widget) {
        const widgetType: string = widget.settings.component_type;
        if (widgetType.toLowerCase() === 'BarchartWidgetComponent'.toLowerCase() ||
            widgetType.toLowerCase() === 'LinechartWidgetComponent'.toLowerCase() ||
            widgetType.toLowerCase() === 'HeatmapWidgetComponent'.toLowerCase() ||
            widgetType.toLowerCase() === 'BignumberWidgetComponent'.toLowerCase() ||
            widgetType.toLowerCase() === 'DonutWidgetComponent'.toLowerCase() ||
            widgetType.toLowerCase() === 'TopnWidgetComponent'.toLowerCase() ) {
                return 'simple';
        } else if (widgetType.toLowerCase() === 'EventsWidgetComponent'.toLowerCase()) {
            return 'event';
        } else {
            return '';
        } // 'healthcheck'
    }

    convertQueryFromDashboardToAlert(queries, tplVariables) {
        const convertQueries = this.utils.deepClone(queries);

        // loop through original queries since we are modifying the arrays
        for (const q of queries) {
            for (const f of q.filters) {
                if (f.customFilter) {
                    for (const customFilter of f.customFilter) {
                        const filterValue = this.getTplValueForAlias(tplVariables, customFilter);
                        this.moveCustomFilterToFilter(convertQueries, q.id, f.tagk, filterValue, customFilter);
                    }
                }
            }
        }

        this.removeEmptyFilters(convertQueries);

        // sanitize visual settings
        for (const q of convertQueries) {
            q.settings = this.generateDefaultVisibilty();
            for (const m of q.metrics) {
                m.settings = this.generateDefaultVisibilty();
            }
        }

        return convertQueries;
    }

    generateDefaultVisibilty() {
        return { visual: { visible: true } };
    }

    convertEventQueryFromDashboardToAlert(queries: any) {
        const eventQuery = [];
        for (const query of queries) {
            const q: any = {};
            q.namespace = query.namespace;
            q.filter = query.search;
            eventQuery.push(q);
        }
        return eventQuery;
    }

    getTplValueForAlias(tplVariables, alias: string) {
        if (tplVariables.tvars) {
            for (const tvar of tplVariables.tvars) {
                if ('[' + tvar.alias + ']' === alias) {
                    return tvar.filter;
                }
            }
        }
        return '';
    }

    moveCustomFilterToFilter(queries, qId, tagKey, tagValue, customFilter) {
        for (const q of queries) {
            if (qId === q.id) {
                for (const f of q.filters) {
                    if (f.tagk === tagKey) {
                        if (tagValue) { // add to filters
                            f.filter.push(tagValue);
                        }
                        const index = f.customFilter.indexOf(customFilter);
                        if (index > -1) { // remove from customFilters
                            f.customFilter.splice(index, 1);
                        }
                        return;
                    }
                }
            }
        }
    }

    removeEmptyFilters(queries) {
        for (const q of queries) {
            const filtersToRemove = [];
            let index = 0;
            for (const f of q.filters) { // find indices to remove
                if (f.customFilter && f.customFilter.length === 0 && f.filter && f.filter.length === 0) {
                   filtersToRemove.push(index);
                }
                index++;
            }
            // remove indices
            for (let i = filtersToRemove.length - 1; i >= 0; i--) {
                q.filters.splice(filtersToRemove[i], 1);
            }
        }
    }

    openEditMode(data: any) {
        if (this.detailsMode === 'clone') {
            data.id = '';
            const nowInMillis = Date.now();
            data.name = 'Clone of ' + data.name + ' on ' + this.utils.buildDisplayTime(nowInMillis, 0, nowInMillis, true);
        }
        if ( data.id && !data.enabled && this.list === 'alerts') {
            this.interCom.requestSend({
                action: 'systemMessage',
                payload: {
                    type: 'warning',
                    message: 'This alert is disabled'
                }
            });
        }
        this.configurationEditData = data;
        this.detailsView = true;
    }

    createSnooze() {
        if (!this.stateLoaded.alerts) {
            this.store.dispatch(new LoadAlerts({ namespace: this.selectedNamespace }));
        }
        const data = {
            id: '_new_',
            namespace: this.selectedNamespace
        };
        this.configurationEditData = data;
        this.detailsView = true;
        this.location.go('a/snooze/' + this.selectedNamespace + '/_new_');
    }

    createAlertSnooze(alertId: number) {
        if (!this.stateLoaded.alerts) {
            this.store.dispatch(new LoadAlerts({ namespace: this.selectedNamespace }));
        }
        const data = {
            id: '_new_',
            namespace: this.selectedNamespace,
            alertIds: [alertId],
            cancelToAlerts: true
        };
        this.configurationEditData = data;
        this.detailsView = true;
        this.switchType('snooze');
        this.location.go('a/snooze/' + this.selectedNamespace + '/_new_');
        this.clearSystemMessage();
    }

    editSnooze(element: any) {
        // console.log('****** WRITE ACCESS ******', this.hasNamespaceWriteAccess);
        // check if they have write access
        const mode = (this.hasNamespaceWriteAccess) ? 'edit' : 'view';
        this.detailsMode = mode;

        this.location.go('a/snooze/' + element.id + '/' + element.namespace + '/' + mode);
        this.store.dispatch(new GetSnoozeDetailsById(element.id));
    }

    deleteItem(obj: any) {
        this.confirmDeleteDialog = this.dialog.open(this.confirmDeleteDialogRef, { data: obj });
        this.confirmDeleteDialog.afterClosed().subscribe(event => {
            if (event.deleted) {
                if (this.list === 'alerts') {
                    this.store.dispatch(new DeleteAlerts(this.selectedNamespace, { data: [obj.id] }));
                } else {
                    this.store.dispatch(new DeleteSnoozes(this.selectedNamespace, { data: [obj.id] }));
                }
            }
        });
    }

    confirmDelete(alertObj: any) {
        this.confirmDeleteDialog.close({ deleted: true });
    }

    configurationEdit_change(message: any) {
        switch (message.action) {
            case 'SaveAlert':
                if (message.dashboard && message.dashboard > 0) {
                    this.dashboardId = message.dashboard;
                }
                // lets save this thing
                this.store.dispatch(new SaveAlerts(message.namespace, message.payload));
                this.router.navigateByUrl('a/' + this.selectedNamespace);
                break;
            case 'SaveSnooze':
                this.store.dispatch(new SaveSnoozes(message.namespace, message.payload));
                this.location.go('a/snooze/' + message.namespace);
                break;
            case 'CancelSnoozeEdit':
                this.detailsView = false;
                this.location.go('a/snooze/' + this.selectedNamespace);
                break;
           case 'CancelToAlerts':
                this.switchType('alerts');
                this.detailsView = false;
                this.location.go('a/' + this.selectedNamespace);
                break;
            default:
                // this is when dialog is closed to return to summary page
                this.detailsView = false;
                this.router.navigateByUrl('a/' + this.selectedNamespace);
                break;
        }
        if (message.action === 'CancelEdit' || message.action === 'SaveAlert') {
            this.setNavbarPortal();
        }
        this.infoIslandService.closeIsland();
        this.retriggerAlertSearch();
        this.retriggerSnoozeSearch();
    }

    retriggerAlertSearch() {
        const val = this.alertSearch.value;
        if (this.alertSearch) {
            this.alertSearchDebounceTime = 0;
            this.alertSearch.setValue(val);
        }
    }

    retriggerSnoozeSearch() {
        const val = this.snoozeSearch.value;
        if (this.snoozeSearch) {
            this.snoozeSearchDebounceTime = 0;
            this.snoozeSearch.setValue(val);
        }
    }

    selectSparklineDisplayOption(option: any) {
        this.sparklineDisplay = option;
    }

    setNamespaceMenuOpened(opened: boolean) {
        this.namespaceDropMenuOpen = opened;
    }

    setSparklineMenuOpened(opened: boolean) {
        this.sparklineMenuOpen = opened;
    }

    formatAlertTimeModified(element: any) {
        const time = moment(element.updatedTime);
        return time.format('YYYY-MM-DD HH:mm');
    }

    formatTime(time: any) {
        return moment(time).format('YYYY-MM-DD  hh:mm a');
    }

    trimRecipientName(name) {
        return name.replace(/^\#/, '');
    }

    getRecipientKeys(element: any) {
        // extract keys
        const objKeys = element.recipients ? Object.keys(element.recipients) : [];
        // need to filter out junk entries
        const validKeys = objKeys.filter(val => RecipientType[val] !== undefined);
        // return values
        return validKeys;
    }

    typeToDisplayName(type: string) {
        if (type === RecipientType.opsgenie) {
            return 'OpsGenie';
        } else if (type === RecipientType.slack) {
            return 'Slack';
        } else if (type === RecipientType.http) {
            return 'HTTP';
        } else if (type === RecipientType.oc) {
            return 'OC';
        } else if (type === RecipientType.email) {
            return 'Email';
        }
        return '';
    }

    alertTypeToDisplayName(type: string) {
        type = type.toLowerCase();
        if (type === 'simple') {
            return 'Metric';
        } else if (type === 'healthcheck') {
            return 'Health Check';
        } else if (type === 'event') {
            return 'Event';
        } else {
            return 'Unknown';
        }
    }

    contactMenuEsc($event: any) {
        // console.log('contactMenuEsc', $event);
    }

    showAuraDialog(alertId, filters) {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        // dialogConf.width = '50%';
        dialogConf.minWidth = '1200px';
        dialogConf.height = '500px';
        dialogConf.backdropClass = 'aura-dialog-backdrop';
        dialogConf.panelClass = 'aura-dialog-panel';
        let url = this.auraUrl + '?namespace=' + this.selectedNamespace + '&tags=_alert_id:' + alertId + '&type=1';
        if (filters.status !== undefined) {
            url += '&status=' + filters.status;
        }
        if (filters.snoozed !== undefined) {
            url += '&snoozed=1';
        }
        dialogConf.data = { src: url };
        if (!this.auraDialog) {
            this.auraDialog = this.dialog.open(AuraDialogComponent, dialogConf);
            this.auraDialog.afterClosed().subscribe(() => {
                this.auraDialog = undefined;
            });
        }
    }

    ngAfterViewChecked() {
        if (this.location.path() === '/a' || this.location.path() === '/a/' + this.selectedNamespace) {
            this.utils.setTabTitle(this.selectedNamespace + ' Alerts');
        }
        // so matTable paginator won't out of check of page # changes
        this.cdRef.detectChanges();
    }

    ngOnDestroy() {
        this.store.dispatch(new ClearNamespace());
        this.subscription.unsubscribe();
        this.utils.setTabTitle();
    }

}
