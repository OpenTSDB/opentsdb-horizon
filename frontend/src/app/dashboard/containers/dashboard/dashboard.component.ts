import {
    Component, OnInit, OnDestroy, HostBinding, ViewChild,
    TemplateRef, ChangeDetectorRef, ElementRef, HostListener,
} from '@angular/core';
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
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { DBState, LoadDashboard, SaveDashboard, LoadSnapshot, SaveSnapshot, DeleteDashboardSuccess, DeleteDashboardFail, SetDashboardStatus } from '../../state/dashboard.state';

import { WidgetsState,
    UpdateWidgets, UpdateGridPos, UpdateWidget,
    DeleteWidget, WidgetModel, DeleteWidgets } from '../../state/widgets.state';
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
    UpdateDownsample,
    UpdateToT
} from '../../state/settings.state';
import {
    AppShellState,
    NavigatorState,

} from '../../../app-shell/state';
import {
    DbfsState,
    DbfsLoadTopFolder,
    DbfsLoadSubfolder,
    DbfsDeleteDashboard,
    DbfsResourcesState,
    DbfsRemoveUserFav,
    DbfsAddUserFav
} from '../../../shared/modules/dashboard-filesystem/state';
import { MatMenuTrigger, MenuPositionX, MatSnackBar } from '@angular/material';
import { DashboardDeleteDialogComponent } from '../../components/dashboard-delete-dialog/dashboard-delete-dialog.component';
import { DashboardToAlertDialogComponent} from '../../components/dashboard-to-alert-dialog/dashboard-to-alert-dialog.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';

import { HttpService } from '../../../core/http/http.service';
import { DbfsUtilsService } from '../../../shared/modules/dashboard-filesystem/services/dbfs-utils.service';
import { EventsState, GetEvents } from '../../../dashboard/state/events.state';
import { URLOverrideService } from '../../services/urlOverride.service';
import * as deepEqual from 'fast-deep-equal';
import { TemplateVariablePanelComponent } from '../../components/template-variable-panel/template-variable-panel.component';
import { DataShareService } from '../../../core/services/data-share.service';
import { InfoIslandService } from '../../../shared/modules/info-island/services/info-island.service';
import { ClipboardAddItems, SetHideProgress, SetShowProgress } from '../../../shared/modules/universal-clipboard/state/clipboard.state';
import { WidgetDeleteDialogComponent } from '../../components/widget-delete-dialog/widget-delete-dialog.component';
import { DboardContentComponent } from '../../components/dboard-content/dboard-content.component';

