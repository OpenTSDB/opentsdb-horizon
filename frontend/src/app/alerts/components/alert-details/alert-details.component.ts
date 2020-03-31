import {
    Component,
    OnInit,
    OnDestroy,
    HostBinding,
    ViewChild,
    ElementRef,
    TemplateRef,
    AfterContentInit, EventEmitter,
    Output,
    Input,
    ChangeDetectorRef,
    AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, FormsModule, NgForm } from '@angular/forms';
import { ElementQueries, ResizeSensor} from 'css-element-queries';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatTableDataSource } from '@angular/material';
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef
} from '@angular/material';

import { Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { NameAlertDialogComponent } from '../name-alert-dialog/name-alert-dialog.component';
import { IDygraphOptions } from '../../../shared/modules/dygraphs/IDygraphOptions';
import { QueryService } from '../../../core/services/query.service';
import { HttpService } from '../../../core/http/http.service';
import { UtilsService } from '../../../core/services/utils.service';
import { MetaService } from '../../../core/services/meta.service';
import { DatatranformerService } from '../../../core/services/datatranformer.service';
import { ErrorDialogComponent } from '../../../shared/modules/sharedcomponents/components/error-dialog/error-dialog.component';
import { pairwise, startWith } from 'rxjs/operators';
import { IntercomService } from '../../../core/services/intercom.service';
import { AlertConverterService } from '../../services/alert-converter.service';
import { CdkService } from '../../../core/services/cdk.service';
import { DateUtilsService } from '../../../core/services/dateutils.service';
import { TemplatePortal } from '@angular/cdk/portal';
import { AlertDetailsMetricPeriodOverPeriodComponent } from './children/alert-details-metric-period-over-period/alert-details-metric-period-over-period.component';
import * as d3 from 'd3';
import { ThemeService } from '../../../app-shell/services/theme.service';
import { DataShareService } from '../../../core/services/data-share.service';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { environment } from "../../../../environments/environment";

@Component({
// tslint:disable-next-line: component-selector
    selector: 'alert-details',
    templateUrl: './alert-details.component.html',
    styleUrls: []
})

export class AlertDetailsComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
    @HostBinding('class.alert-details-component') private _hostClass = true;

    @ViewChild('graphOutput') private graphOutput: ElementRef;
    @ViewChild('graphLegend') private dygraphLegend: ElementRef;
    @ViewChild('eventSearchControl') private eventSearchControl: ElementRef;
    @ViewChild('alertDateTimeNavbarItemTmpl') alertDateTimeNavbarItemTmpl: TemplateRef<any>;
    @ViewChild('periodOverPeriodForm') periodOverPeriodForm: AlertDetailsMetricPeriodOverPeriodComponent;

    @Input() response;

    @Input() viewMode: string = ''; // edit || clone || view

    @Input() hasWriteAccess: boolean = false;

    get readOnly(): boolean {
        if (!this.hasWriteAccess) { return true; }
        return (this.viewMode === 'edit' || this.viewMode === 'clone') ? false : true;
    }

    @Output() configChange = new EventEmitter();

    // placeholder for expected data from dialogue initiation
    @Input() data: any = {
        namespace: '',
        name: 'Untitled Alert',
        queries: []
    };

    // metric query?
    queries = [];
    tags: string[];

    // DYGRAPH OPTIONS
    options: IDygraphOptions = {
        labels: ['x'],
        labelsUTC: false,
        labelsKMB: true,
        connectSeparatedPoints: true,
        isCustomZoomed: false,
        drawPoints: false,
        //  labelsDivWidth: 0,
        // legend: 'follow',
        logscale: false,
        digitsAfterDecimal: 2,
        stackedGraph: false,
        strokeWidth: 1,
        strokeBorderWidth: 1,
        highlightSeriesOpts: {
            strokeWidth: 3,
            highlightCircleSize: 7
        },
        highlightSeriesBackgroundColor: 'rgb(255, 255, 255)',
        xlabel: '',
        ylabel: '',
        y2label: '',
        axisLineWidth: 0,
        axisTickSize: 0,
        axisLineColor: '#fff',
        axes: {
            y: {
                valueRange: [null, null],
                tickFormat: { precision: 'auto'}
            },
            y2: {
                valueRange: [null, null],
                drawGrid: true,
                independentTicks: true,
                tickFormat: {}
            }
        },
        series: {},
        visibility: [],
        visibilityHash: {},
        gridLineColor: '#ccc',
    };
    queryData: any = {};
    chartData = { ts: [[0]] };
    size: any = {
        height: 180
    };

    recipients = {'slack' : [{'name': 'yamas_dev'}], 'oc': [{'name': 'oc red'}]};

    thresholds: any = { };
    thresholdType: String = '';
    // tslint:disable-next-line:no-inferrable-types
    showThresholdAdvanced: boolean = false; // toggle in threshold form

    // FORM STUFF
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    alertName: FormControl = new FormControl('');
    alertForm: FormGroup;

    // Period Over Period STUFF
    periodOverPeriodConfig: any = {};
    periodOverPeriodTransitionsSelected = [];
    periodOverPeriodTransitionsEnabled = [];

    // form control options
    ocSeverityOptions: any[] = [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' }
    ];

    ocTierOptions: any[] = [
        { label: 'Tier 1 - OC', value: '1' },
        { label: 'Tier 2 - SRE', value: '2' },
        { label: 'Tier 3 - PE', value: '3' },
        { label: 'Tier 4 - Dev', value: '4' }
    ];

    opsGeniePriorityOptions: any[] = [
        { label: 'P1', value: 'P1' },
        { label: 'P2', value: 'P2' },
        { label: 'P3', value: 'P3' },
        { label: 'P4', value: 'P4' },
        { label: 'P5', value: 'P5' }
    ];

    defaultOpsGeniePriority = 'P5';
    defaultOCSeverity = '5';
    defaultOCTier = '1';
    defaultSlidingWindowSize = '300';
    defaultEventSlidingWindowSize = '600';

    // disply aura status counts
    counts = [];
    countSub: Subscription;

    // when creating alert from dashboard widget
    dashboardToCancelTo = -1;
    createdFrom = {};

    alertOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    recoverOptions: any[] = [
                                { label: 'Never', value: null },
                                { label: 'After 1 hour', value: 60 * 60 },
                                { label: 'After 2 hours', value: 120 * 60 },
                                { label: 'After 4 hours', value: 240 * 60 },
                                { label: 'After 8 hours', value: 480 * 60 },
                                { label: 'After 12 hours', value: 720 * 60 },
                                { label: 'After 24 hours', value: 1440 * 60 }
                            ];
    maxTimeRange = 172801;
    dsTimeRange = {
                    60: { value: 1, unit: 'hours', label: '1h'}, // 1m
                    300: { value: 2, unit: 'hours', label: '2h'}, // 5m
                    600: { value: 4, unit: 'hours', label: '4h'}, // 10min
                    900: { value: 6, unit: 'hours', label: '6h'}, // 15min
                    1800: { value: 12, unit: 'hours', label: '12h'}, // 30m
                    3600: { value: 1, unit: 'days', label: '1d'}, // 1hr
                    21600: { value: 6, unit: 'days', label: '6d'}, // 6hr
                    43200: { value: 12, unit: 'days', label: '12d'}, // 12 hr
                    86400: { value: 2, unit: 'weeks', label: '2w'}, // 24 hr
                    172800: { value: 4, unit: 'weeks', label: '4w'}, // 48 hr
                    172801: { value: 8, unit: 'weeks', label: '8w'}  // more than 48 hr
                };

    slidingWindowToDSTimeRange(seconds) {
        const validTimeRanges = [60, 300, 600, 900, 1800, 3600, 21600, 43200, 86400, 172800];
        for (const validTimeRange of validTimeRanges) {
            if (seconds <= validTimeRange) {
                return validTimeRange;
            }
        }
        return this.maxTimeRange;
    }

    transitionOptions: any = {
                                'goodToBad' : 'Good To Bad',
                                'warnToBad' : 'Warn To Bad',
                                'warnToGood' : 'Warn To Good',
                                'badToGood' : 'Bad to Good',
                                'goodToWarn' : 'Good To Warn',
                                'badToWarn' : 'Bad to Warn',
                                'goodToUnknown' : 'Good To Unknown',
                                'UnknownToGood' : 'Unknown To Good',
                                'badToUnknown' : 'Bad To Unknown',
                                'UnknownToBad' : 'Unknown To Bad',
                                'warnToUnknown' : 'Warn To Unknown',
                                'UnknownToWarn' : 'Unknown To Warn'
                            };
    sub: Subscription;
    nQueryDataLoading = 0;
    showDetail = false;

    // DIALOGUES
    nameAlertDialog: MatDialogRef<NameAlertDialogComponent> | null;

    error: any;
    errorDialog: MatDialogRef<ErrorDialogComponent> | null;

    // tslint:disable-next-line:no-inferrable-types
    activeTabIndex: number = 0;
    private subscription: Subscription = new Subscription();

    // FOR DISPLAY ONLY VIEW - metric columns
    metricTableDisplayColumns: string[] = [
        'metric-index',
        'name',
        'modifiers'
    ];

    events: any = [];
    startTime;
    endTime;
    prevDateRange: any = null;
    alertspageNavbarPortal: TemplatePortal;
    alertEvaluationLink: string;

    doEventQuery$ = new BehaviorSubject(['list', 'count']);
    eventQuery: any = { namespace: '', search: ''};


    constructor(
        private fb: FormBuilder,
        private queryService: QueryService,
        private metaService: MetaService,
        private httpService: HttpService,
        private dataTransformer: DatatranformerService,
        private dateUtil: DateUtilsService,
        private cdkService: CdkService,
        private utils: UtilsService,
        private elRef: ElementRef,
        public dialog: MatDialog,
        private interCom: IntercomService,
        private alertConverter: AlertConverterService,
        private cdRef: ChangeDetectorRef,
        private themeService: ThemeService,
        private dataShare: DataShareService,
        private router: Router,
        private location: LocationStrategy
    ) {
        // this.data = dialogData;
        if (this.data.name) {
            this.alertName.setValue(this.data.name);
        }

        // back button on browser goes to overview page
        location.onPopState(() => {
            this.configChange.emit({
                action: 'CancelEdit'
            });
          });
    }

    ngOnInit() {
        this.alertspageNavbarPortal = new TemplatePortal(this.alertDateTimeNavbarItemTmpl, undefined, {});
        this.cdkService.setNavbarPortal(this.alertspageNavbarPortal);

        this.subscription.add(this.themeService.getThemeType().subscribe( themeType => {
            this.options = {...this.options,
                highlightSeriesBackgroundColor: (themeType === 'light') ? 'rgb(255,255,255)' : 'rgb(60,75,90)'
            };
            this.cdRef.markForCheck();
        }));

        this.options.labelsDiv = this.dygraphLegend.nativeElement;
        this.subscription.add(this.doEventQuery$
            .pipe(
                skip(1),
                debounceTime(1000)
            )
            .subscribe(list => {
                this.doEventQuery(list);
            })
        );
        if ( this.data.id ) {
            this.data.createdTime = this.dateUtil.timestampToTime((this.data.createdTime / 1000).toString(), 'local');
            this.data.updatedTime = this.dateUtil.timestampToTime((this.data.updatedTime / 1000 ).toString(), 'local');
        }
        switch ( this.data.type ) {
            case 'simple':
                this.thresholdType = 'singleMetric';
                this.setupForm(this.data);
                break;
            case 'healthcheck':
                this.thresholdType = 'healthCheck';
                this.setupHealthCheckForm(this.data);
                break;
            case 'event':
                this.thresholdType = 'eventAlert';
                this.setupEventForm(this.data);
                break;
        }

        if (this.data.name) {
            this.utils.setTabTitle(this.data.name);
        }

        if (this.dataShare.getMessage() === 'WidgetToAlert') {
            this.dashboardToCancelTo = this.dataShare.getData().dashboardId;
            this.createdFrom = {widgetId: this.dataShare.getData().widgetId, dashboardId: this.dataShare.getData().dashboardId };
            this.dataShare.clear();
        }

        this.getCount();
        this.setAlertEvaluationLink();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if ( this.sub ) {
            this.sub.unsubscribe();
        }
        if ( this.countSub ) {
            this.countSub.unsubscribe();
        }
        this.utils.setTabTitle();
    }

    ngAfterContentInit() {
        ElementQueries.listen();
        ElementQueries.init();
        const resizeSensor = new ResizeSensor(this.elRef.nativeElement, (size) => {
             const newSize = {
                width: size.width * ( this.data.type === 'event' ? 0.65 : 1 ) - 5,
                height: 160
            };
            this.size = newSize;
        });
    }

    ngAfterViewInit() {
        if (this.dashboardToCancelTo > 0) {
            this.validate(false);
        }
    }

    newSingleMetricTimeWindowSelected(timeInSeconds: string) {
        this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['slidingWindow'].setValue(timeInSeconds);
    }

    periodOverPeriodChanged(periodOverPeriodConfig) {
        if (periodOverPeriodConfig.thresholdChanged) {
            this.determineEnabledTransitions(periodOverPeriodConfig.config.periodOverPeriod);
        }
        if (periodOverPeriodConfig.requeryData) {
            this.reloadData();
        }
        this.periodOverPeriodConfig = {... periodOverPeriodConfig.config};
    }

    periodOverPeriodSelectedTransitionsChanged(transitions) {
        this.periodOverPeriodTransitionsSelected = [...transitions];
    }

    determineEnabledTransitions(config) {
        this.periodOverPeriodTransitionsEnabled = [];
        const upperBad: boolean = config.badUpperThreshold !== '';
        const upperWarn: boolean = config.warnUpperThreshold !== '';
        const lowerWarn: boolean = config.warnLowerThreshold !== '';
        const lowerBad: boolean = config.badLowerThreshold !== '';

        if (upperBad || lowerBad) {
            this.utils.addTransitions(this.periodOverPeriodTransitionsEnabled, ['BadToGood', 'GoodToBad']);
        }
        if (upperWarn || lowerWarn) {
            this.utils.addTransitions(this.periodOverPeriodTransitionsEnabled, ['WarnToGood', 'GoodToWarn']);
        }
        if ((upperBad || lowerBad) && (upperWarn || lowerWarn)) {
            this.utils.addTransitions(this.periodOverPeriodTransitionsEnabled, ['BadToWarn', 'WarnToBad']);
        }
        this.periodOverPeriodTransitionsSelected = [...this.periodOverPeriodTransitionsEnabled];
    }

    setupForm(data = null) {
        if (data && data.threshold && data.threshold.subType === 'periodOverPeriod') {
            this.determineEnabledTransitions(data.threshold.periodOverPeriod);
            this.periodOverPeriodTransitionsSelected = [...data.notification.transitionsToNotify];
            this.periodOverPeriodConfig = {...data.threshold};
        }
        const def = {
                threshold : { singleMetric: {} },
                notification: {},
                queries: { raw: {}, tsdb: {}}
            };
        data = Object.assign(def, data);
        this.showDetail = data.id ? true : false;
        this.startTime =  '1h';
        this.endTime = 'now';
        this.setQuery();

        // TODO: need to check if there is something in this.data
        const bad = data.threshold.singleMetric.badThreshold !== undefined ? data.threshold.singleMetric.badThreshold : null;
        const warn = data.threshold.singleMetric.warnThreshold !== undefined ? data.threshold.singleMetric.warnThreshold : null;
        const recover = data.threshold.singleMetric.recoveryThreshold !== undefined ? data.threshold.singleMetric.recoveryThreshold : null;
        const notifyOnMissing = data.threshold.notifyOnMissing ? data.threshold.notifyOnMissing.toString() : 'false';
        this.alertForm = this.fb.group({
            name: data.name || 'Untitled Alert',
            type: data.type || 'simple',
            enabled: data.enabled === undefined ? true : data.enabled,
            alertGroupingRules: [ data.alertGroupingRules || []],
            labels: this.fb.array(data.labels || []),

            threshold: this.fb.group({
                subType: data.threshold.subType || 'singleMetric',
                nagInterval: data.threshold.nagInterval || '0',
                notifyOnMissing: notifyOnMissing,
                autoRecoveryInterval: data.threshold.autoRecoveryInterval || 'null',
                delayEvaluation: data.threshold.delayEvaluation || 0,
                singleMetric: this.fb.group({
                    queryIndex: data.threshold.singleMetric.queryIndex || -1 ,
                    queryType : data.threshold.singleMetric.queryType || 'tsdb',
                    // tslint:disable-next-line:max-line-length
                    metricId: [ data.threshold.singleMetric.metricId ? this.utils.getMetricDropdownValue(data.queries.raw, data.threshold.singleMetric.metricId) : ''],
                    badThreshold:  bad,
                    warnThreshold: warn,
                    requiresFullWindow: data.threshold.singleMetric.requiresFullWindow || false,
                    reportingInterval: data.threshold.singleMetric.reportingInterval || null,
                    recoveryThreshold: recover,
                    recoveryType: data.threshold.singleMetric.recoveryType || 'minimum',
                    // tslint:disable-next-line:max-line-length
                    slidingWindow : data.threshold.singleMetric.slidingWindow ? data.threshold.singleMetric.slidingWindow.toString() : this.defaultSlidingWindowSize,
                    comparisonOperator : data.threshold.singleMetric.comparisonOperator || 'above',
                    timeSampler : data.threshold.singleMetric.timeSampler || 'at_least_once'
                })
            }, this.validateSingleMetricThresholds),
            notification: this.fb.group({
                transitionsToNotify: [ data.notification.transitionsToNotify || []],
                recipients: [ data.notification.recipients || {}],
                subject: data.notification.subject  || '',
                body: data.notification.body || '',
                opsgeniePriority:  data.notification.opsgeniePriority || this.defaultOpsGeniePriority,
                // opsgenieTags: data.notification.opsgenieTags || '',
                // OC conditional values
                runbookId: data.notification.runbookId || '',
                ocSeverity: data.notification.ocSeverity || this.defaultOCSeverity,
                ocTier: data.notification.ocTier || this.defaultOCTier
            })
        });
        this.setTags();
        this.reloadData();

        // need to 'set' values to start the value watching from the start
        // Ideally you create the fromgroup first, then set values to get correct valueChange events
        // This is to fix the issue of there not being a first change event
        this.alertForm['controls'].threshold['controls'].singleMetric.get('badThreshold')
            .setValue(bad, { emitEvent: true });

        this.alertForm['controls'].threshold['controls'].singleMetric.get('warnThreshold')
            .setValue(warn, { emitEvent: true });

        this.setThresholds('bad', bad);
        this.setThresholds('warning', warn);
        this.setThresholds('recovery', recover);

        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['comparisonOperator'].valueChanges.subscribe(val => {
            this.thresholdSingleMetricControls['warnThreshold'].setErrors(null);
            this.thresholdSingleMetricControls['recoveryThreshold'].setErrors(null);
        }));

        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['badThreshold'].valueChanges
            .pipe(
                startWith(this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['badThreshold'].value),
                pairwise()
            ).subscribe(([prev, bad]: [any, any]) => {
                this.setThresholds('bad', bad);
                let possibleTransitions =  ['goodToBad', 'badToGood', 'warnToBad', 'badToWarn'];
                const transitions = this.alertForm['controls'].notification.get('transitionsToNotify').value;
                if ( bad === null ) {
                    // remove possible transitions (if any were selected)
                    this.alertForm['controls'].notification.get('transitionsToNotify')
                        .setValue(transitions.filter(d => !possibleTransitions.includes(d) ));
                } else if (prev === null && bad !== null) {
                    // In case warn threshold is empty, do not check warn/bad combos
                    if (this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['warnThreshold'].value === null) {
                        possibleTransitions = possibleTransitions.filter(d => !d.toLowerCase().includes('warn'));
                    }
                    // if it was previously empty/null, then turn on the default transitions
                    this.alertForm['controls'].notification.get('transitionsToNotify')
                        .setValue(transitions.concat(possibleTransitions));
                }
                this.thresholdSingleMetricControls['warnThreshold'].setErrors(null);
                this.thresholdSingleMetricControls['recoveryThreshold'].setErrors(null);
            }));

        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['warnThreshold'].valueChanges
            .pipe(
                startWith(this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['warnThreshold'].value),
                pairwise()
            ).subscribe(([prev, warn]: [any, any]) => {
                this.setThresholds('warning', warn);
                let possibleTransitions = ['warnToBad', 'badToWarn', 'warnToGood', 'goodToWarn'];
                const transitions = this.alertForm['controls'].notification.get('transitionsToNotify').value;
                if ( warn === null ) {
                    // remove possible transitions (if any were selected)
                    this.alertForm['controls'].notification.get('transitionsToNotify')
                        .setValue(transitions.filter(d => !possibleTransitions.includes(d)));
                } else if (prev === null && warn !== null) {
                    // In case bad threshold is empty, do not check warn/bad combos
                    if (this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['badThreshold'].value === null) {
                        possibleTransitions = possibleTransitions.filter(d => !d.toLowerCase().includes('bad'));
                    }
                    // if it was previously empty/null, then turn on the default transitions
                    this.alertForm['controls'].notification.get('transitionsToNotify')
                        .setValue(transitions.concat(possibleTransitions));
                }
                this.thresholdSingleMetricControls['recoveryThreshold'].setErrors(null);
            }));

        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['recoveryThreshold'].valueChanges.subscribe(val => {
            this.setThresholds('recovery', val);
        }));

        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['recoveryType'].valueChanges.subscribe(val => {
            this.thresholdSingleMetricControls['recoveryThreshold'].setErrors(null);
            // tslint:disable-next-line:max-line-length
            this.setThresholds('recovery', val === 'specific' ? this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['recoveryThreshold'].value : '');
        }));

        // tslint:disable-next-line: max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['singleMetric']['controls']['metricId'].valueChanges.subscribe(val => {
            this.metricIdChanged(val);
        }));

        // tslint:disable-next-line: max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['notifyOnMissing'].valueChanges.subscribe(val => {
            if ( val === 'true' ) {
                this.alertForm.controls['threshold']['controls']['autoRecoveryInterval'].setValue('null');
                this.alertForm.controls['threshold']['controls']['autoRecoveryInterval'].disable();
            } else {
                this.alertForm.controls['threshold']['controls']['autoRecoveryInterval'].enable();
            }
        }));

        this.alertForm['controls'].threshold.get('notifyOnMissing').setValue( notifyOnMissing, { emitEvent: true});
        if (!this.data.threshold) {
            this.data.threshold = {};
        }
    }

    metricIdChanged(mid) {
        const [qindex, mindex] = mid ? this.utils.getMetricIndexFromId(mid, this.queries) : [null, null];
        const gValues = this.alertForm.get('alertGroupingRules').value;
        if ( mid && gValues.length ) {
            let tags = this.getMetricGroupByTags(qindex, mindex);
            tags = tags.filter(v => gValues.includes(v));
            this.alertForm.get('alertGroupingRules').setValue(tags);
        } else {
            this.alertForm.get('alertGroupingRules').setValue([]);
        }
        this.setTags();
        this.reloadData();
    }

    setupHealthCheckForm(data = null) {
        const def = {
                threshold : { healthCheck: {} },
                notification: {},
                queries: { aura: [] }
            };
        data = Object.assign(def, data);
        this.showDetail = data.id ? true : false;
        this.showThresholdAdvanced = data.threshold.nagInterval > 0 ? true : false;
        this.setQuery();
        this.alertForm = this.fb.group({
            name: data.name || 'Untitled Alert',
            type: 'healthcheck',
            enabled: data.enabled === undefined ? true : data.enabled,
            alertGroupingRules: [ data.alertGroupingRules || []],
            labels: this.fb.array(data.labels || []),
            threshold: this.fb.group({
                subType: data.threshold.subType || 'healthCheck',
                nagInterval: data.threshold.nagInterval || '0',
                notifyOnMissing: data.threshold.notifyOnMissing ? data.threshold.notifyOnMissing.toString() : 'false',
                missingDataPurgeInterval: data.threshold.missingDataPurgeInterval || null,
                missingDataInterval: data.threshold.missingDataInterval || null,
                healthCheck: this.fb.group({
                    queryIndex: 0,
                    queryType : 'aura',
                    badThreshold:  data.threshold.healthCheck.badThreshold || null,
                    recoveryThreshold: data.threshold.healthCheck.recoveryThreshold || 1,
                    warnThreshold: data.threshold.healthCheck.warnThreshold || null,
                    unknownThreshold: data.threshold.healthCheck.unknownThreshold || null,
                })
            }),
            notification: this.fb.group({
                transitionsToNotify: [ data.notification.transitionsToNotify || []],
                recipients: [ data.notification.recipients || {}],
                subject: data.notification.subject  || '',
                body: data.notification.body || '',
                opsgeniePriority:  data.notification.opsgeniePriority || this.defaultOpsGeniePriority,
                // opsgenieTags: data.notification.opsgenieTags || '',
                // OC conditional values
                runbookId: data.notification.runbookId || '',
                ocSeverity: data.notification.ocSeverity || this.defaultOCSeverity,
                ocTier: data.notification.ocTier || this.defaultOCTier
            })
        });
        this.setTags();
        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['healthCheck']['controls']['badThreshold'].valueChanges
                .subscribe( bad => {
                    const transitions = this.alertForm['controls'].notification.get('transitionsToNotify').value;
                    if ( !bad ) {
                        // remove possible transitions (if any were selected)
                        this.alertForm['controls'].notification.get('transitionsToNotify')
                            .setValue(transitions.filter(d => !d.toLowerCase().includes('bad') ));
                    }
                }));
        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['healthCheck']['controls']['warnThreshold'].valueChanges
                .subscribe( warn => {
                    const transitions = this.alertForm['controls'].notification.get('transitionsToNotify').value;
                    if ( !warn ) {
                        this.alertForm['controls'].notification.get('transitionsToNotify')
                            .setValue(transitions.filter(d => !d.toLowerCase().includes('warn') ));
                    }
                }));
        // tslint:disable-next-line:max-line-length
        this.subscription.add(<Subscription>this.alertForm.controls['threshold']['controls']['healthCheck']['controls']['unknownThreshold'].valueChanges
                .subscribe( unknown => {
                    const transitions = this.alertForm['controls'].notification.get('transitionsToNotify').value;
                    if ( !unknown ) {
                        this.alertForm['controls'].notification.get('transitionsToNotify')
                            .setValue(transitions.filter(d => !d.toLowerCase().includes('unknown') ));
                    }
                }));
    }

    newEventTimeWindowSelected(timeInSeconds: string) {
        this.alertForm.controls['threshold']['controls']['eventAlert']['controls']['slidingWindow'].setValue(timeInSeconds);
    }

    setupEventForm(data = null) {
        const def = {
                queries: { eventdb: [{}] },
                threshold : { eventAlert: {} },
                notification: {}
            };
        data = Object.assign(def, data);
        this.showDetail = data.id ? true : false;
        this.alertForm = this.fb.group({
            name: data.name || 'Untitled Alert',
            type: 'event',
            enabled: data.enabled === undefined ? true : data.enabled,
            namespace: data.namespace || null,
            alertGroupingRules: [ data.alertGroupingRules || []],
            labels: this.fb.array(data.labels || []),
            queries: this.fb.group({
                eventdb: this.fb.array([
                        this.fb.group({
                            namespace: data.queries.eventdb[0].namespace || '',
                            filter: data.queries.eventdb[0].filter || '',
                            groupBy: [data.queries.eventdb[0].groupBy || []]})
                    ])
            }),
            threshold: this.fb.group({
                subType: data.threshold.subType || 'eventAlert',
                eventAlert: this.fb.group({
                    queryType: 'eventdb',
                    queryIndex: 0,
                    threshold: data.threshold.eventAlert.threshold || 1,
                    slidingWindow: data.threshold.eventAlert.slidingWindow || this.defaultEventSlidingWindowSize
                })
            }),
            notification: this.fb.group({
                transitionsToNotify: [ data.notification.transitionsToNotify || ['goodToBad']],
                recipients: [ data.notification.recipients || {}],
                subject: data.notification.subject  || '',
                body: data.notification.body || '',
                opsgeniePriority:  data.notification.opsgeniePriority || this.defaultOpsGeniePriority,
                runbookId: data.notification.runbookId || '',
                ocSeverity: data.notification.ocSeverity || this.defaultOCSeverity,
                ocTier: data.notification.ocTier || this.defaultOCTier
            })
        });
        this.options.axes.y.valueRange[0] = 0;
        // tslint:disable-next-line:max-line-length
        this.startTime =  this.dsTimeRange[this.slidingWindowToDSTimeRange(this.alertForm.get('threshold').get('eventAlert').get('slidingWindow').value)].label;
        this.endTime = 'now';
        this.doEventQuery$.next(['list', 'count']);
        this.setThresholds('bad', data.threshold.eventAlert.threshold || 1);
        this.setTags();

        this.alertForm.get('threshold').get('eventAlert').get('slidingWindow').valueChanges.subscribe(value => {
            // tslint:disable-next-line:max-line-length
            this.startTime =  this.dsTimeRange[this.slidingWindowToDSTimeRange(this.alertForm.get('threshold').get('eventAlert').get('slidingWindow').value)].label;
            this.endTime = 'now';
            this.doEventQuery$.next(['list', 'count']);
        });
        this.alertForm.get('queries').get('eventdb')['controls'][0].valueChanges.subscribe(changes => {
            this.doEventQuery$.next(['list', 'count']);
        });
        this.alertForm.get('threshold').get('eventAlert').get('threshold').valueChanges.pipe(debounceTime(500)).subscribe(value => {
            this.setThresholds('bad', value);
        });
    }

    setQuery() {
        this.queries = this.data.queries && this.data.queries.raw ? this.data.queries.raw : [ this.getNewQueryConfig() ];
    }

    addNewQuery() {
        this.queries.push(this.getNewQueryConfig());
    }

    cloneQuery(qid) {
        const qindex = this.queries.findIndex(d => d.id === qid);
        if ( qindex !== -1 ) {
            const query = this.utils.getQueryClone(this.queries, qindex);
            this.queries.splice(qindex + 1, 0, query);
        }
    }

    deleteQuery(qid) {
        const [ qidx, midx ] = this.utils.getMetricIndexFromId(this.thresholdSingleMetricControls.metricId.value, this.queries);
        const qindex = this.queries.findIndex(d => d.id === qid);
        if ( qidx === qindex ) {
            this.thresholdSingleMetricControls.metricId.setValue('', { onlySelf: true, emitEvent: false });
        }
        this.queries.splice(qindex, 1);
    }

    deleteQueryMetric(qid, mid) {
        const qindex = this.queries.findIndex(d => d.id === qid);
        if (this.queries[qindex]) {
            const mindex = this.queries[qindex].metrics.findIndex(d => d.id === mid);
            if ( mid === this.thresholdSingleMetricControls.metricId.value ) {
                this.thresholdSingleMetricControls.metricId.setValue('', { onlySelf: true, emitEvent: false });
            }
            this.queries[qindex].metrics.splice(mindex, 1);
        }
    }

    toggleInfectiousNan(checked) {
        for ( let i = 0; i < this.queries.length; i++ ) {
            this.queries[i].settings.infectiousNan = checked;
        }
        this.reloadData();
    }

    getNewQueryConfig() {
        const query: any = {
            id: this.utils.generateId(6, this.utils.getIDs(this.queries)),
            namespace: '',
            metrics: [],
            filters: [],
            settings: {
                visual: {
                    visible: true
                }
            }
        };
        return query;
    }

    doEventQuery(list) {
        const id = 'q1_m1';
        let namespace = this.alertForm.get('queries').get('eventdb')['controls'][0].get('namespace').value;
        namespace = namespace !== null ? namespace.trim() : '';
        const filter = this.alertForm.get('queries').get('eventdb')['controls'][0].get('filter').value;
        const downsample = this.alertForm.get('threshold').get('eventAlert').get('slidingWindow').value;
        const query = {
                        id: id,
                        namespace: namespace,
                        search: filter,
                        };
        const eventQueries = [];
        if ( list.includes('list') && namespace ) {
            eventQueries.push( query);
        }
        if ( list.includes('count') && namespace) {
            eventQueries.push( { ...query } ); // spread operator inserts new object, changes to it doesn't affect origin query obj
            eventQueries[1].id = id + '_count';
            eventQueries[1].downSample = { aggregator: 'sum', value: (downsample / 60) + 'm'};
        }
        const time = {
            start: this.dateUtil.timeToMoment(this.startTime, 'local').valueOf(),
            end: this.dateUtil.timeToMoment(this.endTime, 'local').valueOf()};
        if ( eventQueries.length ) {
            this.nQueryDataLoading = 1;
            this.error = '';
            this.httpService.getEvents('123', time, eventQueries, 100).subscribe(res => {
                this.events = res.events;
                const config = {
                    queries: [{ settings: { visual: {visible: true}}, metrics: [{name: 'count', settings: {visual: {type: 'bar', color:'#1aa3ff', visible: true}}}]}],
                    settings: {
                        axes: {
                            y1: {},
                            y2: {}
                        }
                    }
                };
                this.options.labels = ['x'];
                const data = this.dataTransformer.yamasToDygraph(config, this.options, [[0]], res.counts);
                // we are expecting one series. the max logic needs to changed when we support group by
                let max = 0, min = Infinity;
                if ( res.counts.results.length && res.counts.results[0].data.length) {
                    for ( let i = 0; i < res.counts.results[0].data[0].NumericType.length - 1; i++ ) { // we ignore the last point
                        const d = res.counts.results[0].data[0].NumericType[i];
                        max = !isNaN(d) && d > max ? d : max;
                        min = !isNaN(d) && d < min ? d : min;
                    }
                }
                this.options.axes.y.tickFormat.max = max;
                this.options.axes.y.tickFormat.min = min;
                this.setChartYMax();
                this.chartData = { ts: data };
                this.nQueryDataLoading = 0;
            }, err => {
                this.error = err;
                this.nQueryDataLoading = 0;
            });
        }
    }

    handleTimePickerChanges(message) {
        switch ( message.action  ) {
            case 'SetDateRange':
                this.startTime = message.payload.newTime.startTimeDisplay;
                this.endTime = message.payload.newTime.endTimeDisplay;
                if ( this.data.type === 'event') {
                    this.doEventQuery$.next(['list', 'count']);
                } else if ( this.data.type === 'simple' ) {
                    this.reloadData();
                }
                this.setAlertEvaluationLink();
                break;
        }
    }

    validateSingleMetricThresholds(group) {
        const badStateCntrl = this.thresholdSingleMetricControls['badThreshold'];
        const warningStateCntrl = this.thresholdSingleMetricControls['warnThreshold'];
        const recoveryStateCntrl = this.thresholdSingleMetricControls['recoveryThreshold'];
        const reportingIntervalCntrl = this.thresholdSingleMetricControls['reportingInterval'];
        const requiresFullWindowCntrl = this.thresholdSingleMetricControls['requiresFullWindow'];

        const recoveryMode = this.thresholdRecoveryType;
        const bad = badStateCntrl.value;
        const warning = warningStateCntrl.value;
        const recovery = recoveryStateCntrl.value;
        const operator = this.alertForm.get('threshold').get('singleMetric').get('comparisonOperator').value;
        const timeSampler = this.thresholdSingleMetricControls['timeSampler'].value;

        if ( this.alertForm.touched && badStateCntrl.value === null && warningStateCntrl.value === null ) {
            this.alertForm['controls'].threshold.setErrors({ 'required': true });
        }

        if ( timeSampler === 'all_of_the_times' && requiresFullWindowCntrl.value === true && reportingIntervalCntrl.value === null ) {
            this.thresholdSingleMetricControls['reportingInterval'].setErrors({ 'required': true });
        }

        // validate the warning value
        if ( this.alertForm.touched && badStateCntrl.value !== null && warningStateCntrl.value !== null ) {
            if ( (operator === 'above' || operator === 'above_or_equal_to') && warning >= bad ) {
                warningStateCntrl.setErrors({ 'invalid': true });
            }
            if ( (operator === 'below' || operator === 'below_or_equal_to') && warning <= bad ) {
                warningStateCntrl.setErrors({ 'invalid': true });
            }
        }
        if ( this.alertForm.touched && recoveryMode === 'specific' && recoveryStateCntrl.value === null ) {
            this.thresholdSingleMetricControls['recoveryThreshold'].setErrors({ 'required': true });
        }

        // validate the recovery value
        const badOrWarning = warningStateCntrl.value !== null ? warning : bad;
        if ( recoveryMode === 'specific' && this.alertForm.touched && badOrWarning !== null && recoveryStateCntrl.value !== null ) {

            if ((operator === 'above' && recovery > badOrWarning)               ||
                (operator === 'below' && recovery < badOrWarning)               ||
                (operator === 'above_or_equal_to' && recovery >= badOrWarning)  ||
                (operator === 'below_or_equal_to' && recovery <= badOrWarning)) {
                recoveryStateCntrl.setErrors({ 'invalid': true });
            }
        }
    }

    validateHealthCheckForm() {
        const bad = this.healthCheckControls['badThreshold'].value;
        const warn = this.healthCheckControls['warnThreshold'].value;
        const unknown = this.healthCheckControls['unknownThreshold'].value;
        const notifyOnMissing = this.thresholdControls['notifyOnMissing'].value;
        const missingDataInterval = this.thresholdControls['missingDataInterval'].value;

        if (  !bad  && !warn && !unknown && notifyOnMissing === 'false' ) {
            this.alertForm['controls'].threshold.setErrors({ 'required': true });
        }

        this.thresholdControls.missingDataInterval.setErrors(null);
        if ( notifyOnMissing === 'true' && missingDataInterval === null ) {
            this.thresholdControls.missingDataInterval.setErrors({ 'required': true });
        }

        // transitionsToNotify is required only when bad or warn or unknown is selected
        if ( (bad  || warn || unknown)  && !this.alertForm['controls'].notification.get('transitionsToNotify').value.length ) {
            this.alertForm['controls'].notification.get('transitionsToNotify').setErrors({ 'required': true });
        }
    }

    validateEventAlertForm() {
        const namespace = this.alertForm.get('queries').get('eventdb')['controls'][0].get('namespace').value;
        const threshold = this.alertForm.get('threshold').get('eventAlert').get('threshold').value;
        if ( !namespace ) {
            this.alertForm.get('queries').get('eventdb')['controls'][0].get('namespace').setErrors({'required': true});
        }
        if ( !threshold ) {
            this.alertForm.get('threshold').get('eventAlert').get('threshold').setErrors({'required': true});
        }
    }

    setThresholds(type, value) {
        let color;
        switch ( type ) {
            case 'bad':
                color = '#e21717';
                break;
            case 'warning':
                color = '#f0b200';
                break;
            case 'recovery':
                color = '#87d812';
                break;
        }
        const config = {
            value: value,
            scaleId: 'y',
            borderColor: color,
            borderWidth: 2,
            borderDash: [4, 4]
        };

        if ( value === null || value === '' ) {
            delete(this.thresholds[type]);
        } else {
            this.thresholds[type] = config;
        }

        this.setThresholdLines();
    }

    setThresholdLines() {
        this.options.thresholds = Object.values(this.thresholds);
        this.setChartYMax();
        this.options = {...this.options};
    }

    setTags() {
        if ( this.thresholdType === 'singleMetric' ) {
            const mid = this.alertForm.get('threshold').get('singleMetric').get('metricId').value;
            const [qindex, mindex] = this.utils.getMetricIndexFromId(mid, this.queries);
            let res = [];
            if ( mid  && this.queries[qindex] && this.queries[qindex].metrics.length) {
                    res = this.queries[qindex].metrics[mindex].groupByTags || [];
                    this.tags = res;
            }
        } else if ( this.thresholdType === 'eventAlert' ) {
            const namespace = this.alertForm.get('queries').get('eventdb')['controls'][0].get('namespace').value;
            const query: any = { search: '', namespace: namespace, tags: [], metrics: [] };
            if ( namespace ) {
                this.httpService.getNamespaceTagKeys(query, 'meta')
                                .subscribe( res => {
                                    this.tags = res.map( d => d.name);
                                });
            }
        } else {
            const query: any = { search: '', namespace: this.queries[0].namespace, tags: this.queries[0].filters, metrics: [] };
            if (this.queries[0].namespace !== '' ) {
                this.httpService.getNamespaceTagKeys(query, 'aurastatus')
                                .subscribe( res => {
                                    this.tags = res.map( d => d.name);
                                });
            }
        }
    }


    getMetricGroupByTags(qindex, mindex) {
        return this.queries[qindex] &&  this.queries[qindex].metrics[mindex] ? this.queries[qindex].metrics[mindex].groupByTags : [];
    }

    saveNamespace(namespace) {
        // this.eventAlertNamespace = namespace;
        this.eventSearchControl.nativeElement.focus();
        this.alertForm.get('queries').get('eventdb')['controls'][0].get('namespace').setValue(namespace);
        this.setTags();
        this.doEventQuery$.next(['list', 'count']);
    }

    cancelSaveNamespace(e) {
        // this.eventAlertNamespace = this.alertForm.get('threshold').get('eventAlert').get('namespace').value;
        // this.alertForm.get('threshold').get('eventAlert').get('namespace').setValue(ns, {emitModelToViewChange: true});
        // console.log("cancelSaveNamespace", this.alertForm.get('threshold').get('eventAlert').get('namespace').value);
    }


    get thresholdControls() {
        return this.alertForm['controls'].threshold['controls'];
    }

    get thresholdSingleMetricControls() {
        return this.alertForm['controls'].threshold['controls'].singleMetric['controls'];
    }

    get healthCheckControls() {
        return this.alertForm['controls'].threshold['controls'].healthCheck['controls'];
    }

    get thresholdRecoveryType() {
        return this.alertForm.get('threshold').get('singleMetric').get('recoveryType').value;
    }

    get groupRulesLabelValues() {
        return this.alertForm.get('alertGroupingRules');
    }

    get notificationRecipients() {
        return this.alertForm['controls'].notification.get('recipients');
    }

    get notificationRecipientsValue() {
        return this.alertForm['controls'].notification.get('recipients').value;
    }

    get notificationLabelValues() {
        return this.alertForm.get('labels');
    }

    get alertStateDirection() {
        const val = this.alertForm.get('threshold').get('singleMetric').get('comparisonOperator').value;
        const direction = { 'above': 'above',
                            'above_or_equal_to': 'above or equal to',
                            'below': 'below',
                            'below_or_equal_to': 'below or equal to' };
        return direction[val];
    }

    get recoveryStateDirection() {
        const valCheck = this.alertForm.get('threshold').get('singleMetric').get('comparisonOperator').value;
        switch (valCheck) {
            case 'above':
                return 'below or equal to';
            case 'above_or_equal_to':
                return 'below';
            case 'below':
                return 'above or equal to';
            case 'below_or_equal_to':
                return 'above';
        }
    }

    getAutoRecoveryOptionByVal(v) {
        const index = this.recoverOptions.findIndex(d => d.value === v );
        return this.recoverOptions[index];
    }

    /** methods */


    handleZoom(zConfig) {
        const n = this.chartData.ts.length;
        this.options.isCustomZoomed = zConfig.isZoomed;
        if ( zConfig.isZoomed && n > 0 ) {
            if ( this.prevDateRange === null ) {
                this.prevDateRange = { startTime: this.startTime, endTime: this.endTime };
            }
            const startTime = new Date(this.chartData.ts[0][0]).getTime() / 1000;
            const endTime = new Date(this.chartData.ts[n - 1][0]).getTime() / 1000;
            this.startTime = Math.floor(zConfig.start) <= startTime ? this.startTime : this.dateUtil.timestampToTime(zConfig.start, 'local');
            this.endTime = Math.ceil(zConfig.end) >= endTime ? this.endTime : this.dateUtil.timestampToTime(zConfig.end, 'local');
        } else if ( !zConfig.isZoomed) {
            this.startTime = this.prevDateRange.startTime;
            this.endTime = this.prevDateRange.endTime;
            this.prevDateRange = null;
        }
        if ( this.data.type === 'event') {
            this.doEventQuery$.next(['list', 'count']);
        } else if ( this.data.type === 'simple' ) {
            this.reloadData();
        }
        this.setAlertEvaluationLink();
    }

    getData() {
        // *******
        // ******* Remember to modify getTsdbQuery() too
        // *******

        const settings: any = {
            settings: {
                data_source: 'yamas',
                component_type: 'LinechartWidgetComponent'
            }
        };
        const time = {
            start: this.dateUtil.timeToMoment(this.startTime, 'local').valueOf(),
            end: this.dateUtil.timeToMoment(this.endTime, 'local').valueOf()
        };
        const queries = {};
        for (let i = 0; i < this.queries.length; i++) {
            const query: any = JSON.parse(JSON.stringify(this.queries[i]));
            if (query.namespace && query.metrics.length) {
                queries[i] = query;
            }
        }

        const options: any = {};
        if (Object.keys(this.periodOverPeriodConfig).length && this.data.threshold.subType === 'periodOverPeriod') {
            options.periodOverPeriod = this.periodOverPeriodConfig.periodOverPeriod;
            settings.settings.time = {};
            settings.settings.time.downsample = { aggregator: 'avg', value: 'custom', customValue: 1, customUnit: 'm'};
        }

        const mid = this.thresholdSingleMetricControls.metricId.value;
        options.sources = mid ? [ mid] : [];
        if ( Object.keys(queries).length ) {
            const query = this.queryService.buildQuery(settings, time, queries, options);
            // this.cdRef.detectChanges();
            this.getYamasData({query: query});
        } else {
            this.nQueryDataLoading = 0;
            this.options.labels = ['x'];
            this.chartData = { ts: [[0]] };
        }
    }

    getTsdbQuery(mid) {
        const settings: any = {
            settings: {
                data_source: 'yamas',
                component_type: 'LinechartWidgetComponent'
            }
        };
        const time: any = {
            start: '1h-ago'
        };
        const queries = {};
        for (let i = 0; i < this.queries.length; i++) {
            const query: any = JSON.parse(JSON.stringify(this.queries[i]));
            queries[i] = query;
        }

        const options: any = {};
        if (Object.keys(this.periodOverPeriodConfig).length && this.data.threshold.subType === 'periodOverPeriod') {
            options.periodOverPeriod = this.periodOverPeriodConfig.periodOverPeriod;
            settings.settings.time = {};
            settings.settings.time.downsample = { aggregator: 'avg', value: 'custom', customValue: 1, customUnit: 'm'};
        }
        options.sources = mid ? [ mid ] : [];

        const q = this.queryService.buildQuery( settings, time, queries, options);
        return [q];
    }

    getMetaQuery() {
        const query: any = { search: '', namespace: this.queries[0].namespace, tags: this.queries[0].filters, metrics: [] };
        const metaQuery = this.metaService.getQuery('aurastatus:check', 'TAG_KEYS', query);
        return metaQuery.queries;
    }

    // to get query for selected metrics, my rebuild to keep time sync 1h-ago
    getYamasData(query) {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        const queryObserver = this.httpService.getYamasData(query);
        this.sub = queryObserver.subscribe(
            result => {
                this.nQueryDataLoading = 0;
                this.queryData = result;
                this.refreshChart();
            },
            err => {
                this.nQueryDataLoading = 0;
                this.error = err;
            }
        );
    }

    getCount() {
        if (this.data && this.data.namespace && this.data.id) {
            const countObserver = this.httpService.getAlertCount({namespace: this.data.namespace, alertId: this.data.id});

            if (this.countSub) {
                this.countSub.unsubscribe();
            }

            this.countSub = countObserver.subscribe(
                result => {
                    for (const alert of result.results[0].data) {
                        if (alert.tags._alert_id === this.data.id.toString()) {
                            this.counts = [alert.summary];
                            break;
                        }
                    }
                },
                err => {
                    this.error = err;
                }
            );
        }
    }

    refreshChart() {
        const config = {
            queries: [],
            settings: {
                axes: {
                    y1: {},
                    y2: {}
                }
            }
        };
        const queries = this.utils.deepClone(this.queries);
        config.queries = queries;
        this.options.labels = ['x'];
        const data = this.dataTransformer.yamasToDygraph(config, this.options, [[0]], this.queryData);
        this.setChartYMax();
        this.chartData = { ts: data };
    }

    setChartYMax() {
        let max, min;
        switch ( this.data.type ) {
            case 'simple':
                const bad = this.thresholdSingleMetricControls['badThreshold'].value;
                const warning = this.thresholdSingleMetricControls['warnThreshold'].value;
                const recovery = this.thresholdSingleMetricControls['recoveryThreshold'].value;
                max = Math.max(bad, warning, recovery);
                min = d3.min([bad, warning, recovery]);
                break;
            case 'event':
                max = this.alertForm.get('threshold').get('eventAlert').get('threshold').value;
                min = 0; // always start from zero
                break;
        }
        this.options.axes.y.valueRange[0] = min < this.options.axes.y.tickFormat.min ? (min -  min * 0.1) : null ;
        this.options.axes.y.valueRange[1] = max && max > this.options.axes.y.tickFormat.max ? (max +  max * 0.1) : null ;
    }

    updateQuery(message) {
        switch (message.action) {
            case 'QueryChange':
                // show threshold & notification section when metric is added first time
                const metrics = this.utils.getAllMetrics(this.queries);
                this.showDetail = this.showDetail === false ? metrics.length !== 0 : this.showDetail;
                if (this.thresholdType !== 'healthCheck') { // no preview data for healthCheck
                    this.reloadData();
                }
                this.setTags();
                break;
            case 'CloneQuery':
                this.cloneQuery(message.id);
                this.queries = this.utils.deepClone(this.queries);
                this.reloadData();
                break;
            case 'DeleteQuery':
                this.deleteQuery(message.id);
                if ( this.queries.length === 0 ) {
                    this.addNewQuery();
                }
                this.reloadData();
                break;
            case 'DeleteQueryMetric':
                this.deleteQueryMetric(message.id, message.payload.mid);
                this.queries = this.utils.deepClone(this.queries);
                this.reloadData();
                break;
        }
    }

    reloadData() {
        this.error = '';
        this.nQueryDataLoading = 1;
        this.getData();
    }

    showError() {
        const parentPos = this.elRef.nativeElement.getBoundingClientRect();
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        const offsetHeight = 60;
        dialogConf.width = '50%';
        dialogConf.minWidth = '500px';
        dialogConf.height = '200px';
        dialogConf.backdropClass = 'error-dialog-backdrop';
        dialogConf.panelClass = 'error-dialog-panel';
        dialogConf.data = this.error;

        this.errorDialog = this.dialog.open(ErrorDialogComponent, dialogConf);
        this.errorDialog.afterClosed().subscribe((dialog_out: any) => {
        });
    }

    setAlertName(name) {
        this.alertForm.controls.name.setValue(name);
        this.data.name = name;
        this.utils.setTabTitle(name);
    }

    metricSubTypeChanged(e) {
        this.data.threshold.subType = e.value;
        if (e.value === 'singleMetric' || (e.value === 'periodOverPeriod' && Object.keys(this.periodOverPeriodConfig).length > 0)) {
            this.reloadData();
        }

        if (e.value === 'singleMetric' && this.periodOverPeriodConfig && this.periodOverPeriodConfig.delayEvaluation != null) {
            this.alertForm['controls'].threshold.get('delayEvaluation').setValue(this.periodOverPeriodConfig.delayEvaluation);
        }

        if (e.value === 'periodOverPeriod') { // singleMetric thresholds can interfere with rendering of periodOverPeriod graph
            this.alertForm['controls'].threshold['controls'].singleMetric.get('badThreshold').setValue(null);
            this.alertForm['controls'].threshold['controls'].singleMetric.get('warnThreshold').setValue(null);
            this.periodOverPeriodConfig.delayEvaluation = this.alertForm['controls'].threshold.get('delayEvaluation').value;
        }
    }

    validate(showTopErrorBar = true) {
        this.alertForm.markAsTouched();
        switch ( this.data.type ) {
            case 'simple':
                if ( !this.thresholdSingleMetricControls.metricId.value ) {
                    this.thresholdSingleMetricControls.metricId.setErrors({ 'required': true });
                }

                if (this.data.threshold.subType === 'periodOverPeriod') {
                    if (this.periodOverPeriodForm.anyErrors) {
                        this.alertForm['controls'].threshold.get('singleMetric').setErrors({ 'isInvalid': true });
                    }
                    if ( this.periodOverPeriodTransitionsSelected.length === 0) {
                        this.alertForm['controls'].notification.get('transitionsToNotify').setErrors({ 'required': true });
                    }
                } else {  // singleMetric
                    this.validateSingleMetricThresholds(this.alertForm['controls'].threshold);
                    if ( !this.alertForm['controls'].notification.get('transitionsToNotify').value.length ) {
                        this.alertForm['controls'].notification.get('transitionsToNotify').setErrors({ 'required': true });
                    }
                }
                break;
            case 'healthcheck':
                this.validateHealthCheckForm();
                break;
            case 'event':
                this.validateEventAlertForm();
                if ( !this.alertForm['controls'].notification.get('transitionsToNotify').value.length ) {
                    this.alertForm['controls'].notification.get('transitionsToNotify').setErrors({ 'required': true });
                }
                break;
        }


        if ( Object.keys(this.notificationRecipientsValue).length === 0 ) {
            this.notificationRecipients.setErrors({ 'required': true });
        }
        if ( this.alertForm['controls'].notification.get('subject').value.trim() === '' ) {
            this.alertForm['controls'].notification.get('subject').setErrors({ 'required': true });
        }

        if ( this.alertForm['controls'].notification.get('body').value.trim() === '' ) {
            this.alertForm['controls'].notification.get('body').setErrors({ 'required': true });
        }

        if ( this.alertForm.valid ) {
            // clear system message bar
            this.interCom.requestSend({
                action: 'clearSystemMessage',
                payload: {}
            });

            if ( !this.data.id && this.data.name === 'Untitled Alert' ) {
                this.openAlertNameDialog();
            } else {
                this.saveAlert();
            }

        } else if (showTopErrorBar) {
            // set system message bar
            this.interCom.requestSend({
                action: 'systemMessage',
                payload: {
                    type: 'error',
                    message: 'Your form has errors. Please review your form, and try again.'
                }
            });
        }

    }

    saveAlert() {
        const data: any = this.utils.deepClone(this.alertForm.getRawValue());
        data.id = this.data.id;
        switch (data.type) {
            case 'simple':
                const metricId = data.threshold.singleMetric.metricId;
                const [qindex, mindex] = this.utils.getMetricIndexFromId(metricId, this.queries);
                const tsdbQuery = this.getTsdbQuery(metricId);
                data.queries = { raw: this.queries, tsdb: tsdbQuery };
                data.threshold.singleMetric.queryIndex = 0;
                let dsId = this.utils.getDSId( this.utils.arrayToObject(this.queries), qindex, mindex);
                const subNodes = tsdbQuery[0].executionGraph.filter(d => d.id.indexOf(dsId) === 0 );
                dsId = subNodes[ subNodes.length - 1 ].id;
                data.threshold.singleMetric.metricId =  dsId;
                data.threshold.isNagEnabled = data.threshold.nagInterval !== '0' ? true : false;
                // tslint:disable-next-line: max-line-length
                data.threshold.autoRecoveryInterval = data.threshold.autoRecoveryInterval !== 'null' ? data.threshold.autoRecoveryInterval : null;
                // tslint:disable-next-line: max-line-length
                data.threshold.singleMetric.requiresFullWindow = data.threshold.singleMetric.timeSampler === 'all_of_the_times' ? data.threshold.singleMetric.requiresFullWindow : false;
                // tslint:disable-next-line: max-line-length
                data.threshold.singleMetric.reportingInterval = data.threshold.singleMetric.requiresFullWindow === true ? data.threshold.singleMetric.reportingInterval : null;
                if (this.data.threshold.subType === 'periodOverPeriod') {
                    const dataThresholdCopy = {...data.threshold};
                    data.notification.transitionsToNotify = [...this.periodOverPeriodTransitionsSelected];
                    data.threshold.delayEvaluation = this.periodOverPeriodConfig.delayEvaluation;
                    data.threshold.periodOverPeriod = {...this.periodOverPeriodConfig.periodOverPeriod};
                    data.threshold.periodOverPeriod.metricId = subNodes[0].id; // metric/expression node
                    data.threshold.periodOverPeriod.queryIndex = dataThresholdCopy.singleMetric.queryIndex;
                }
                break;
            case 'healthcheck':
                data.threshold.missingDataInterval = data.threshold.notifyOnMissing === 'true' ? data.threshold.missingDataInterval : null;
                data.queries = { aura: this.getMetaQuery(), raw: this.queries };
                data.threshold.isNagEnabled = data.threshold.nagInterval !== '0' ? true : false;
                break;
            case 'event':
                break;
        }

        // if created from dashboard and widget
        if (this.createdFrom && Object.keys(this.createdFrom).length) {
           data.createdFrom = this.createdFrom;
        }

        data.version = this.alertConverter.getAlertCurrentVersion();
        this.utils.setTabTitle(this.data.name);
        // emit to save the alert
        this.configChange.emit({ action: 'SaveAlert', namespace: this.data.namespace, dashboard: this.dashboardToCancelTo,
            payload: { data: this.utils.deepClone([data])}} );
    }

    cancelEdit() {
        // check if alert created from db
        if (this.dashboardToCancelTo > 0) {
            this.router.navigate(['d', this.dashboardToCancelTo]);
        } else {
            // emit with no event
            this.configChange.emit({
                action: 'CancelEdit'
            });
        }
    }

    /** Events */

    loadingEvents() {
        return this.nQueryDataLoading > 0;
    }

    removeNotificationLabelValue(i: number) {
        const control = <FormArray>this.notificationLabelValues;
        control.removeAt(i);
    }

    addNotificationLabelValue(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            const control = <FormArray>this.notificationLabelValues;
            control.push(new FormControl(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    /*
    removeQueryGroupRuleValue(i: number) {
        const control = <FormArray>this.groupRulesLabelValues;
        control.removeAt(i);
    }

    addQueryGroupRuleValue(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            const control = <FormArray>this.groupRulesLabelValues;
            control.push(new FormControl(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }
    */

    setEventAlertGroupBy(arr) {
        this.alertForm.get('queries').get('eventdb')['controls'][0].get('groupBy').setValue(arr, {emitEvent: false});
        // notification grouping should be reset
        this.setQueryGroupRules([]);
    }

    setQueryGroupRules(arr) {
        this.groupRulesLabelValues.setValue(arr);
    }

    recoveryTypeChange(event: any) {
        const control = <FormControl>this.thresholdSingleMetricControls.recoveryType;
        control.setValue(event.value);
    }

    alertRecipientsUpdate(event: any) {
        if ( this.notificationRecipients.value.oc &&  !event.oc) {
            this.alertForm['controls'].notification.get('runbookId').setValue('');
            this.alertForm['controls'].notification.get('ocSeverity').setValue('');
            this.alertForm['controls'].notification.get('ocTier').setValue('');
        }

        if ( this.notificationRecipients.value.opsgenie && !event.opsgenie) {
            this.alertForm['controls'].notification.get('opsgeniePriority').setValue('');
        }
        this.notificationRecipients.setValue(event);

    }

    // FOR DISPLAY ONLY VIEW OF METRICS - Simulate data source for metric table
    simulateMetricDataSource(queryMetrics: any[]) {

        // extract metrics only, then format with pre-constructed label, a type, and reference to the metric data
        const metrics = [];
        queryMetrics.filter(d => d.expression === undefined).forEach((metric, i) => {
            metrics.push({ indexLabel: 'm' + (i + 1), type: 'metric', metric });
        });

        // extract expressions only, then format with pre-constructed label, a type, and reference to the expression data
        const expressions = [];
        queryMetrics.filter(d => d.expression !== undefined).forEach((metric, i) => {
            expressions.push({ indexLabel: 'e' + (i + 1), type: 'expression', metric });
        });

        // merge the arrays and create datasource
        return new MatTableDataSource(metrics.concat(expressions));
    }

    // FOR DISPLAY ONLY VIEW OF METRICS - to get expression output
    getExpressionUserInput(expression, query) {

        const handleBarsRegex = /\{\{(.+?)\}\}/;
        // replace {{<id>}} to m|e<index>
        const re = new RegExp(handleBarsRegex, 'g');
        let matches = [];
        let userExpression = expression;
        const aliases = this.getHashMetricIdUserAliases(query);
        while (matches = re.exec(expression)) {
            const id = '' + matches[1];
            const idreg = new RegExp('\\{\\{' + id + '\\}\\}', 'g');
            userExpression = userExpression.replace(idreg, aliases[id]);
        }
        return userExpression;
    }

    // FOR DISPLAY ONLY VIEW OF METRICS - helper used by the above function
    getHashMetricIdUserAliases(query: any) {
        let metricIndex = 0;
        let expressionIndex = 0;
        const aliases = {};

        // cross-query aliases
        for (let i = 0; i < this.queries.length; i++) {
            const queryIndex = i + 1;
            metricIndex = 0;
            expressionIndex = 0;
            for (let j = 0; j < this.queries[i].metrics.length; j++) {
                const alias = this.queries[i].metrics[j].expression === undefined ?
                    'q' + queryIndex + '.' + 'm' + ++metricIndex :
                    'q' + queryIndex + '.' + 'e' + ++expressionIndex;
                aliases[this.queries[i].metrics[j].id] = alias;
            }
        }

        metricIndex = 0;
        expressionIndex = 0;
        for (let i = 0; i < query.metrics.length; i++) {
            const alias = query.metrics[i].expression === undefined ?
            'm' + ++metricIndex :
            'e' + ++expressionIndex;
            aliases[query.metrics[i].id] = alias;
        }

        return aliases;
    }

    // FOR DISPLAY ONLY VIEW OF METRICS - helper to extract recipient types from data
    getRecipientTypeKeys(): any[] {
        return Object.keys(this.data.notification.recipients);
    }

    // FOR DISPLAY ONLY VIEW OF METRICS - helper to get display value of recipient type
    typeToDisplayName(type: string): string {
        const types = {
            opsgenie: 'OpsGenie',
            slack: 'Slack',
            http: 'HTTP',
            oc: 'OC',
            email: 'Email'
        }
        return types[type];
    }

    setAlertEvaluationLink() {
        let url = environment.splunk_url + this.data.id;
        if (this.startTime && this.endTime) {
            const start =  Math.floor(this.dateUtil.timeToMoment(this.startTime, 'local').valueOf() / 1000);
            const end =  Math.floor(this.dateUtil.timeToMoment(this.endTime, 'local').valueOf() / 1000);
            url = url + '%20earliest%3D' + start + '%20latest%3D' + end;
        }
        this.alertEvaluationLink = url;
    }

    /** Privates */

    private openAlertNameDialog() {
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.autoFocus = false;
        dialogConf.width = '300px';
        dialogConf.panelClass = 'name-alert-dialog-panel';

        this.nameAlertDialog = this.dialog.open(NameAlertDialogComponent, dialogConf);

        this.nameAlertDialog.afterClosed().subscribe((dialog_out: any) => {
            // console.log('NAME ALERT DIALOG [afterClosed]', dialog_out);
            if (dialog_out && dialog_out.alertName) {
                this.data.name = dialog_out.alertName;
                this.alertForm.controls.name.setValue(this.data.name);
                this.saveAlert();
            } else {
                this.nameAlertDialog.close();
            }
        });
    }
}
