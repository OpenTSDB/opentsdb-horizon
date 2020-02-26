import { Component, OnInit, OnDestroy, HostBinding, ViewChild, TemplateRef, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatePortal } from '@angular/cdk/portal';

import { CdkService } from '../../../core/services/cdk.service';
import { QueryService } from '../../../core/services/query.service';
import { DashboardService } from '../../services/dashboard.service';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';
import { Store, Select } from '@ngxs/store';
import { AuthState } from '../../../shared/state/auth.state';
import { skip } from 'rxjs/operators';
import { Observable, Subscription, of, Subject } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';
import { WidgetService } from '../../../core/services/widget.service';
import { DateUtilsService } from '../../../core/services/dateutils.service';
import { DBState, LoadDashboard, SaveDashboard, DeleteDashboardSuccess, DeleteDashboardFail, SetDashboardStatus } from '../../state/dashboard.state';
import { LoadUserNamespaces, LoadUserFolderData, UserSettingsState } from '../../state/user.settings.state';
import { WidgetsState,
    UpdateWidgets, UpdateGridPos, UpdateWidget,
    DeleteWidget, WidgetModel } from '../../state/widgets.state';
import {
    WidgetsRawdataState,
    GetQueryDataByGroup,
    SetQueryDataByGroup,
    ClearQueryData,
    ClearWidgetsData
} from '../../state/widgets-data.state';
import { ClientSizeState, UpdateGridsterUnitSize } from '../../state/clientsize.state';
import {
    DBSettingsState,
    UpdateMode,
    UpdateDashboardTime,
    UpdateDashboardAutoRefresh,
    LoadDashboardSettings,
    UpdateDashboardTimeZone,
    UpdateDashboardTitle,
    UpdateVariables,
    UpdateMeta,
    UpdateDashboardTimeOnZoom,
    UpdateDashboardTimeOnZoomOut
} from '../../state/settings.state';
import { AppShellState, NavigatorState, DbfsLoadTopFolder, DbfsLoadSubfolder, DbfsDeleteDashboard, DbfsResourcesState } from '../../../app-shell/state';
import { MatMenuTrigger, MenuPositionX, MatSnackBar } from '@angular/material';
import { DashboardDeleteDialogComponent } from '../../components/dashboard-delete-dialog/dashboard-delete-dialog.component';
import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition } from '@angular/material';