import domtoimage from 'dom-to-image-more';
import { NavbarClipboardMenuComponent } from '../../../shared/modules/universal-clipboard/components';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    @HostBinding('class.app-dashboard') private hostClass = true;

    @Select(AuthState.getAuth) auth$: Observable<string>;
    @Select(DBSettingsState.getDashboardSettings) dbSettings$: Observable<any>;
    @Select(DbfsState.getUserFolderData()) userFolderData$: Observable<any>;
    @Select(DBState.getDashboardFriendlyPath) dbPath$: Observable<string>;
    @Select(DBState.getLoadedDB) loadedRawDB$: Observable<any>;
    @Select(DBState.getDashboardStatus) dbStatus$: Observable<string>;
    @Select(DBState.getDashboardError) dbError$: Observable<any>;
    @Select(DBState.getSnapshotId) snapshotId$: Observable<string>;
    @Select(DBSettingsState.getDashboardTime) dbTime$: Observable<any>;
    @Select(DBSettingsState.getDashboardAutoRefresh) refresh$: Observable<any>;
    @Select(DBSettingsState.getMeta) meta$: Observable<any>;
    @Select(DBSettingsState.getTplVariables) tplVariables$: Observable<any>;
    @Select(DBSettingsState.getDownSample) downSample$: Observable<any>;
    @Select(DBSettingsState.getToT) tot$: Observable<any>;
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

    @ViewChild(DboardContentComponent, {read: DboardContentComponent}) dbContent: DboardContentComponent;

    @ViewChild(NavbarClipboardMenuComponent, {read: NavbarClipboardMenuComponent}) clipboardMenu: NavbarClipboardMenuComponent;

    // portal placeholders
    dashboardNavbarPortal: TemplatePortal;

    menuXAlignValue: MenuPositionX = 'before';

    // Available Widget Types
    /**
     *  NOTE: at some point we might want to think about adding this to some config setup
     * */
    availableWidgetTypes: Array<any> = [
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
        {
            label: 'Table',
            type: 'TableWidgetComponent',
            iconClass: 'widget-icon-table'
        }

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
    dbWdViewBackup: any = {};
    dbToT: any;
    dbPrevToT: any;
    isDBZoomed = false;
    meta: any = {};
    dbDownsample: any = {};
    // variables: any;
    dbTags: any;
    dbid: string; // passing dashboard id
    wid: string; // passing widget id
    rerender: any = { 'reload': false }; // -> make gridster re-render correctly
    wData: any = {};
    widgets: any[] = [];
    tplVariables: any = {};
    variablePanelMode: any = { view : true };
    userNamespaces: any[] = [];
    viewEditMode = false;
    editViewModeMeta: any = {};
    wdMetaData: any = {};
    snapshot = false;
    newWidget: any; // setup new widget based on type from top bar
    mWidget: any; // change the widget type
    dashboardDeleteDialog: MatDialogRef<DashboardDeleteDialogComponent> | null;
    dashboardToAlertDialog: MatDialogRef<DashboardToAlertDialogComponent> | null;
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
    isToTChanged = false;
    isDBScopeLoaded = false;
    eWidgets: any = {}; // to whole eligible widgets with custom dashboard tags
    tagKeysByNamespaces = [];

    // used for unsaved changes warning message
    oldMeta = {};
    oldWidgets = [];

    // used to determine db write access (and display popup for unsaved changes)
    dbOwner: string = ''; // /namespace/yamas
    user: string = '';    // /user/zb
    writeSpaces: string[] = [];

    isUserFavorited: boolean = false;
    // going to be a dynamic observable
    checkUserFavorited$: Observable<boolean> | null;
    checkUserFavoritedSub: Subscription;

    // dashboard batch controls
    batchToggle: boolean = false;
    batchSelectAllIndeterminate: boolean = false;
    batchSelectAll: boolean = false;
    batchSelectedItems: any = {};
    batchSelectedCount: number = 0;
    batchWidgetDeleteDialog: MatDialogRef<WidgetDeleteDialogComponent> | null;

    newFromClipboard: boolean = false;
    newFromClipboardItems: any[] = [];

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
        private httpService: HttpService,
        private wdService: WidgetService,
        private dbfsUtils: DbfsUtilsService,
        private urlOverrideService: URLOverrideService,
        private dataShare: DataShareService,
        private iiService: InfoIslandService,
        private localStorageService: LocalStorageService
    ) { }

    ngOnInit() {
        // load the namespaces user has access to
        // this.store.dispatch(new LoadUserNamespaces());

        // handle route for dashboardModule
        this.subscription.add(this.activatedRoute.url.subscribe(url => {
            this.widgets = [];
            this.wData = {};
            this.meta = {};
            this.wdMetaData = {}
            this.isDbTagsLoaded = false;
            this.isDBScopeLoaded = false;
            this.variablePanelMode = { view: true };
            this.dbDownsample = { aggregators: [''], customUnit: '', customValue: '', value: 'auto'};
            this.store.dispatch(new ClearWidgetsData());
            this.tplVariables = { editTplVariables: { tvars: []}, viewTplVariables: { tvars: []}, scopeCache: []};
            if (this.tplVariablePanel) { this.tplVariablePanel.reset(); }
            this.isToTChanged = false;
            this.dbPrevToT = { period: '', value: 0 };
            this.dbToT = { period: '', value: 0 };
            this.snapshot = this.activatedRoute.snapshot.pathFromRoot[1].routeConfig.path === 'snap' ? true : false;
            this.viewEditMode = false;
            this.newWidget = null;
            if (url.length === 1 && url[0].path === '_new_') {
                this.dbid = '_new_';
                // CHECK if New from clipboard
                if (this.newFromClipboard) {
                    this.store.dispatch(new LoadDashboard(this.dbid, this.newFromClipboardItems));
                } else {
                    this.store.dispatch(new LoadDashboard(this.dbid));
                }
            } else if ( !this.snapshot ) {
                this.store.dispatch(new LoadDashboard(url[0].path));
                // favorite subscription
            } else {
                this.store.dispatch(new LoadSnapshot(url[0].path));
            }

            // clear batch stuff
            this.batchToggle = false;
            this.batchSelectAllIndeterminate = false;
            this.batchSelectAll = false;
            this.batchSelectedItems = {};
            this.newFromClipboard = false;
            this.newFromClipboardItems = [];

            // reset clipboard
            if (this.clipboardMenu && this.clipboardMenu.getDrawerState() === 'opened') {
                this.clipboardMenu.toggleDrawerState({});
            }

            // clear info island if any
            this.iiService.closeIsland();
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

            let gridsterContainerEl: any;
            let cloneWidgetEndPos: any;
            let containerPos: any;

            switch (message.action) {
                case 'ResizeAllWidgets':
                    if ( !this.viewEditMode ) {
                        this.dbContent.gridster.reload();
                    }
                    break;
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
                    this.editViewModeMeta.id = '__EDIT__' + message.id;
                    const wdIdx = this.widgets.findIndex(w => w.id === message.id);
                    if ( this.widgets[wdIdx] ) {
                        this.editViewModeMeta.title = this.widgets[wdIdx].settings.title;
                    }
                    // copy the widget data to editing widget
                    if (message.id) {
                        this.wData[this.editViewModeMeta.id] = this.wData[message.id];
                    }
                    // tslint:disable:max-line-length
                    this.dbWdViewBackup = this.utilService.deepClone({ time: this.dbTime, tot: this.dbToT, downsample: this.dbDownsample, isDBZoomed: this.isDBZoomed });
                    // when click on view/edit mode, update db setting state of the mode
                    // need to setTimeout for next tick to change the mode
                    setTimeout(() => {
                        this.store.dispatch(new UpdateMode(message.payload));
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
                    this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets)));
                    this.rerender = { 'reload': true };
                    gridsterContainerEl = this.elRef.nativeElement.querySelector('.is-scroller');
                    cloneWidgetEndPos = (cloneWidget.gridPos.y + cloneWidget.gridPos.h) * this.gridsterUnitSize.height;
                    containerPos = gridsterContainerEl.getBoundingClientRect();
                    if (cloneWidgetEndPos > containerPos.height) {
                        setTimeout(() => {
                            gridsterContainerEl.scrollTop = cloneWidgetEndPos - containerPos.height;
                        }, 100);
                    }
                    this.updateTplVariableForCloneDelete( cloneWidget, 'clone');
                    break;
                // This comes from the clipboard drawer
                case 'pasteClipboardWidgets':
                    // widgets = this.widgets;
                    const clipboardWidgets = JSON.parse(JSON.stringify(message.payload));
                    let batchGridPosOffset: any = 0;
                    for(let i = 0; i < clipboardWidgets.length; i++) {
                        // get rid of clipboard meta
                        delete clipboardWidgets[i].settings.clipboardMeta;
                        // generate new widget id
                        clipboardWidgets[i].id = this.utilService.generateId(6, this.utilService.getIDs(this.widgets));
                        // need better way to position... just drop them at top for now
                        clipboardWidgets[i].gridPos.y = 0;
                        clipboardWidgets[i].gridPos.ySm = 0;
                        clipboardWidgets[i].gridPos.yMd = 0;

                        if (this.widgets.length > 0) {
                            for (let j = 0; j < this.widgets.length; j++) {
                                if (this.widgets[j].gridPos.yMd >= clipboardWidgets[i].gridPos.yMd) {
                                    this.widgets[j].gridPos.yMd += clipboardWidgets[i].gridPos.h;
                                }
                            }
                        }

                        this.widgets.push(clipboardWidgets[i]);

                        batchGridPosOffset = batchGridPosOffset + (clipboardWidgets[i].gridPos.y + clipboardWidgets[i].gridPos.h)
                    }

                    // update the state with new widgets
                    // const copyWidgets = this.utilService.deepClone(this.widgets);
                    this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets)));
                    this.rerender = { 'reload': true };
                    gridsterContainerEl = this.elRef.nativeElement.querySelector('.is-scroller');
                    cloneWidgetEndPos = batchGridPosOffset * this.gridsterUnitSize.height;
                    containerPos = gridsterContainerEl.getBoundingClientRect();
                    if (cloneWidgetEndPos > containerPos.height) {
                        setTimeout(() => {
                            gridsterContainerEl.scrollTop = cloneWidgetEndPos - containerPos.height;
                        }, 100);
                    }

                    for(let i = 0; i < clipboardWidgets.length; i++) {
                        this.updateTplVariableForCloneDelete( clipboardWidgets[i], 'clone');
                    }

                    break;
                case 'changeWidgetType':
                    this.iiService.closeIsland();
                    const [newConfig, needRefresh] = this.wdService.convertToNewType(message.payload.newType, message.payload.wConfig);
                    const wId = this.snapshot ? message.id : this.editViewModeMeta.id;
                    if ( needRefresh && this.wData[wId] ) {
                        delete this.wData[wId];
                    }
                    if ( this.snapshot ) {
                        this.newWidget = newConfig;
                        this.setSnapshotMeta();
                    } else {
                        this.mWidget = newConfig;
                    }
                    break;
                case 'closeViewEditMode':
                    // set the tpl filter panel to view mode, if they are from edit mode
                    this.closeViewEditMode();
                    break;
                case 'createAlertFromWidget':
                    this.createAlertFromWidget(message);
                    break;
                case 'downloadDataQuery':
                    this.downloadDataQuery(message);
                    break;
                case 'downloadWidgetData':
                    this.downloadWidgetData(message.payload);
                    break;
                case 'getQueryData':
                    this.notifyWidgetLoaderUserHasWriteAccess(this.writeSpaces.length > 1);
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
                            this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets)));
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
                        const sub = this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets))).subscribe(res => {
                            const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;
                            this.applyTplToNewWidget(message.payload.widget, tplVars);
                        });
                        sub.unsubscribe();
                    }
                    // for markdown, after edit, force to apply visual text updated.
                    if (message.payload.widget.settings.component_type !== 'MarkdownWidgetComponent') {
                        this.dbService.resolveTplViewValues(this.tplVariables, this.widgets).subscribe(results => {
                            this.interCom.responsePut({
                                action: 'viewTplVariablesValues',
                                payload: {
                                    tplVariables: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables,
                                    tplValues: results
                                }
                            });
                        });
                    }
                    // case that widget is updated we need to get new set of dashboard tags
                    this.isDbTagsLoaded = false;
                    break;
                case 'SaveSnapshot':
                    // data.parentPath = '/namespace/' + nsData.alias;
                    // data.parentId = this.folders[data.parentPath].id;

                    // const userFolder = this.folders['/' + this.user.userid.split('.').join('/')];
                    const dbState = this.utilService.deepClone(this.store.selectSnapshot(DBState));
                    const snapTitle = message.payload.widget.settings.title;
                    const widget = message.payload.widget;
                    dbState.Settings.meta.title = snapTitle;
                    let aliases = [];
                    for (let i = 0; i < widget.queries.length; i++) {
                        const query = widget.queries[i];
                        for ( let j = 0; j < query.filters.length; j++ ) {
                            const filter = query.filters[j];
                            if (filter.customFilter && filter.customFilter.length) {
                                aliases = aliases.concat(filter.customFilter);
                            }
                        }
                    }
                    if ( dbState.Settings.tplVariables ) {
                        dbState.Settings.tplVariables.tvars = this.tplVariables.viewTplVariables.tvars.filter(d => aliases.includes('[' +  d.alias + ']'));
                    }
                    delete message.payload.widget.settings.time.overrideTime;
                    dbState.Widgets.widgets = [message.payload.widget];
                    const dbcontent = this.dbService.getStorableFormatFromDBState(dbState);
                    dbcontent.settings.time.start = this.editViewModeMeta.queryDataRange ? this.editViewModeMeta.queryDataRange.start : this.wdMetaData[message.id].queryDataRange.start;
                    dbcontent.settings.time.end = this.editViewModeMeta.queryDataRange ? this.editViewModeMeta.queryDataRange.end : this.wdMetaData[message.id].queryDataRange.end;
                    dbcontent.settings.time.zone = this.dbTime.zone;
                    dbcontent.settings.tot = this.dbToT;
                    dbcontent.settings.downsample = this.dbDownsample;
                    const payload: any = {
                        'name': encodeURIComponent(snapTitle),
                        'content': dbcontent
                    };
                    if ( this.dbid !== '_new_') {
                        payload.sourceType = this.snapshot ? 'SNAPSHOT' : 'DASHBOARD';
                        payload.sourceId = this.dbid;
                    }
                    this.store.dispatch(new SaveSnapshot('_new_', payload));
                    break;
                case 'dashboardSaveRequest':
                    // DashboardSaveRequest comes from the save button
                    // we just need to update the title of dashboard
                    if ( this.snapshot ) {
                        this.store.dispatch(new UpdateWidgets([this.newWidget]));
                    }
                    if (message.payload.updateFirst === true) {
                        this.store.dispatch(new UpdateDashboardTitle(message.payload.name));
                    }
                    let dbcontent2 = this.store.selectSnapshot(DBState);
                    dbcontent2 = this.dbService.getStorableFormatFromDBState(dbcontent2);
                    const payload2: any = {
                        'name': dbcontent2.settings.meta.title,
                        'content': dbcontent2
                    };
                    if (message.payload.parentPath) {
                        payload2.parentPath = message.payload.parentPath;
                    }
                    if (message.payload.parentId) {
                        payload2.parentId = message.payload.parentId;
                    }
                    if (this.dbid !== '_new_') {
                        payload2.id = this.dbid;
                    }
                    this.store.dispatch(new SaveDashboard(this.dbid, payload2));

                    break;
                case 'updateTemplateVariables':
                    this.store.dispatch(new UpdateVariables(message.payload));
                    break;
                case 'ApplyTplVarValue':
                    this.applyTplVarValue(message.payload);
                    // this is pass down to markdown widget to resolve only in view mode
                    this.dbService.resolveTplViewValues(this.tplVariables, this.widgets).subscribe(results => {
                        this.interCom.responsePut({
                            action: 'viewTplVariablesValues',
                            payload: {
                                tplVariables: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables,
                                tplValues: results
                            }
                        });
                    });
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
                        payload: {
                            tplVariables: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables,
                        }
                    });
                    break;
                case 'GetResolveViewTplVariables':
                    this.dbService.resolveTplViewValues(this.tplVariables, this.widgets).subscribe(results => {
                        this.interCom.responsePut({
                            action: 'viewTplVariablesValues',
                            payload: {
                                tplVariables: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables,
                                tplValues: results,
                                scope: this.tplVariables
                            }
                        });
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
                    // this.store.dispatch(new LoadUserNamespaces());
                    break;
                case 'getUserFolderData':
                    // this.store.dispatch(new LoadUserFolderData());
                    break;
                case 'SetZoomDateRange':
                    // while zooming in, update the local var
                    // reset from state when zoom out happens
                    let overrideOnly = false;
                    if ( message.payload.isZoomed ) {
                        // tslint:disable:max-line-length
                        const start = this.dateUtil.timeToMoment(this.dbTime.start, this.dbTime.zone).unix();
                        const end = this.dateUtil.timeToMoment(this.dbTime.end, this.dbTime.zone).unix();
                        message.payload.start = message.payload.start !== -1 ? message.payload.start : start;
                        message.payload.end = message.payload.end !== -1 ? message.payload.end : end;

                        const newStart = this.dateUtil.timestampToTime(message.payload.start, this.dbTime.zone);
                        const newEnd = this.dateUtil.timestampToTime(message.payload.end, this.dbTime.zone);
                        this.isDBZoomed = true;
                        if ( start <= message.payload.start && end >= message.payload.end ) {
                            this.dbTime.start = newStart;
                            this.dbTime.end = newEnd;
                        } else {
                            overrideOnly = true;
                        }
                    }  else if ( this.isDBZoomed ) {
                            this.isDBZoomed = false;
                            const dbSettings = this.store.selectSnapshot(DBSettingsState);
                            this.dbTime = {...dbSettings.time};
                    } else {
                        overrideOnly = true;
                    }

                    this.interCom.responsePut({
                        action: 'ZoomDateRange',
                        id: this.viewEditMode ? this.editViewModeMeta.id : '',
                        payload: { zoomingWid: message.id, overrideOnly: overrideOnly, date: { ...message.payload, zone: this.dbTime.zone } }
                    });
                    this.updateURLParams(this.dbTime);
                    break;
                case 'copyWidgetToClipboard':
                    this.clipboardMenu.setDrawerOpen();
                    this.store.dispatch(new SetShowProgress());

                    setTimeout(() => {
                        const dbData = this.store.selectSnapshot(DBState.getLoadedDB);
                        const widgetCopy: any = {...message.payload.widget};

                        widgetCopy.settings.clipboardMeta = {
                            dashboard: {
                                id: dbData.id,
                                path: dbData.path,
                                fullPath: dbData.fullPath,
                                name: dbData.name
                            },
                            copyDate: Date.now(),
                            referencePath: dbData.path + '@' + widgetCopy.id,
                            preview: message.payload.preview
                        };

                        let resolvedWidgets: any[] = this.resolveDbTplVariablesForClipboard([widgetCopy]);

                        if (this.clipboardMenu.getDrawerState() === 'closed') {
                            this.clipboardMenu.toggleDrawerState({});
                        }

                        this.store.dispatch(new ClipboardAddItems(resolvedWidgets));
                    }, 50);
                    break;
                case 'batchItemUpdated':
                    this.batchSelectedItems[message.id] = message.payload.selected;
                    this.checkBatchSelectAll();
                    break;
                case 'newFromClipboard':
                    this.newFromClipboard = true;
                    this.newFromClipboardItems = JSON.parse(JSON.stringify(message.payload));
                    this.router.navigate(['d', '_new_']);
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
                this.isUserFavorited = false;
            }

            if (db && db.fullPath) {
                this.dbOwner = this.getOwnerFromPath(db.fullPath);
                const namespace = this.getNamespaceFromPath(db.fullPath);
                if ( namespace ) {
                    this.localStorageService.setLocal('defaultNS', namespace);
                }
            }

            const dbstate = this.store.selectSnapshot(DBState);
            if (dbstate.loaded) {
                // this.widgetTagLoaded = false;
                // need to carry new loaded dashboard id from confdb
                this.dbid = db.id;
                this.isDBZoomed = false;
                this.store.dispatch(new LoadDashboardSettings({...db.content.settings, mode: this.snapshot ? 'snap' : 'dashboard'})).subscribe(() => {
                    // update WidgetsState after settings state sucessfully loaded
                    this.store.dispatch(new UpdateWidgets(db.content.widgets));
                });

                // check if Favorited
                // const userFavs = this.store.selectSnapshot(DbfsResourcesState.getUserFavorites);
                // const favCheck = userFavs.findIndex((val: any) => {
                //    return val.id === this.dbid;
                // });
                // this.isUserFavorited = favCheck !== -1;
                if (this.checkUserFavoritedSub) {
                    this.checkUserFavoritedSub.unsubscribe();
                }
                this.checkUserFavorited$ = this.store.select(DbfsResourcesState.checkFileFavorited(this.dbid));
                this.checkUserFavoritedSub = this.checkUserFavorited$.subscribe(val => {
                    this.isUserFavorited = val;
                });
            }
        }));

        this.subscription.add(this.dbPath$.subscribe(path => {

            if (path && path.startsWith('/_new_')) {
                this.dbOwner = this.user;
            }

            // we only need to check of path returned from configdb is not _new_,
            // the router url will point to previous path of clone dashboard
            if (path !== '_new_' && path !== undefined) {
                let fullPath = this.location.path();
                let urlParts = fullPath.split('?');
                const startPath = this.snapshot ? '/snap' : '/d';
                if (urlParts.length > 1) {
                    this.location.replaceState(startPath + path, urlParts[1]);
                } else {
                    this.location.replaceState(startPath + path);
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

                    // reset favorite subs
                    if (this.checkUserFavoritedSub) {
                        this.checkUserFavoritedSub.unsubscribe();
                    }
                    this.checkUserFavorited$ = this.store.select(DbfsResourcesState.checkFileFavorited(this.dbid));
                    this.checkUserFavoritedSub = this.checkUserFavorited$.subscribe(val => {
                        this.isUserFavorited = val;
                    });
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

        this.subscription.add(this.snapshotId$.subscribe(id => {
            if ( id && ( !this.snapshot || ( this.snapshot && id !== this.dbid)) ) {
                window.open('/snap/' + id , '_blank');
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
                this.subscription.add(this.dbService.resolveDBScope(this.tplVariables, widgets, this.variablePanelMode).subscribe(scopes => {
                    this.tplVariables.scopeCache = scopes;
                    // sort widget by grid row, then assign
                    this.widgets = this.utilService.deepClone(widgets);
                    if (!this.snapshot) {
                        this.widgets.sort((a, b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x);
                        // set oldWidgets when widgets is not empty and oldWidgets is empty
                        if (this.widgets.length && this.oldWidgets.length === 0) {
                            this.oldWidgets = [...this.widgets];
                        }
                        // batch
                        for (let i = 0; i < this.widgets.length; i++) {
                            let item: any = this.widgets[i];
                            if (!this.batchSelectedItems[item.id]) {
                                this.batchSelectedItems[item.id] = false;
                            }
                        }
                    } else {
                        this.newWidget = this.widgets[0];
                        this.setSnapshotMeta();
                    }
                }));
                if (!this.isDBScopeLoaded) {
                    this.subscription.add(this.dbService.resolveDBScope(this.tplVariables, widgets, this.variablePanelMode).subscribe(scopes => {
                        this.tplVariables.scopeCache = scopes;
                        this.isDBScopeLoaded = true;
                        this.handleWidgetsLoad(widgets);
                    }));
                } else {
                    this.handleWidgetsLoad(widgets);
                }
            }
        }));


        // initial from state mode is undefine.
        this.subscription.add(this.dashboardMode$.subscribe(mode => {
            this.viewEditMode = !mode || mode === 'dashboard' ? false : true;
            this.cdkService.setNavbarClass( mode === 'explore' ? 'explore' : '');

            // close the clipboard
            if (mode === 'explore') {
                if (this.clipboardMenu.getDrawerState() === 'opened') {
                    this.clipboardMenu.toggleDrawerState({});
                }
            }
        }));

        this.subscription.add(this.dbTime$.subscribe(t => {
            const timeZoneChanged = ((this.isDBZoomed && this.dbTime.zone !== t.zone) || this.dbTime.start === t.start && this.dbTime.end === t.end && this.dbTime.zone !== t.zone );
            if (timeZoneChanged ) {
                this.dbTime.zone = t.zone;
            } else {
                this.isDBZoomed = false;
                this.dbTime = {...t };
                this.dbTime.start = isNaN(t.start) ? this.dbTime.start : this.dateUtil.timestampToTime(t.start, this.dbTime.zone);
                this.dbTime.end = isNaN(t.start) ? this.dbTime.end : this.dateUtil.timestampToTime(t.end, this.dbTime.zone);
            }

            // do not intercom if widgets are still loading
            if (!this.widgets.length && !this.newWidget) {
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
            if ( !timeZoneChanged && !this.viewEditMode ) {
                this.updateURLParams(this.dbTime);
            }
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
        this.subscription.add(this.downSample$.subscribe(downsample => {
            this.dbDownsample = {...this.utilService.deepClone(downsample)};
        }));
        this.subscription.add(this.tot$.subscribe(tot => {
            this.dbToT = tot ? this.utilService.deepClone(tot) : {};
            if (this.isToTChanged && !deepEqual(this.dbPrevToT, this.dbToT) &&
                    ((this.dbToT.value && this.dbToT.period) || (this.dbPrevToT.value && this.dbPrevToT.period && (this.dbToT.value || this.dbToT.period)) )) {
                this.isToTChanged = false;
                this.applyToTChange();
            }
            this.dbPrevToT = this.utilService.deepClone(this.dbToT);
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
                    // tslint:disable-next-line: forin
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


        this.subscription.add(this.userFolderData$.subscribe( (result: any) => {

            if (result && result.loaded) {
                const namespaceCopy = this.utilService.deepClone(result.namespaces);
                namespaceCopy.sort((a: any, b: any) => {
                    return this.utilService.sortAlphaNum(a.name, b.name);
                });
                this.userNamespaces = namespaceCopy;

                if (result.personalFolders && result.personalFolders[0] && result.personalFolders[0].fullPath) {
                    this.user = this.getOwnerFromPath(result.personalFolders[0].fullPath);
                }

                this.setWriteSpaces();
            }
        }));

        // NOTE: we do nothing with this subscription... do we need it?
        this.subscription.add(this.auth$.subscribe(auth => {
            if (auth === 'invalid') {
                // do something?
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

    // to handle widgets after loaded to dashboard itself
    private handleWidgetsLoad(widgets: any) {
        // sort widget by grid row, then assign
        this.widgets = this.utilService.deepClone(widgets);
        if (!this.snapshot) {
            this.widgets.sort((a, b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x);
            // set oldWidgets when widgets is not empty and oldWidgets is empty
            if (this.widgets.length && this.oldWidgets.length === 0) {
                this.oldWidgets = [...this.widgets];
            }
        } else {
            this.newWidget = this.widgets[0];
            this.setSnapshotMeta();
        }
    }

    setSnapshotMeta() {
        setTimeout( () => {
            const dbstate = this.store.selectSnapshot(DBState);
            this.interCom.responsePut({
                action: 'SnapshotMeta',
                payload: {
                            createdBy: dbstate.loadedDB.createdBy, sourceName: dbstate.loadedDB.sourceName,
                            sourceId: dbstate.loadedDB.sourceId, source: dbstate.loadedDB.sourceType,
                            createdTime: this.dateUtil.timestampToTime((dbstate.loadedDB.createdTime / 1000).toString(), this.dbTime.zone)}
            });
        });
    }

    resetWidgetToDashboardSettings() {
        this.editViewModeMeta = {};
        this.dbTime = this.dbWdViewBackup.time;
        this.dbToT = this.dbWdViewBackup.tot;
        this.dbDownsample = this.dbWdViewBackup.downsample;
        this.isDBZoomed = this.dbWdViewBackup.isDBZoomed;
    }

    updateURLParams(p) {
        this.urlOverrideService.applyParamstoURL(p);
    }

    // applyCustomDownsample to widgets when user change
    applyDBDownsample(dsample: any) {
        // deal with copy of widget since we dont want to write to wiget config
        const cloneWidgets = this.utilService.deepClone( this.snapshot ? [this.newWidget] : this.widgets );
        // find all widget that using downsample as auto
        for (let i = 0; i < cloneWidgets.length; i++) {
            const cWidget = cloneWidgets[i];
            const wDownsample = cWidget.settings.time.downsample;
            // only apply to widget which is using auto downsample to override
            if (wDownsample.value === 'auto') {
                this.handleQueryPayload({
                    id: cWidget.id,
                    payload: cWidget
                });
            }
        }
    }
    // call this in query handle to see if we need to override this
    // wDownsample is widget downsample
    applyDBDownsampleToWidget(wDownsample: any) {
        if (wDownsample.value === 'auto') {
            if (this.dbDownsample.aggregators[0] !== '') {
                wDownsample.aggregators = this.dbDownsample.aggregators;
            }
            if (this.dbDownsample.downsample !== 'auto') {
                wDownsample.value = this.dbDownsample.value;
                wDownsample.customUnit = this.dbDownsample.customUnit;
                wDownsample.customValue = this.dbDownsample.customValue;
            }
        }
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
            if ( this.widgets[i].settings.component_type === 'EventsWidgetComponent' )  {
                const search = this.widgets[i].eventQueries[0].search;
                if ( this.widgets[i].eventQueries[0].namespace  && search !== this.applyTplVarsToEventQuery(search) ) {
                    this.handleEventQueryPayload({
                            id: this.widgets[i].id,
                            payload: this.utilService.deepClone({eventQueries: this.widgets[i].eventQueries })
                        });
                }
                continue;
            }
            for (let j = 0; j < queries.length; j++) {
                if (tvars.length > 0) {
                    for (let k = 0; k < tvars.length; k++) {
                        let runQuery = false;
                        for (let a = 0; a < queries[j].filters.length; a++) {
                            const filter = queries[j].filters[a];
                            if (filter.customFilter) {
                                filter.customFilter.forEach(f => {
                                    const hasNot = f[0] === '!';
                                    const alias = f.substring(hasNot ? 2 : 1, f.length - 1);
                                    if (alias === tvars[k].alias) {
                                        runQuery = true;
                                    }
                                });
                            }
                        }
                        if (runQuery) {
                            this.handleQueryPayload({
                                id: this.widgets[i].id,
                                payload: this.widgets[i]
                            });
                            runQuery = false;
                            break;
                        }
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
            this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets)));
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
                        this.store.dispatch(new UpdateWidgets(this.utilService.deepClone(this.widgets)));
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
                            this.tplVariables.editTplVariables.tvars[tplIndex].applied += applied;
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


    applyTplVarsToEventQuery(search) {
        const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;

        if ( tplVars.length ) {
            const re = new RegExp(/\[(.+?)\]/, 'g');
            let matches = [];
            while (matches = re.exec(search)) {
                const alias = '' + matches[1];
                const tplIdx = tplVars.findIndex(tpl => tpl.alias === alias);
                if ( tplIdx >= 0 ) {
                    const idreg = new RegExp('\\[' + alias + '\\]', 'gm');
                    let filter = tplVars[tplIdx].filter || 'regexp(.*)';
                    const res = filter.match(/^regexp\((.*)\)$/);
                    filter = res ? '/' + res[1] + '/' : filter;
                    search = search.replace(idreg, filter);
                }
            }
        }
        return search;
    }

    applyToTChange() {
        const cloneWidgets = this.utilService.deepClone( this.snapshot ? [this.newWidget] : this.widgets );
        // find all widget that using downsample as auto
        for (let i = 0; i < cloneWidgets.length; i++) {
            const cWidget = cloneWidgets[i];
            const settings = cWidget.settings;
            // only apply to linechart widget
            if (settings.component_type === 'LinechartWidgetComponent') {
                this.handleQueryPayload({
                    id: cWidget.id,
                    payload: cWidget
                });
            }
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
            if (this.batchToggle) {
                this.toggleBatchControls();
            }
        } else {
            // also passdown for who need it
            this.interCom.responsePut({
                action: 'TplVariables',
                payload: {
                    tplVariables: this.variablePanelMode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables,
                    tplScope: this.tplVariables.scope
                }
            });
        }
        this.variablePanelMode = {...mode};
    }

    getQuery(message: any) {
        let groupid = '';
        let query = null;
        // make sure we modify the copy for tsdb query
        const payload = this.utilService.deepClone(message.payload);
        // set groupby if multigraph is enabled
        const groupby = (payload.settings.multigraph && payload.settings.multigraph.enabled) ?
            payload.settings.multigraph.chart.filter(d => d.key !== 'metric_group' && d.key !== 'query_group').map(d => d.key) : [];
        const overrideTime = this.isDBZoomed ? payload.settings.time.zoomTime : payload.settings.time.overrideTime;

        const dt =  overrideTime ? this.getDateRange( {...this.dbTime, ...overrideTime} ) : this.getDashboardDateRange();
        if ( this.viewEditMode || this.snapshot ) {
            this.editViewModeMeta['queryDataRange'] = { start: dt.start / 1000, end: dt.end / 1000 };
        } else {
            this.wdMetaData[message.id] = { queryDataRange: { start: dt.start / 1000, end: dt.end / 1000 } };
        }
        if (payload.queries.length) {
            const wType = payload.settings.component_type;
            // override downsample to auto when the dashboard is zoomed
            if (this.isDBZoomed && message.id.indexOf('__EDIT__') === -1 && (wType === 'HeatmapWidgetComponent' || wType === 'LinechartWidgetComponent')) {
                payload.settings.time.downsample.value = 'auto';
            }
            // modify to apply dashboard downsample
            this.applyDBDownsampleToWidget(payload.settings.time.downsample);
            // should we modify the widget if using dashboard tag filter
            const tplVars = this.variablePanelMode.view ? this.tplVariables.viewTplVariables.tvars : this.tplVariables.editTplVariables.tvars;
            // sending each group to get data.
            const queries = {};
            const sources = [];
            for (let i = 0; i < payload.queries.length; i++) {
                let query: any = JSON.parse(JSON.stringify(payload.queries[i]));
                groupid = query.id;
                if (query.namespace && query.settings.visual.visible && query.metrics.length) {
                    // filter only visible metrics, disable it now since it will break the expression
                    // query = this.dbService.filterMetrics(query);
                    // here we need to resolve template variables
                    if (tplVars.length > 0) {
                        if (query.filters.findIndex(f => f.customFilter !== undefined) > -1) {
                            query = this.dbService.resolveTplVarReplace(query, tplVars, this.tplVariables.scopeCache);
                        }
                    }
                    // override the multigraph groupby config
                    for (let j = 0; j < query.metrics.length; j++) {
                        const metricGroupBy = query.metrics[j].groupByTags || [];
                        query.metrics[j].groupByTags = this.utilService.arrayUnique(metricGroupBy.concat(groupby));
                        if (query.metrics[j].settings.visual.visible) {
                            sources.push(query.metrics[j].id);
                        }
                    }
                    queries[i] = query;
                }
            }
            if (Object.keys(queries).length && sources.length) {
                const tot = wType === 'LinechartWidgetComponent' && this.dbToT.period && this.dbToT.value ? this.dbToT : '';
                query = this.queryService.buildQuery(payload, dt, queries, { sources: sources, tot: tot  });
            }
        }
        return query;
    }

    // dispatch payload query by group
    handleQueryPayload(message: any) {
        if (message.payload.queries.length) {
            const gquery: any = {
                wid: message.id,
                isEditMode: this.viewEditMode,
                dbid: this.dbid
            };
            const query = this.getQuery(message);
            if ( query ) {
                gquery.query = query;
                // console.debug("****** DSHBID: " + this.dbid + "  WID: " + gquery.wid);
                // ask widget to loading signal
                this.interCom.responsePut({
                    id: message.payload.id,
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
            const overrideTime = message.payload.settings ? message.payload.settings.time.overrideTime : null;
            const dt = overrideTime ? this.getDateRange( {...this.dbTime, ...overrideTime} ) : this.getDashboardDateRange();
            message.payload.eventQueries[0].search = this.applyTplVarsToEventQuery(message.payload.eventQueries[0].search);
            this.store.dispatch(new GetEvents(
                {   start: dt.start,
                    end: dt.end
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

    getDateRange( range ) {
        const startTime = this.dateUtil.timeToMoment(range.start.toString(), range.zone);
        const endTime = this.dateUtil.timeToMoment(range.end.toString(), range.zone);
        return { start: startTime.valueOf(), end: endTime.valueOf() };
    }

    getDashboardDateRange() {
        return this.getDateRange(this.dbTime);
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
        this.store.dispatch(new UpdateMode('edit'));
        this.newWidget = this.dbService.getWidgetPrototype(selectedWidget.type, this.widgets);
    }


    refresh() {
        this.interCom.responsePut({
            action: 'reQueryData',
            id: this.viewEditMode ? this.editViewModeMeta.id : '',
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
                // let they refresh as they wish.
                this.refresh();
                break;
            case 'SetDBDownsample':
                if ( this.viewEditMode ) {
                    this.dbDownsample = {
                        aggregators: message.payload.aggregators,
                        value: message.payload.downsample,
                        customUnit: message.payload.downsample === 'custom' ? message.payload.customDownsampleUnit : '',
                        customValue: message.payload.downsample === 'custom' ? message.payload.customDownsampleValue : ''
                    };
                    this.refresh();
                } else {
                    this.store.dispatch(new UpdateDownsample(message.payload));
                    this.applyDBDownsample(message.payload);
                }
                break;
            case 'SetToT':
                if ( this.viewEditMode ) {
                    this.dbToT = message.payload;
                    if ( (this.dbToT.value && this.dbToT.period) || (this.dbPrevToT.value && this.dbPrevToT.period && (this.dbToT.value || this.dbToT.period))) {
                        this.refresh();
                    }
                    this.dbPrevToT = this.utilService.deepClone(this.dbToT);
                } else {
                    this.isToTChanged = true;
                    this.store.dispatch(new UpdateToT(message.payload));
                }
                break;
        }
    }

    setDateRange(e: any) {
        this.isDBZoomed = false;
        if ( this.viewEditMode ) {
            this.dbTime = { ...this.dbTime, start: e.startTimeDisplay, end: e.endTimeDisplay } ;
            this.refresh();
        } else {
            this.store.dispatch(new UpdateDashboardTime({ start: e.startTimeDisplay, end: e.endTimeDisplay }));
        }
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

        if ( !this.viewEditMode ) {
            this.store.dispatch(new UpdateDashboardTimeZone(e));
        } else {
            this.dbTime.zone = e;
            this.interCom.responsePut({
                action: 'TimezoneChanged',
                id: this.editViewModeMeta.id,
                payload: { zone: e }
            });
        }
    }

    setTitle(e: any) {
        this.store.dispatch(new UpdateDashboardTitle(e));
    }

    saveSnapshot() {
        let content = this.store.selectSnapshot(DBState);
        content = this.dbService.getStorableFormatFromDBState(content);
        content.settings.time.start = this.editViewModeMeta.queryDataRange.start;
        content.settings.time.end = this.editViewModeMeta.queryDataRange.end;
        content.settings.time.zone = this.dbTime.zone;
        content.settings.tot = this.dbToT;
        content.settings.downsample = this.dbDownsample;
        delete this.newWidget.settings.time.overrideTime;
        content.widgets = [this.newWidget];
        const payload: any = {
            'name': encodeURIComponent(content.settings.meta.title),
            'content': content
        };

        payload.id = this.dbid;
        this.store.dispatch(new SaveSnapshot(this.dbid, payload));
    }

    closeViewEditMode() {
        this.iiService.closeIsland();
        delete this.wData[this.editViewModeMeta.id];
        this.resetWidgetToDashboardSettings();
        this.store.dispatch(new UpdateMode('dashboard'));
        this.rerender = { 'reload': true };
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

    getNamespaceFromPath(fullPath) {
        let namespace = '';
        if ( fullPath && fullPath.indexOf('namespace') !== -1 ) {
            const res = fullPath.split('/');
            namespace = res[2];
        }
        return namespace;
    }

    setWriteSpaces() {
        const writeSpaces = [];
        for (const ns of this.userNamespaces) {
            writeSpaces.push('/namespace/' + ns.name.toLowerCase());
        }
        writeSpaces.push(this.user);
        this.writeSpaces = writeSpaces;
    }

    notifyWidgetLoaderUserHasWriteAccess(userHasWriteAccessToNamespace: boolean) {
            this.interCom.requestSend({
                action: 'WriteAccessToNamespace',
                payload: {userHasWriteAccessToNamespace}
            });
    }

    doesUserHaveWriteAccess() {
        const user = this.store.selectSnapshot(DbfsState.getUser());
        const createdBy = this.store.selectSnapshot(DBState.getCreator);
        if ( !this.snapshot ) {
            if (this.dbOwner && this.dbOwner.length) {
                return this.writeSpaces.includes(this.dbOwner);
            } else {
                return true;
            }
        } else if ( user.userid === createdBy ) {
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
        // dialogConf.backdropClass = 'dashboard-delete-dialog-backdrop';
        // dialogConf.hasBackdrop = true;
        // dialogConf.panelClass = 'dashboard-delete-dialog-panel';
        dialogConf.width = '400px';
        dialogConf.height = '300px';
        dialogConf.autoFocus = true;
        dialogConf.data = {};

        // mat-dialog-container

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
                    // its done;
                });
            }
        });
    }

    getNamespaceNames() {
        const namespaces = [];
        for (const ns of this.userNamespaces) {
            namespaces.push(ns.name);
        }
        return namespaces;
    }

    createAlertFromWidget(message) {
        const namespaces = this.getNamespaceNames();
        // user has only 1 ns with write access
        if (namespaces.length === 1) {
            this.dataShare.setData({widgetId: message.id, widget: message.payload, dashboardId: this.dbid, namespace: namespaces[0], tplVariables: this.tplVariables.viewTplVariables});
            this.dataShare.setMessage('WidgetToAlert');
            this.router.navigate(['a', namespaces[0], '_new_']);
        } else if (namespaces.length > 1) {
            // pick namespace
            const dialogConf: MatDialogConfig = new MatDialogConfig();
            dialogConf.backdropClass = 'dashboard-delete-dialog-backdrop';
            dialogConf.hasBackdrop = true;
            dialogConf.panelClass = 'dashboard-delete-dialog-panel';
            dialogConf.autoFocus = true;
            dialogConf.data = {namespaces: namespaces};

            this.dashboardToAlertDialog = this.dialog.open(DashboardToAlertDialogComponent, dialogConf);
            this.dashboardToAlertDialog.afterClosed().subscribe((dialog_out: any) => {
                if (dialog_out && dialog_out.namespace) {
                    this.dataShare.setData({widgetId: message.id, widget: message.payload, dashboardId: this.dbid, namespace: dialog_out.namespace, tplVariables: this.tplVariables.viewTplVariables});
                    this.dataShare.setMessage('WidgetToAlert');
                    this.router.navigate(['a', dialog_out.namespace, '_new_']);
                }
            });
        }
    }

    downloadDataQuery(message) {
        const ts = new Date().getTime();
        const query = this.getQuery(message);
        const wd = message.payload;
        const data = 'API URL: https://metrics.yamas.ouroath.com:443/api/query/graph\n\n' +
                    'HEADER:\n' +
                    'Content-Type: application/json\n\n' +
                    'CURL: curl -ki --cert /var/lib/sia/certs/<CERT>.cert.pem --key /var/lib/sia/keys/<KEY>.key.pem -X POST -d@<QUERY>.json -H \'Content-Type: application/json\' \'https://metrics.yamas.ouroath.com/api/query/graph\'\n\n' +
                    'QUERY:\n' + JSON.stringify(query);

        const file = new Blob([data], {type: 'text/text'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = wd.settings.title.toLowerCase() + '_query_' + ts + '.txt';
        a.click();
    }

    downloadWidgetData(wd) {
        const ts = new Date().getTime();
        const data = this.wData[wd.id];
        const content = JSON.stringify(data);
        const file = new Blob([content], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = wd.settings.title.toLowerCase() + '_data_' + ts + '.json';
        a.click();
    }

    dashboardFavoriteAction(remove?: boolean) {
        if (remove) {
            // fetch resource from DBFS
            const data: any = this.store.selectSnapshot(DbfsResourcesState.getFileById(this.dbid));
            this.store.dispatch(
                new DbfsRemoveUserFav(
                    data,
                    {
                        method: 'removeFavoriteComplete'
                    }
                )
            );
        } else {
            const dbstate = this.store.selectSnapshot(DBState);
            this.store.dispatch(
                new DbfsAddUserFav({
                    id: dbstate.id,
                    name: dbstate.name,
                    path: dbstate.path,
                    fullPath: dbstate.fullPath,
                    type: 'dashboard',
                    created: Date.now()
                }, {})
            );
        }
    }

    toggleBatchControls() {
        this.batchToggle = !this.batchToggle ? true : false;
        if (!this.batchToggle) {
            let keys = Object.keys(this.batchSelectedItems);
            let selectedItems = {};
            this.batchSelectAll = false;
            this.batchSelectAllIndeterminate = false;

            // deselect everything on batch close
            for(let i = 0; i < keys.length; i++) {
                selectedItems[keys[i]] = false;
            }

            this.batchSelectedItems = selectedItems;
            this.batchSelectedCount = 0;
        }
    }

    batchCopyToClipboard() {
        // show progress in drawer
        this.clipboardMenu.setDrawerOpen();
        this.store.dispatch(new SetShowProgress());

        setTimeout(() => {
            const dbData = this.store.selectSnapshot(DBState.getLoadedDB);

            let widgets: any[] = this.getBatchSelectedItems();

            let widgetLoaders = this.dbContent.widgetLoaders;

            let promises: any[] = [];

            // we have to get the widgetLoaders so we can locate the visualization element to take a snapshot image
            for(let i = 0; i < widgets.length; i++) {
                let loader = widgetLoaders.find((item: any) => {
                    return item.widget.id === widgets[i].id
                });

                const widgetCopy: any = JSON.parse(JSON.stringify(widgets[i]));

                widgetCopy.settings.clipboardMeta = {
                    dashboard: {
                        id: dbData.id,
                        path: dbData.path,
                        fullPath: dbData.fullPath,
                        name: dbData.name
                    },
                    copyDate: Date.now(),
                    referencePath: dbData.path + '@' + widgetCopy.id
                };

                // create preview
                let componentEl: any = loader._component.instance.elRef.nativeElement;
                componentEl.style.backgroundColor = '#ffffff';
                let p = domtoimage.toJpeg(componentEl)
                            .then((dataUrl: any) => {
                                delete componentEl.style.backgroundColor;
                                widgetCopy.settings.clipboardMeta.preview = dataUrl;
                                return widgetCopy;
                            });
                // because preview generation is a promise,
                // we push to array to wait for all promises to resolve with Promise.all
                promises.push(p);

            }

            // allow all promises to resolve before anything else can be done
            Promise.all(promises)
            .then((results) => {

                    // resolve dashboard template variables
                    const resolvedWidgets: any[] = this.resolveDbTplVariablesForClipboard(results);

                    // copy them to clipboard
                    this.store.dispatch(new ClipboardAddItems(resolvedWidgets));

                    // cleanup and resets
                    if (this.clipboardMenu.getDrawerState() === 'closed') {
                        this.clipboardMenu.toggleDrawerState({});
                    }
                    // deselect
                    let keys = Object.keys(this.batchSelectedItems);
                    let selectedItems = {};
                    this.batchSelectAll = false;
                    this.batchSelectAllIndeterminate = false;
                    for(let i = 0; i < keys.length; i++) {
                        selectedItems[keys[i]] = false;
                    }
                    this.batchSelectedCount = 0;
                    this.batchSelectedItems = selectedItems
            })
            .catch((e) => {
                    this.store.dispatch(new SetHideProgress());
                    // Handle errors here?
                    console.error(e);

                    // reset batchSelectItems
                    let keys = Object.keys(this.batchSelectedItems);
                    let selectedItems = {};

                    for(let i = 0; i < keys.length; i++) {
                        selectedItems[keys[i]] = false;
                    }

                    this.batchSelectedCount = (this.batchSelectAll) ? keys.length : 0;
                    this.batchSelectedItems = selectedItems
                });
        }, 100)
    }

    openBatchDeleteDialog() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.backdropClass = 'widget-delete-dialog-backdrop';
        dialogConf.hasBackdrop = true;
        dialogConf.panelClass = 'widget-delete-dialog-panel';

        dialogConf.autoFocus = true;
        dialogConf.data = {
            batch: true,
            selectedCount: this.batchSelectedCount
        };
        this.batchWidgetDeleteDialog = this.dialog.open(WidgetDeleteDialogComponent, dialogConf);
        this.batchWidgetDeleteDialog.afterClosed().subscribe((dialog_out: any) => {
            if ( dialog_out && dialog_out.delete  ) {
                this.batchRemoveWidgets();
            }
        });
    }

    batchRemoveWidgets() {
        let ids: string[] = this.getBatchSelectedIds();

        this.store.dispatch(new DeleteWidgets(ids)).subscribe(() => {

            let keys = Object.keys(this.batchSelectedItems);
            let selectedItems = {};
            this.batchSelectAll = false;
            this.batchSelectAllIndeterminate = false;
            for(let i = 0; i < keys.length; i++) {
                if (!ids.includes(keys[i])) {
                    selectedItems[keys[i]] = false;
                }
            }
            this.batchSelectedCount = 0;
            this.batchSelectedItems = selectedItems
        });
    }

    batchToggleSelectAll() {
        let keys = Object.keys(this.batchSelectedItems);
        let selectedItems = {};

        if (this.batchSelectAll) {
            this.batchSelectAll = false;
            this.batchSelectAllIndeterminate = false;
        } else {
            this.batchSelectAll = true;
            this.batchSelectAllIndeterminate = false;
        }

        // select everything
        for(let i = 0; i < keys.length; i++) {
            selectedItems[keys[i]] = this.batchSelectAll;
        }

        this.batchSelectedCount = (this.batchSelectAll) ? keys.length : 0;
        this.batchSelectedItems = selectedItems

    }

    // get the selected clipboard meta id(s) (stored in widget.settings.clipboardMeta)
    private getBatchSelectedIds(): any[] {
        let keys = Object.keys(this.batchSelectedItems);
        let selected = keys.filter(item => {
            return this.batchSelectedItems[item] === true;
        });
        return selected;
    }

    // get the selected item(s) and return array of widgets selected
    private getBatchSelectedItems(): any[] {
        let ids = this.getBatchSelectedIds();

        let items = this.widgets.filter((item: any) => {
            return ids.includes(item.id);
        });
        return items;
    }

    private checkBatchSelectAll() {
        let ids = this.getBatchSelectedIds();
        if (ids.length === 0) {
            this.batchSelectAll = false;
            this.batchSelectAllIndeterminate = false;
        } else {
            if (ids.length === this.widgets.length) {
                this.batchSelectAll = true;
                this.batchSelectAllIndeterminate = false;
            } else {
                this.batchSelectAll = false;
                this.batchSelectAllIndeterminate = true;
            }
        }
        this.batchSelectedCount = ids.length;
    }

    // util function to generate lookup map to dashboard variables
    private getTplVariablesKeyLookup(): any {
        const rawVariables: any[] = this.tplVariables.viewTplVariables.tvars;
        const variableLookup: any = {};
        for(let i = 0; i < rawVariables.length; i++) {
            let item = rawVariables[i];
            variableLookup['['+item.alias+']'] = item;
        }

        return variableLookup;
    }

    // util to resolve dashboard variables for widgets being moved to clipboard
    private resolveDbTplVariablesForClipboard(widgets: any[]): any[] {
        let dbTplVarLookup = this.getTplVariablesKeyLookup();

        // loop through widgets
        for(let i = 0; i < widgets.length; i++) {
            let widget: any = widgets[i];

            // loop through queries
            for (let q = 0; q < widget.queries.length; q++) {
                let query: any = widget.queries[q];

                // loop through filters
                for (let f = 0; f < query.filters.length; f++) {
                    let filter: any = query.filters[f];

                    // check if there is a custom filter
                    if (filter.customFilter && filter.customFilter.length > 0) {
                        const fkey = filter.customFilter[0];
                        const fval = dbTplVarLookup[fkey].filter ? dbTplVarLookup[fkey].filter : undefined;
                        const fvalScope = dbTplVarLookup[fkey].scope ? dbTplVarLookup[fkey].scope : undefined;
                        filter.customFilter = [];

                        // check if there is a set values
                        if (fval && fval.length > 0) {
                            filter.filter[0] = dbTplVarLookup[fkey].filter;
                        // no value, so check for scoped values
                        } else if(fvalScope && fvalScope.length > 0) {
                            filter.filter = fvalScope;
                        // else, just make it empty array
                        } else {
                            filter.filter = [];
                        }
                    }
                }
            }
        }

        return widgets;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.utilService.setTabTitle();
        this.iiService.closeIsland();
    }
}