import { LoggerService } from '../../../core/services/logger.service';
import { HttpService } from '../../../core/http/http.service';
import { ICommand, CmdManager } from '../../../core/services/CmdManager';
import { DbfsUtilsService } from '../../../app-shell/services/dbfs-utils.service';
import { EventsState, GetEvents } from '../../../dashboard/state/events.state';
import { URLOverrideService } from '../../services/urlOverride.service';
import * as deepEqual from 'fast-deep-equal';
import { TemplateVariablePanelComponent } from '../../components/template-variable-panel/template-variable-panel.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-dashboard') private hostClass = true;

    @Select(AuthState.getAuth) auth$: Observable<string>;
    @Select(DBSettingsState.getDashboardSettings) dbSettings$: Observable<any>;
    @Select(UserSettingsState.GetUserNamespaces) userNamespaces$: Observable<string[]>;
    @Select(UserSettingsState.GetPersonalFolders) userPersonalFolders$: Observable<any[]>;
    @Select(UserSettingsState.GetNamespaceFolders) userNamespaceFolders$: Observable<any[]>;
    @Select(DBState.getDashboardFriendlyPath) dbPath$: Observable<string>;
    @Select(DBState.getLoadedDB) loadedRawDB$: Observable<any>;
    @Select(DBState.getDashboardStatus) dbStatus$: Observable<string>;
    @Select(DBState.getDashboardError) dbError$: Observable<any>;
    @Select(DBSettingsState.getDashboardTime) dbTime$: Observable<any>;
    @Select(DBSettingsState.getDashboardAutoRefresh) refresh$: Observable<any>;
    @Select(DBSettingsState.getMeta) meta$: Observable<any>;
    @Select(DBSettingsState.getTplVariables) tplVariables$: Observable<any>;
    @Select(WidgetsState.getWigets) widgets$: Observable<WidgetModel[]>;
    @Select(WidgetsState.lastUpdated) lastUpdated$: Observable<any>;
    @Select(WidgetsRawdataState.getLastModifiedWidgetRawdataByGroup) widgetGroupRawData$: Observable<any>;
    @Select(AppShellState.getCurrentMediaQuery) mediaQuery$: Observable<string>;
    @Select(DBSettingsState.GetDashboardMode) dashboardMode$: Observable<string>;
    @Select(NavigatorState.getDrawerOpen) drawerOpen$: Observable<any>;
    @Select(EventsState.GetEvents) events$: Observable<any>;

    @ViewChild('tplVariablePanel') tplVariablePanel : TemplateVariablePanelComponent;
    // available widgets menu trigger
    @ViewChild('availableWidgetsMenuTrigger', { read: MatMenuTrigger }) availableWidgetsMenuTrigger: MatMenuTrigger;

    get availableWidgetsMenuIsOpen(): boolean {
        if (this.availableWidgetsMenuTrigger) {
            return this.availableWidgetsMenuTrigger.menuOpen;
        }
        return false;
    }

    // portal templates
    @ViewChild('dashboardNavbarTmpl') dashboardNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    dashboardNavbarPortal: TemplatePortal;

    menuXAlignValue: MenuPositionX = 'before';

    // Available Widget Types
    /**
     *  NOTE: at some point we might want to think about adding this to some config setup
     * */
    availableWidgetTypes: Array<object> = [
        {
            label: 'Bar Graph',
            type: 'BarchartWidgetComponent',
            iconClass: 'widget-icon-bar-graph'
        },
        /*{
            label: 'Area Graph',
            type: 'WidgetAreaGraphComponent',
            iconClass: 'widget-icon-area-graph'
        },*/
        {
            label: 'Line Chart',
            type: 'LinechartWidgetComponent',
            iconClass: 'widget-icon-line-chart'
        },
        {
            label: 'Heatmap',
            type: 'HeatmapWidgetComponent',
            iconClass: 'widget-icon-heatmap'
        },
        {
            label: 'Big Number',
            type: 'BignumberWidgetComponent',
            iconClass: 'widget-icon-big-number'
        },
        {
            label: 'Donut Chart',
            type: 'DonutWidgetComponent',
            iconClass: 'widget-icon-donut-chart'
        },
        {
            label: 'Top N',
            type: 'TopnWidgetComponent',
            iconClass: 'widget-icon-topn-chart'
        },
        {
            label: 'Notes',
            type: 'MarkdownWidgetComponent',
            iconClass: 'widget-icon-notes'
        },
        {
            label: 'Events',
            type: 'EventsWidgetComponent',
            iconClass: 'widget-icon-events'
        },

        /*,
        {
            label: 'Statuses',
            type: 'WidgetStatusComponent',
            iconClass: 'widget-icon-statuses'
        }*/
    ];
    // other variables
    dbSettings: any;
    dbTime: any = {};
    isDBZoomed = false;
    meta: any = {};
    // variables: any;
    dbTags: any;
    dbid: string; // passing dashboard id
    wid: string; // passing widget id
    rerender: any = { 'reload': false }; // -> make gridster re-render correctly
    wData: any = {};
    widgets: any[] = [];
    tplVariables: any = { editTplVariables: {}, viewTplVariables: {}};
    variablePanelMode: any = { view : true };
    userNamespaces: any[] = [];
    viewEditMode = false;
    newWidget: any; // setup new widget based on type from top bar
    mWidget: any; // change the widget type
    dashboardDeleteDialog: MatDialogRef<DashboardDeleteDialogComponent> | null;
    activeMediaQuery = '';
    gridsterUnitSize: any = {};
    lastWidgetUpdated: any;
    private subscription: Subscription = new Subscription();
    dashboardTags = {
        rawDbTags: {},
        totalQueries: 0,
        tags: []
    };
    isDbTagsLoaded$ = new Subject();
    isDbTagsLoaded = false;
    eWidgets: any = {}; // to whole eligible widgets with custom dashboard tags
    tagKeysByNamespaces = [];

    // used for unsaved changes warning message
    oldMeta = {};
    oldWidgets = [];

    // used to determine db write access (and display popup for unsaved changes)
    dbOwner: string = ''; // /namespace/yamas
    user: string = '';    // /user/zb
    writeSpaces: string[] = [];

    constructor(
        private store: Store,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private interCom: IntercomService,
        private dbService: DashboardService,
        private cdkService: CdkService,
        private queryService: QueryService,
        private utilService: UtilsService,
        private dateUtil: DateUtilsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdRef: ChangeDetectorRef,
        private elRef: ElementRef,
        private logger: LoggerService,
        private httpService: HttpService,
        private wdService: WidgetService,
        private dbfsUtils: DbfsUtilsService,
        private urlOverrideService: URLOverrideService
    ) { }

    ngOnInit() {
        // load the namespaces user has access to
        this.store.dispatch(new LoadUserNamespaces());

        // handle route for dashboardModule
        this.subscription.add(this.activatedRoute.url.subscribe(url => {
            this.widgets = [];
            this.wData = {};
            this.meta = {};
            this.isDbTagsLoaded = false;
            this.variablePanelMode = { view: true };
            this.store.dispatch(new ClearWidgetsData());
            this.tplVariables = { editTplVariables: { tvars: []}, viewTplVariables: { tvars: []}};
            if (this.tplVariablePanel) { this.tplVariablePanel.reset(); }
            if (url.length === 1 && url[0].path === '_new_') {
                this.dbid = '_new_';
                this.store.dispatch(new LoadDashboard(this.dbid));
            } else {
                this.store.dispatch(new LoadDashboard(url[0].path));
            }
            // remove system messages - TODO: when adding more apps, put this in app-shell and listen for router change.
            this.interCom.requestSend({
                action: 'clearSystemMessage',
                payload: {}
            });
        }));
        // setup navbar portal
        this.dashboardNavbarPortal = new TemplatePortal(this.dashboardNavbarTmpl, undefined, {});
        this.cdkService.setNavbarPortal(this.dashboardNavbarPortal);

        // ready to handle request from children of DashboardModule
        // let widgets;
        this.subscription.add(this.interCom.requestListen().subscribe((message: IMessage) => {
            switch (message.action) {
                case 'getWidgetCachedData':
                    const widgetCachedData = this.wData[message.id];
                    let hasQueryError = false;
                    if ( widgetCachedData && widgetCachedData['error'] !== undefined) {
                        hasQueryError = true;
                    }
                    // requery if cachedData has error or data not fetched yet
                    if (!widgetCachedData || Object.keys(widgetCachedData).length === 0 || hasQueryError) {
                        this.handleQueryPayload(message);
                    } else {
                        this.updateWidgetGroup(message.id, widgetCachedData);
                    }
                    break;

                case 'setDashboardEditMode':
                    // copy the widget data to editing widget
                    if (message.id) {
                        this.wData['__EDIT__' + message.id] = this.wData[message.id];
                    }
                    // when click on view/edit mode, update db setting state of the mode
                    // need to setTimeout for next tick to change the mode
                    setTimeout(() => {
                        this.store.dispatch(new UpdateMode('edit'));
                    });
                    break;
                case 'removeWidget':
                    const deleteWidgetIdx = this.widgets.findIndex(w => w.id === message.payload.widgetId);
                    if (deleteWidgetIdx > -1) {
                        const deleteWidget = this.utilService.deepClone(this.widgets[deleteWidgetIdx]);
                        this.updateTplVariableForCloneDelete( deleteWidget, 'delete');
                    }
                    this.store.dispatch(new DeleteWidget(message.payload.widgetId));
                    this.rerender = { 'reload': true };
                    this.isDbTagsLoaded = false;
                    break;
                case 'cloneWidget':
                    // widgets = this.widgets;
                    const cloneWidget = JSON.parse(JSON.stringify(message.payload));
                    cloneWidget.id = this.utilService.generateId(6, this.utilService.getIDs(this.widgets));
                    cloneWidget.gridPos.yMd = cloneWidget.gridPos.yMd + cloneWidget.gridPos.h;
                    for (let i = 0; i < this.widgets.length; i++) {
                        if (this.widgets[i].gridPos.yMd >= cloneWidget.gridPos.yMd) {
                            this.widgets[i].gridPos.yMd += cloneWidget.gridPos.h;
                        }
                    }
                    this.widgets.push(cloneWidget);
                    // update the state with new widgets
                    // const copyWidgets = this.utilService.deepClone(this.widgets);
                    this.store.dispatch(new UpdateWidgets(this.widgets));
                    this.rerender = { 'reload': true };
                    const gridsterContainerEl = this.elRef.nativeElement.querySelector('.is-scroller');
                    const cloneWidgetEndPos = (cloneWidget.gridPos.y + cloneWidget.gridPos.h) * this.gridsterUnitSize.height;
                    const containerPos = gridsterContainerEl.getBoundingClientRect();
                    if (cloneWidgetEndPos > containerPos.height) {
                        setTimeout(() => {
                            gridsterContainerEl.scrollTop = cloneWidgetEndPos - containerPos.height;
                        }, 100);
                    }
                    this.updateTplVariableForCloneDelete( cloneWidget, 'clone');
                    break;
                case 'changeWidgetType':
                    const [newConfig, needRefresh] = this.wdService.convertToNewType(message.payload.newType, message.payload.wConfig);
                    if ( needRefresh ) {
                        delete this.wData['__EDIT__' + message.id];
                    }
                    this.mWidget = newConfig;
                    break;
                case 'closeViewEditMode':
                    // set the tpl filter panel to view mode, if they are from edit mode
                    delete this.wData[message.id];
                    this.store.dispatch(new UpdateMode(message.payload));
                    this.rerender = { 'reload': true };
                    break;
                case 'getQueryData':
                    this.handleQueryPayload(message);
                    this.rerender = { 'reload': true };
                    break;
                case 'getEventData':
                    this.handleEventQueryPayload(message);
                    break;
                case 'updateWidgetConfig':
                    let applyTpl = false;
                    let mIndex = this.widgets.findIndex(w => w.id === message.id);
                    if (mIndex === -1) {
                        // do not save if no metrics added
                        // update position to put new on on top
                        const newWidgetY = message.payload.widget.gridPos.h;
                        this.widgets = this.dbService.positionWidgetY(this.widgets, newWidgetY);
                        // change name to first metric if name is not changed
                        if (message.payload.widget.settings.component_type !== 'MarkdownWidgetComponent' &&
                            message.payload.widget.settings.component_type !== 'EventsWidgetComponent') {
                            if (message.payload.widget.settings.title === 'my widget' && message.payload.widget.queries[0].metrics.length) {
                                message.payload.widget.settings.title = message.payload.widget.queries[0].metrics[0].name;
                            }
                        }
                        this.widgets.unshift(message.payload.widget);

                        // set it to run updates
                        applyTpl = true;
                    } else {
                        if (this.widgets.length === 1 && this.widgets[0].settings.component_type === 'PlaceholderWidgetComponent') {
                            this.widgets[0] = message.payload.widget;
                            applyTpl = true;
                        }
                        // check the component type of updated widget config.
                        // it needs to be replaced with new component
                        else if (this.widgets[mIndex].settings.component_type !== message.payload.widget.settings.component_type) {
                            this.widgets[mIndex] = message.payload.widget;
                            // change name to fist metric if name is not change
                            if (message.payload.widget.settings.component_type !== 'MarkdownWidgetComponent' &&
                                message.payload.widget.settings.component_type !== 'EventsWidgetComponent') {
                                if (message.payload.widget.settings.title === 'my widget') {
                                    message.payload.widget.settings.title = message.payload.widget.queries[0].metrics[0].name;
                                }
                            }
                            this.store.dispatch(new UpdateWidgets(this.widgets));
                        } else {
                            // editing an existing widget
                            this.store.dispatch(new UpdateWidget({
                                id: message.id,
                                needRequery: message.payload.needRequery,
                                widget: message.payload.widget
                            }));
                        }
                    }
                    // update widgets and tplVariables
                    if (applyTpl) {
                        const sub = this.store.dispatch(new UpdateWidgets(this.widgets)).subscribe(res => {
                            const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;
                            this.applyTplToNewWidget(message.payload.widget, tplVars);
                        });
                        sub.unsubscribe();
                    }
                    // case that widget is updated we need to get new set of dashboard tags
                    this.isDbTagsLoaded = false;
                    break;
                case 'dashboardSaveRequest':
                    // DashboardSaveRequest comes from the save button
                    // we just need to update the title of dashboard
                    if (message.payload.updateFirst === true) {
                        this.store.dispatch(new UpdateDashboardTitle(message.payload.name));
                    }
                    const dbcontent = this.dbService.getStorableFormatFromDBState(this.store.selectSnapshot(DBState));
                    const payload: any = {
                        'name': dbcontent.settings.meta.title,
                        'content': dbcontent
                    };
                    if (message.payload.parentPath) {
                        payload.parentPath = message.payload.parentPath;
                    }
                    if (message.payload.parentId) {
                        payload.parentId = message.payload.parentId;
                    }
                    if (this.dbid !== '_new_') {
                        payload.id = this.dbid;
                    }
                    this.store.dispatch(new SaveDashboard(this.dbid, payload));

                    break;
                case 'updateTemplateVariables':
                    this.store.dispatch(new UpdateVariables(message.payload));
                    break;
                case 'ApplyTplVarValue':
                    this.applyTplVarValue(message.payload);
                    break;
                case 'UpdateTplAlias':
                    this.updateTplAlias(message.payload);
                    break;
                case 'RemoveCustomTagFilter':
                    this.removeCustomTagFilter(message.payload);
                    break;
                case 'updateDashboardSettings':
                    if (message.payload.meta) {
                        this.store.dispatch(new UpdateMeta(message.payload.meta));
                    }
                    break;
                case 'GetTplVariables':
                    // this is request for inline-tag-filters to display
                    // custom tag to select.
                    this.interCom.responsePut({
                        action: 'TplVariables',
                        payload: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables
                    });
                    break;
                case 'UpdateTagKeysByNamespaces': 
                    this.getTagkeysByNamespaces(message.payload);
                    break;
                case 'UpdateCustomFiltersAppliedCount':
                    // to update db fitler applied count from inline-tag-filters
                    this.updateTplVariablesAppliedCount(message.payload);
                    break;
                case 'getUserNamespaces':
                    this.store.dispatch(new LoadUserNamespaces());
                    break;
                case 'getUserFolderData':
                    this.store.dispatch(new LoadUserFolderData());
                    break;
                case 'SetZoomDateRange':
                    // while zooming in, update the local var
                    // reset from state when zoom out happens
                    if ( message.payload.isZoomed ) {
                        this.isDBZoomed = true;
                        // tslint:disable:max-line-length
                        message.payload.start = message.payload.start !== -1 ? message.payload.start : this.dateUtil.timeToMoment(this.dbTime.start, this.dbTime.zone).unix();
                        message.payload.end = message.payload.end !== -1 ? message.payload.end : this.dateUtil.timeToMoment(this.dbTime.end, this.dbTime.zone).unix();
                        this.dbTime.start = this.dateUtil.timestampToTime(message.payload.start, this.dbTime.zone);
                        this.dbTime.end = this.dateUtil.timestampToTime(message.payload.end, this.dbTime.zone);
                    }  else { // zoomed out
                        this.isDBZoomed = false;
                        const dbSettings = this.store.selectSnapshot(DBSettingsState);
                        this.dbTime = {...dbSettings.time};
                    }

                    this.interCom.responsePut({
                        action: 'ZoomDateRange',
                        payload: { zoomingWid: message.id, date: message.payload }
                    });
                    this.updateURLParams(this.dbTime);
                    break;
                default:
                    break;
            }
        }));

        // only this widget need to update config, and flag to requery or not
        this.subscription.add(this.lastUpdated$.subscribe(lastUpdated => {
            this.interCom.responsePut({
                id: lastUpdated.id,
                action: 'getUpdatedWidgetConfig',
                payload: this.utilService.deepClone(lastUpdated)
            });
        }));

        this.subscription.add(this.mediaQuery$.subscribe(currentMediaQuery => {
            this.activeMediaQuery = currentMediaQuery;
        }));

        this.subscription.add(this.loadedRawDB$.subscribe(db => {

            // reset when loading new dashboard
            if  (this.dbid !== db.id) {
                this.oldWidgets = [];
                this.oldMeta = {};
            }

            if (db && db.fullPath) {
                this.dbOwner = this.getOwnerFromPath(db.fullPath);
            }

            const dbstate = this.store.selectSnapshot(DBState);
            if (dbstate.loaded) {
                // this.widgetTagLoaded = false;
                // need to carry new loaded dashboard id from confdb
                this.dbid = db.id;
                this.isDBZoomed = false;
                this.store.dispatch(new LoadDashboardSettings(db.content.settings)).subscribe(() => {
                    // update WidgetsState after settings state sucessfully loaded
                    this.store.dispatch(new UpdateWidgets(db.content.widgets));
                });
            }
        }));

        this.subscription.add(this.dbPath$.subscribe(path => {

            if (path && path.startsWith('/_new_')) {
                this.dbOwner = this.user;
            }

            // we only need to check of path returned from configdb is not _new_,
            // the router url will point to previous path of clone dashboard
            // this.logger.log('dbPathSub', { currentLocation: this.location.path(), newPath: '/d' + path, rawPath: path});
            if (path !== '_new_' && path !== undefined) {
                let fullPath = this.location.path();
                let urlParts = fullPath.split('?');
                if (urlParts.length > 1) {
                    this.location.replaceState('/d' + path, urlParts[1]);
                } else {
                    this.location.replaceState('/d' + path);
                }

                // possibly need to update the dbid
                // necessary after saving a _new_ dashboard, so save dialog will not prompt again
                if (this.dbid === '_new_') {

                    const dbstate = this.store.selectSnapshot(DBState);
                    this.dbid = dbstate.id;

                    // if the save was on a NEW dashboard, lets tell the navigator to update
                    if (path !== '/_new_' && path !== undefined) {
                        const fullPath = '/' + path.split('/').slice(2).join('/'); // strip off the id part of the url
                        const details = this.dbfsUtils.detailsByFullPath(fullPath);
                        const parentDetails = this.dbfsUtils.detailsByFullPath(details.parentPath);
                        if (parentDetails.topFolder) {
                            this.store.dispatch(new DbfsLoadTopFolder(parentDetails.type, parentDetails.typeKey, {}));
                        } else {
                            this.store.dispatch(new DbfsLoadSubfolder(parentDetails.fullPath, {}));
                        }
                    }
                }
            }
        }));

        this.subscription.add(this.dbStatus$.subscribe(status => {
            switch (status) {
                case 'save-success':
                    this.snackBar.open('Dashboard has been saved.', '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'top',
                        duration: 5000,
                        panelClass: 'info'
                    });
                    // reset state for save pop-up
                    this.oldMeta = {...this.meta};
                    this.oldWidgets = [... this.widgets];
                    break;
                case 'delete-success':
                    this.snackBar.open('Dashboard has been moved to trash folder.', '', {
                      horizontalPosition: 'center',
                      verticalPosition: 'top',
                      duration: 5000,
                      panelClass: 'info'
                    });
                    break;
            }
        }));

        this.subscription.add(this.dbError$.subscribe(error => {
            if (Object.keys(error).length > 0) {
                console.error(error);
            }
        }));

        // tslint:disable-next-line: no-shadowed-variable
        this.subscription.add(this.widgets$.subscribe((widgets) => {
            const dbstate = this.store.selectSnapshot(DBState);
            if (dbstate.loaded) {
                // sort widget by grid row, then assign
                let sortWidgets = this.utilService.deepClone(widgets);
                sortWidgets.sort((a,b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x);
                this.widgets = this.utilService.deepClone(sortWidgets);

                // set oldWidgets when widgets is not empty and oldWidgets is empty
                if (this.widgets.length && this.oldWidgets.length === 0) {
                    this.oldWidgets = [...this.widgets];
                }
            }
        }));

        // initial from state mode is undefine.
        this.subscription.add(this.dashboardMode$.subscribe(mode => {
            this.viewEditMode = !mode || mode === 'dashboard' ? false : true;
        }));

        this.subscription.add(this.dbTime$.subscribe(t => {
            const timeZoneChanged = ((this.isDBZoomed && this.dbTime.zone !== t.zone) || this.dbTime.start === t.start && this.dbTime.end === t.end && this.dbTime.zone !== t.zone );
            if (timeZoneChanged ) {
                this.dbTime.zone = t.zone;
            } else {
                this.isDBZoomed = false;
                this.dbTime = {...t};
            }

            // do not intercom if widgets are still loading
            if (!this.widgets.length) {
                return;
            }

            if (timeZoneChanged) {
                this.interCom.responsePut({
                    action: 'TimezoneChanged',
                    payload: t
                });
            } else {
                this.interCom.responsePut({
                    action: 'TimeChanged',
                    payload: t
                });
            }
            this.updateURLParams(this.dbTime);
        }));

        this.subscription.add(this.dbSettings$.subscribe(settings => {
            // title in settings is used in various places. Need to keep this
            this.dbSettings = this.utilService.deepClone(settings);
        }));
        this.subscription.add(this.meta$.subscribe(t => {
            this.meta = this.utilService.deepClone(t);
            if (Object.keys(this.meta).length && this.meta.title && Object.keys(this.oldMeta).length === 0) {
                this.oldMeta = {... this.meta};
            }
            if (this.meta.title) {
                this.utilService.setTabTitle(this.meta.title);
            }
        }));
        this.subscription.add(this.tplVariables$.subscribe(tpl => {
            // whenever tplVariables$ trigger, we save to view too.
            if (tpl) {
                this.tplVariables.editTplVariables = this.utilService.deepClone(tpl);
                this.tplVariables.viewTplVariables = this.utilService.deepClone(tpl);
                // if there is override then do this, only at first apply
                if (tpl.override) {
                    this.tplVariables.viewTplVariables.tvars = this.utilService.deepClone(tpl.override);
                    delete this.tplVariables.editTplVariables.override;
                    delete this.tplVariables.viewTplVariables.override;
                } else {
                    // come from edit to view and there is urloverride, use those value
                    const tagOverrides = this.urlOverrideService.getTagOverrides() || {};
                    for (let alias in tagOverrides) {
                        const idx = this.tplVariables.viewTplVariables.tvars.findIndex(t => t.alias === alias);
                        if (idx > -1) {
                            this.tplVariables.viewTplVariables.tvars[idx].filter = tagOverrides[alias];
                        }
                    }
                }
                this.tplVariables = { ...this.tplVariables };
            }
        }));
        this.subscription.add(this.widgetGroupRawData$.subscribe(result => {
            let error = null;
            let grawdata = {};
            if (result !== undefined) {
                const wid = result.wid;
                const wdata = Object.assign({}, result);
                this.wData[wid] = wdata.data;
                if (wdata.data !== undefined && !wdata.data.error) {
                    grawdata = wdata.data;
                } else if (wdata.data !== undefined) {
                    error = wdata.data.error;
                }
                this.updateWidgetGroup(wid, grawdata, error);
            }
        }));

        this.subscription.add(this.userNamespaces$.subscribe(result => {
            this.userNamespaces = result;
            this.setWriteSpaces();
            this.interCom.responsePut({
                action: 'UserNamespaces',
                payload: result
            });
        }));

        this.subscription.add(this.userPersonalFolders$.subscribe(folders => {

            if (folders && folders[0] && folders[0].fullPath) {
                this.user = this.getOwnerFromPath(folders[0].fullPath);
                this.setWriteSpaces();
            }

            this.interCom.responsePut({
                action: 'UserPersonalFolders',
                payload: folders
            });
        }));

        this.subscription.add(this.userNamespaceFolders$.subscribe(folders => {
            this.interCom.responsePut({
                action: 'UserNamespaceFolders',
                payload: folders
            });
        }));

        this.subscription.add(this.auth$.subscribe(auth => {
            // console.log('auth$ calling', auth);
            if (auth === 'invalid') {
                // console.log('open auth dialog');
            }
        }));

        // skip the first time this drawer loaded
        this.subscription.add(this.drawerOpen$.pipe(skip(1)).subscribe(sideNav => {
            setTimeout(() => {
                this.rerender = { 'reload': true };
            }, 300);
        }));

        this.subscription.add(this.events$.subscribe(result => {
            const time = this.dbTime;
            let error = null;
            let grawdata: any = {};
            if (result !== undefined) {
                if (result && result.error) {
                    error = result.error;
                } else {
                    grawdata = result.events;
                }
                this.updateEvents(result.wid, grawdata, time, error);
            }
        }));
    }

    updateURLParams(p) {
        this.urlOverrideService.applyParamstoURL(p);
    }
    // apply when custom tag value is changed
    // should only trigger widgets that are affected by this change.  
    applyTplVarValue(tvars: any[]) {
        // update url params
        const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;
        if (this.variablePanelMode.view) {
            this.updateURLParams({tags: tplVars});
        }
        for (let i = 0; i < this.widgets.length; i++) {
            const queries = this.widgets[i].queries;
            for (let j = 0; j < queries.length; j++) {
                if (tvars.length === 1) {
                    const idx = queries[j].filters.findIndex(f => f.customFilter && f.customFilter.includes('[' + tvars[0].alias + ']'));
                    if (idx > -1) {
                        this.handleQueryPayload({
                            id: this.widgets[i].id,
                            payload: this.widgets[i]
                        });
                        break;
                    }
                } else if (tvars.length > 1) {
                    let matchIdx = 0;
                    for (let k = 0; k < tvars.length; k++) {
                        const idx = queries[j].filters.findIndex(f => f.customFilter && f.customFilter.includes('[' + tvars[k].alias + ']'));
                        if (idx > -1) {
                            matchIdx += 1;
                        }
                    }
                    if (matchIdx > 0) {
                        this.handleQueryPayload({
                            id: this.widgets[i].id,
                            payload: this.widgets[i]
                        });
                        break;                     
                    }
                }

            }
        }
    }
    // when delete a dashboard custom tag, we need to remove them out of 
    // widget if added before, and run query for widget that get affected.
    removeCustomTagFilter(payload: any) {
        const vartag = payload;
        let affectedWidgets = [];
        for (let i = 0; i < this.widgets.length; i++) {
            const widget = this.widgets[i];
            for (let j = 0; j < widget.queries.length; j++) {
                const filters = widget.queries[j].filters;
                const fIndex = filters.findIndex(f => f.tagk === vartag.tagk);
                if (fIndex > -1) {
                    if (filters[fIndex].customFilter && filters[fIndex].customFilter.length > 0) {
                        const cFilterIndex = filters[fIndex].customFilter.indexOf('[' + vartag.alias + ']');
                        if (cFilterIndex > -1) {
                            filters[fIndex].customFilter.splice(cFilterIndex, 1);
                            // after remove and of this filter does not have filter value before
                            // then we remove it out.
                            if (filters[fIndex].filter.length === 0 && filters[fIndex].customFilter.length === 0) {
                                filters.splice(fIndex, 1);
                            }
                            // requery if the remove custom tag has value, and only if the custom filter has value
                            affectedWidgets.push(widget);
                        }

                    }
                }
            }
        }
        // if there is filter value, we do need to run query and refresh them.
        if (vartag.filter.trim() !== '') {
            for (let i = 0; i < affectedWidgets.length; i++) {
                const widget = affectedWidgets[i];
                this.store.dispatch(new UpdateWidget({
                    id: widget.id,
                    needRequery: true,
                    widget: widget
                }));
            }
        } else {
            this.store.dispatch(new UpdateWidgets(this.widgets));
        }
    }
    // this will do the insert or update the name/alias if the widget is eligible.
    // this should not run any query since alias change, only query if it's a new insert and filter is not empty
    updateTplAlias(payload: any) {
        this.checkDbTagsLoaded().subscribe(loaded => {
            if (loaded) { // make sure it's true
                let affectedWidgets = [];
                let applied = 0;
                for (let i = 0; i < this.widgets.length; i++) {
                    const widget = this.widgets[i];
                    // we try to insert tpl alias if eligible
                    let isModify = false;
                    if (payload.vartag && payload.insert === 1) {
                        isModify = this.dbService.insertTplAliasToWidget(widget, payload, this.dashboardTags.rawDbTags);
                    } else {
                        isModify = this.dbService.updateTplAliasToWidget(widget, payload);
                    }
                    if (isModify) {
                        if (payload.insert === 1) {
                            applied = applied + 1;
                        }
                        affectedWidgets.push(widget);
                    }
                }
                // if isChanged mean some widgets get modified
                if (affectedWidgets.length > 0) {
                    if (payload.insert === 1) {
                        for (let i = 0; i < this.tplVariables.editTplVariables.tvars.length; i++) {
                            const tvar = this.tplVariables.editTplVariables.tvars[i];
                            tvar.isNew = 0;
                            if (tvar.alias === payload.vartag.alias) {
                                tvar.applied += applied;
                                break;
                            }
                        }
                        this.store.dispatch(new UpdateVariables(this.tplVariables.editTplVariables));
                    }
                    if (payload.vartag && payload.vartag.filter.trim() !== '') {
                        for (let i = 0; i < affectedWidgets.length; i++) {
                            const widget = affectedWidgets[i];
                            this.store.dispatch(new UpdateWidget({
                                id: widget.id,
                                needRequery: true,
                                widget: widget
                            }));
                        }                        
                    } else {
                        this.store.dispatch(new UpdateWidgets(this.widgets));
                    }
                }
            }
        });
    }
    // for new created widget
    applyTplToNewWidget(widget: any, tplVars: any[]) {
        let _widget = this.utilService.deepClone(widget); 
        // set to false to force get dashboard tags for all widgets nect time
        this.isDbTagsLoaded = false;
        this.httpService.getTagKeysForQueries([_widget]).subscribe((res: any) => {
            const widgetTags = this.dbService.formatDbTagKeysByWidgets(res);
            let anyModify = false;
            for (let i = 0; i < tplVars.length; i++) {
                const tvar = tplVars[i];
                let applied = 0;
                if (tvar.mode === 'auto') {
                    const isModify = this.dbService.insertTplAliasToWidget(_widget, { vartag: tvar, insert: 1 }, widgetTags.rawDbTags);
                    if (isModify) {
                        anyModify = true;
                        applied = applied + 1;
                        const tplIndex = this.tplVariables.editTplVariables.tvars.findIndex((v) => v.alias === tvar.alias);
                        if (tplIndex > -1) {
                            this.tplVariables.editTplVariables.tvars[tplIndex].applied += applied
                        }
                    }
                }
            }
            if (anyModify) {
                this.store.dispatch(new UpdateVariables(this.tplVariables.editTplVariables));
                // check if one of filter is not empty
                const idx = tplVars.findIndex(tpl => tpl.filter !== '');
                this.store.dispatch(new UpdateWidget({
                    id: _widget.id,
                    needRequery: idx > -1 ? true : false,
                    widget: _widget
                }));
            }         
        });
    }
    // @action: 'clone' or 'delete'
    // mainly tp update count for tplVariables
    updateTplVariableForCloneDelete(widget: any, action: string) {
        let isUpdated = false;
        for (let i = 0; i < this.tplVariables.editTplVariables.tvars.length; i++) {
            const tvar = this.tplVariables.editTplVariables.tvars[i];
            for (let j = 0; j < widget.queries.length; j++) {
                const query = widget.queries[j];
                const macthVars = query.filters.filter(f => {
                    if (f.tagk && f.tagk === tvar.tagk && f.customFilter && f.customFilter.includes('[' + tvar.alias + ']')) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (macthVars.length > 0) {
                    // make sure pass action or not affected
                    if (action === 'clone') {
                        tvar.applied = tvar.applied + 1;
                    } else if (action === 'delete') {
                        tvar.applied = tvar.applied -1;
                    }
                    isUpdated = true;
                }
            }
        }
        if (isUpdated) {
            this.store.dispatch(new UpdateVariables(this.tplVariables.editTplVariables));
        }
    }

    updateTplVariablesAppliedCount(payload: any) {
        const idx = this.tplVariables.editTplVariables.tvars.findIndex(tpl => '[' + tpl.alias + ']' === payload.alias);
        if (idx > -1) {
            const tpl = this.tplVariables.editTplVariables.tvars[idx];
            if (payload.operator === 'add') {
                tpl.applied = tpl.applied + 1;
            } else {
                tpl.applied = tpl.applied - 1;
            }
            this.store.dispatch(new UpdateVariables(this.tplVariables.editTplVariables));
        }
    }

    // to passing raw data to widget
    updateWidgetGroup(wid, rawdata, error = null) {
        const clientSize = this.store.selectSnapshot(ClientSizeState);
        this.interCom.responsePut({
            id: wid,
            action: 'updatedWidgetGroup',
            payload: {
                rawdata: rawdata,
                error: error,
                timezone: this.dbTime.zone,
                gridSize: clientSize
            }
        });
    }
    // get all dashboard tags, use to check eligible for when apply db filter 
    // to widget.
    getDashboardTagKeys(reloadData: boolean = true) {
        this.isDbTagsLoaded = false;
        this.httpService.getTagKeysForQueries(this.widgets).subscribe((res: any) => {
            this.dashboardTags = this.dbService.formatDbTagKeysByWidgets(res);
            this.isDbTagsLoaded = true;
            this.isDbTagsLoaded$.next(reloadData);
        },
            error => {
                this.isDbTagsLoaded = false;
                this.isDbTagsLoaded$.next(reloadData);
            });
    }

    // check if DBTags is loaded or not, 
    checkDbTagsLoaded(): Observable<any> {
        if (this.tplVariables.editTplVariables.tvars.length > 0) {
            if (!this.isDbTagsLoaded) {
                this.getDashboardTagKeys();
                return this.isDbTagsLoaded$;
            } else {
                return of(true);
            }
        } else {
            return of(true);
        }
    }

    changeVarPanelMode(mode: any) {
        if (!mode.view) {
            if (this.tagKeysByNamespaces.length === 0) {
                this.getTagkeysByNamespaces(this.tplVariables.editTplVariables.namespaces);
            }
        }
        this.variablePanelMode = {...mode};

    }
    // dispatch payload query by group
    handleQueryPayload(message: any) {
        let groupid = '';
        // make sure we modify the copy for tsdb query
        const payload = this.utilService.deepClone(message.payload);
        // tslint:disable-next-line:max-line-length
        // const groupby = payload.settings.multigraph ? payload.settings.multigraph.chart.filter(d=> d.key !== 'metric_group' && d.displayAs !== 'g').map(d => d.key) : [];
        const groupby = payload.settings.multigraph ?
            payload.settings.multigraph.chart.filter(d => d.key !== 'metric_group').map(d => d.key) : [];
        const dt = this.getDashboardDateRange();
        if (payload.queries.length) {
            const wType = payload.settings.component_type;
            // override downsample to auto when the dashboard is zoomed
            if (this.isDBZoomed && message.id.indexOf('__EDIT__') === -1 && (wType === 'HeatmapWidgetComponent' || wType === 'LinechartWidgetComponent')) {
                payload.settings.time.downsample.value = 'auto';
            }
            // should we modify the widget if using dashboard tag filter
            const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;
            // sending each group to get data.
            const queries = {};
            const sources = [];
            for (let i = 0; i < payload.queries.length; i++) {
                let query: any = JSON.parse(JSON.stringify(payload.queries[i]));
                groupid = query.id;
                if (query.namespace && query.metrics.length) {
                    // filter only visible metrics, disable it now since it will break the expression
                    // query = this.dbService.filterMetrics(query);
                    // here we need to resolve template variables
                    if (tplVars.length > 0) {
                        if (query.filters.findIndex(f => f.customFilter !== undefined) > -1) {
                            // query = this.dbService.resolveTplVarCombine(query, tplVars);
                            query = this.dbService.resolveTplVarReplace(query, tplVars);
                        }
                    }
                    // override the multigraph groupby config
                    for (let j = 0; j < query.metrics.length; j++) {
                        // console.log("payload1", query.metrics[j].groupByTags.concat(groupby))
                        const metricGroupBy = query.metrics[j].groupByTags || [];
                        query.metrics[j].groupByTags = this.utilService.arrayUnique(metricGroupBy.concat(groupby));
                        if (query.metrics[j].settings.visual.visible) {
                            sources.push(query.metrics[j].id);
                        }
                    }
                    queries[i] = query;
                }
            }
            const gquery: any = {
                wid: message.id,
                isEditMode: this.viewEditMode,
                dbid: this.dbid
            };
            if (Object.keys(queries).length && sources.length) {
                const query = this.queryService.buildQuery(payload, dt, queries, { sources: sources });
                gquery.query = query;
                // console.debug("****** DSHBID: " + this.dbid + "  WID: " + gquery.wid);
                // ask widget to loading signal
                this.interCom.responsePut({
                    id: payload.id,
                    payload: {
                        storeQuery: query
                    },
                    action: 'WidgetQueryLoading'
                });
                // now dispatch request
                this.store.dispatch(new GetQueryDataByGroup(gquery));
            } else {
                gquery.data = {};
                this.store.dispatch(new SetQueryDataByGroup(gquery));
            }
        } else {
            this.store.dispatch(new ClearQueryData({ wid: message.id, triggerChange: true }));
        }
    }

    handleEventQueryPayload(message: any) {
        if ( message.payload.eventQueries[0].namespace) {
            const dbTime = this.getDashboardDateRange();
            this.store.dispatch(new GetEvents(
                {   start: dbTime.start,
                    end: dbTime.end
                },
                message.payload.eventQueries,
                message.id,
                message.payload.limit));
        }
    }

    updateEvents(wid, rawdata, time, error = null) {
        // const clientSize = this.store.selectSnapshot(ClientSizeState);
        this.interCom.responsePut({
            id: wid,
            action: 'updatedEvents',
            payload: {
                events: rawdata,
                time: time,
                error: error
            }
        });
    }

    getDashboardDateRange() {
        const startTime = this.dateUtil.timeToMoment(this.dbTime.start, this.dbTime.zone);
        const endTime = this.dateUtil.timeToMoment(this.dbTime.end, this.dbTime.zone);
        return { start: startTime.valueOf(), end: endTime.valueOf() };
    }

    // this will call based on gridster reflow and size changes event
    widgetsLayoutUpdate(gridLayout: any) {
        this.gridsterUnitSize = gridLayout.clientSize;
        if (gridLayout.clientSize) {
            this.store.dispatch(new UpdateGridsterUnitSize(gridLayout.clientSize));
        }
        if (gridLayout.wgridPos) {
            this.store.dispatch(new UpdateGridPos(gridLayout.wgridPos));
        }
    }

    // setup the new widget type and using as input to dashboard-content to load edting it.
    addNewWidget(selectedWidget: any) {
        this.newWidget = this.dbService.getWidgetPrototype(selectedWidget.type, this.widgets);
    }


    refresh() {
        this.interCom.responsePut({
            action: 'reQueryData',
            payload: {}
        });
    }

    handleTimePickerChanges(message) {
        switch ( message.action  ) {
            case 'SetDateRange':
                this.setDateRange(message.payload.newTime);
                break;
            case 'SetAutoRefreshConfig':
                this.setAutoRefresh(message.payload);
                break;
            case 'RefreshDashboard':
                if (this.tplVariablePanel.mode.view) {
                    this.refresh();
                }
                break;
        }
    }

    setDateRange(e: any) {
        this.isDBZoomed = false;
        this.store.dispatch(new UpdateDashboardTime({ start: e.startTimeDisplay, end: e.endTimeDisplay }));
    }

    setAutoRefresh(refresh) {
        this.store.dispatch(new UpdateDashboardAutoRefresh(refresh));
    }

    setTimezone(e: any) {
        // we change the local dbTime when zooming, so update the zone of local var
        if ( this.isDBZoomed ) {
            this.dbTime.start = this.dateUtil.timestampToTime(this.dateUtil.timeToMoment(this.dbTime.start, this.dbTime.zone).unix().toString(), e);
            this.dbTime.end = this.dateUtil.timestampToTime(this.dateUtil.timeToMoment(this.dbTime.end, this.dbTime.zone).unix().toString(), e);
        }
        this.store.dispatch(new UpdateDashboardTimeZone(e));
    }

    setTitle(e: any) {
        this.store.dispatch(new UpdateDashboardTitle(e));
    }

    receiveDashboardAction(event: any) {
        switch (event.action) {
            case 'clone':
                this.dbid = '_new_';
                const newTitle = 'Clone of ' + this.meta.title;
                this.setTitle(newTitle);
                this.location.replaceState('/d/' + this.dbid);
                this.dbOwner = this.user;
                break;
            case 'delete':
                this.openDashboardDeleteDialog();
                break;
        }
    }

    getOwnerFromPath(fullPath: string) {
        // ex path: /user/zb || /namespace/yamas/save-test2
        if (fullPath && fullPath.length) {
            const split = fullPath.split('/');
            if (split.length >= 3 && split[0] === '') {
                return '/' + split[1].toLowerCase() + '/' + split[2].toLowerCase();
                // return /user/zb || /namespace/yamas
            }
        }
        return '';
    }

    setWriteSpaces() {
        const writeSpaces = [];
        for (const ns of this.userNamespaces) {
            writeSpaces.push('/namespace/' + ns.name.toLowerCase());
        }
        writeSpaces.push(this.user);
        this.writeSpaces = writeSpaces;
    }

    doesUserHaveWriteAccess() {
        if (this.dbOwner && this.dbOwner.length) {
            return this.writeSpaces.includes(this.dbOwner);
        } else {
            return true;
        }
    }

    isDashboardDirty() {
        let widgetChange = !deepEqual(this.widgets, this.oldWidgets);
        let metaChange = !deepEqual(this.meta, this.oldMeta);

        // sometimes current dashboard is not loaded before loading new db
        if (this.widgets.length === 0 && Object.entries(this.meta).length === 0 && this.dbid !== '_new_') {
            widgetChange = false;
            metaChange = false;
        }

        const writeAccess = this.doesUserHaveWriteAccess();
        return (writeAccess && (widgetChange || metaChange));
    }

    getTagkeysByNamespaces(namespaces) {
        this.httpService.getTagKeys({ namespaces }).subscribe((res: string[]) => {
            this.tagKeysByNamespaces = [...res];
        });
    }


    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.isDashboardDirty()) {
            $event.returnValue = true;
        }
    }

    openDashboardDeleteDialog() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.backdropClass = 'dashboard-delete-dialog-backdrop';
        dialogConf.hasBackdrop = true;
        dialogConf.panelClass = 'dashboard-delete-dialog-panel';

        dialogConf.autoFocus = true;
        dialogConf.data = {};
        this.dashboardDeleteDialog = this.dialog.open(DashboardDeleteDialogComponent, dialogConf);
        this.dashboardDeleteDialog.afterClosed().subscribe((dialog_out: any) => {
            if (dialog_out && dialog_out.delete) {
                // this does not work... calls non-existant api endpoint
                // this.store.dispatch(new DeleteDashboard(this.dbid));

                // Going to use a patchwork of calls to DBFS first (which has correct endpoints)
                // it will also update navigator cache in the process
                // THEN, make calls to Dashboard state

                // get the fullPath. We pass this to DBFS Resources for delete action
                const dbFullPath = this.store.selectSnapshot(DBState.getDashboardFullPath);
                // tell dashboard state we are starting delete process
                this.store.dispatch(new SetDashboardStatus('delete-progress', true));
                // start delete process from DBFS. This will update navigator data as well
                this.store.dispatch(new DbfsDeleteDashboard(dbFullPath, {})).subscribe( value => {
                    // delete was successful
                    // grab updated file record from DBFS cache, and pass to dashboard state
                    const details = this.store.selectSnapshot(DbfsResourcesState.getFileById(this.dbid));
                    // tell dashboard state it was success, passing updated file detail
                    this.store.dispatch(new DeleteDashboardSuccess(details));
                    this.location.replaceState('/d/' + this.dbid + details.fullPath);
                },
                err => {
                    // there was a problem, need to notify dashboard state
                    this.store.dispatch(new DeleteDashboardFail(err));
                },
                () => {
                    // console.log('COMPLETE');
                });
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.utilService.setTabTitle();
    }
}
