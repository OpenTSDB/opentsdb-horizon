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
import {
    Component,
    HostBinding,
    Input,
    OnInit,
    ElementRef,
    Output,
    EventEmitter,
    ViewChild,
    ViewChildren,
    TemplateRef,
    QueryList,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { UtilsService } from '../../../../../core/services/utils.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MatMenuTrigger, MatMenu } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IMessage, IntercomService } from '../../../../../core/services/intercom.service';
import { MultigraphService } from '../../../../../core/services/multigraph.service';
import { MatTableDataSource, MatDialogRef, MatDialog } from '@angular/material';

import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

interface IQueryEditorOptions {
    deleteQuery?: boolean;
    toggleQuery?: boolean;
    cloneQuery?: boolean;
    enableMetric?: boolean;
    toggleMetric?: boolean;
    enableGroupBy?: boolean;
    enableSummarizer?: boolean;
    enableMultiMetricSelection?: boolean;
    showNamespaceBar?: boolean;
    enableAlias?: boolean;
    excludeMetricGroupByTags?: string[];
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'query-editor-proto',
    templateUrl: './query-editor-proto.component.html',
    styleUrls: [],
    animations: [
        trigger( 'addQueryItem', [
            state('collapsed', style({ height: '0px', minHeight: '0px', visibility: 'hidden'})),
            state('expanded', style({ height: '*', minHeight: '48px', visibility: 'visible'})),
            transition('collapsed => expanded', animate('225ms ease-in-out')),
            transition('expanded => collapsed', animate('225ms ease-in-out'))
        ])
    ]
})

export class QueryEditorProtoComponent implements OnInit, OnChanges, OnDestroy {

    // tslint:disable-next-line:no-inferrable-types
    @HostBinding('class.query-editor-proto') private _hostClass: boolean = true;
    // tslint:disable-next-line:no-inferrable-types

    @ViewChild('addExpressionInput') addExpressionInput: ElementRef;
    @ViewChild('editExpressionInput') editExpressionInput: ElementRef;
    @ViewChild('confirmDeleteDialog', {read: TemplateRef}) confirmDeleteDialogRef: TemplateRef<any>;


    @Input() type;
    @Input() query: any;
    @Input() label = '';
    @Input() options: IQueryEditorOptions;
    @Input() tplVariables: any;
    @Input() queries: any[]; // for cross-query
    @Input() widget: any;

    @Output() queryOutput = new EventEmitter;

    @ViewChild('tagFilterMenuTrigger', { read: MatMenuTrigger }) tagFilterMenuTrigger: MatMenuTrigger;
    @ViewChild('metricVisualPanelTrigger', { read: MatMenuTrigger }) metricVisualPanelTrigger: MatMenuTrigger;

    @ViewChild('artifactsMenuTrigger', { read: MatMenuTrigger }) artifactsMenuTrigger: MatMenuTrigger;
    @ViewChild('functionSelectionMenu', { read: MatMenu }) functionSelectionMenu: MatMenu;
    @ViewChildren(MatMenuTrigger) functionMenuTriggers: QueryList<MatMenuTrigger>;

    // confirmDelete Dialog
    confirmDeleteDialog: MatDialogRef<TemplateRef<any>> | null;

    editNamespace = false;
    editTag = false;
    isAddMetricProgress = false;
    isAddExpressionProgress = false;
    editExpressionId = -1;
    editMetricId = -1;
    editAliasId = -1;
    fg: FormGroup;
    expressionControl: FormControl;
    expressionControls: FormGroup;
    idRegex = /(q[0-9]+\.)*(m|e)[0-9]+/gi;
    handleBarsRegex = /\{\{(.+?)\}\}/;
    tagFilters = [];
    tplVars = []; // a wrapper object for tplVariables.tvars for pipe since alert component using it.

    inAlertEditor: boolean = false;

    visualPanelHighlight: any = false;

    timeAggregatorOptions: Array<any> = [
        {
            label: 'Sum',
            value: 'sum'
        },
        {
            label: 'Min',
            value: 'min'
        },
        {
            label: 'Max',
            value: 'max'
        },
        {
            label: 'Avg',
            value: 'avg'
        },
        {
            label: 'Last',
            value: 'last'
        }
    ];

    tagAggregatorIconMap: any = {
        'sum': 'd-value-sum',
        'min': 'd-value-minimum',
        'max': 'd-value-maximum',
        'avg': 'd-value-average',
        'count': 'd-value-all'
    };

    summarizerOptions: Array<string> = ['avg', 'last', 'first', 'sum', 'min', 'max', 'count'];
    queryChanges$: BehaviorSubject<boolean>;
    queryChangeSub: Subscription;

    // FUNCTIONS SELECTOR STUFF
    selectedFunctionCategoryIndex: any = -1; // -1 for none selected, otherwise index
    currentFunctionMenuTriggerIdx: number;

    // store metric fx temporary here
    functionCategories: any[] = [
        {
            label: 'Smoothing',
            functions: [
                {
                    label: 'Moving Average 3 Samples',
                    fxCall: 'EWMA',
                    val: '3,0.0'
                },
                {
                    label: 'Moving Average 5 Samples',
                    fxCall: 'EWMA',
                    val: '5,0.0'
                },
                {
                    label: 'Moving Average 10 Samples',
                    fxCall: 'EWMA',
                    val: '10,0.0'
                },
                {
                    label: 'Moving Average 20 Samples',
                    fxCall: 'EWMA',
                    val: '20,0.0'
                },
                {
                    label: 'Moving Average 1m Window',
                    fxCall: 'EWMA',
                    val: '1m,0.0'
                },
                {
                    label: 'Moving Average 5m Window',
                    fxCall: 'EWMA',
                    val: '5m,0.0'
                },
                {
                    label: 'Moving Average 15m Window',
                    fxCall: 'EWMA',
                    val: '15m,0.0'
                },
                {
                    label: 'Moving Median 3 Samples',
                    fxCall: 'Median',
                    val: '3'
                },
                {
                    label: 'Moving Median 5 Samples',
                    fxCall: 'Median',
                    val: '5'
                },
                {
                    label: 'Moving Median 7 Samples',
                    fxCall: 'Median',
                    val: '7'
                },
                {
                    label: 'Moving Median 9 Samples',
                    fxCall: 'Median',
                    val: '9'
                }
            ]
        },
        {
            label: 'Difference',
            functions: [
                {
                    label: 'Value Difference',
                    fxCall: 'ValueDiff',
                    val: 'auto'
                },
                {
                    label: 'Counter Value Difference',
                    fxCall: 'CounterValueDiff',
                    val: 'auto'
                }
            ]
        },
        {
            label: 'Interval Total',
            functions: [
                {
                    label: 'Total Using Base Interval - Second',
                    fxCall: 'TotalUsingBaseInterval',
                    val: '1s,10s'
                },
                {
                    label: 'Total Using Base Interval - Minute',
                    fxCall: 'TotalUsingBaseInterval',
                    val: '1m,1m'
                }
            ]
        },
        {
            label: 'Rate',
            functions: [
                {
                    label: 'Per Second',
                    fxCall: 'Rate',
                    val: '1s'
                },
                {
                    label: 'Per Minute',
                    fxCall: 'Rate',
                    val: '1m'
                },
                {
                    label: 'Per Hour',
                    fxCall: 'Rate',
                    val: '1h'
                },
                {
                    label: 'Counter Per Second',
                    fxCall: 'CntrRate',
                    val: '1s'
                },
                {
                    label: 'Counter Per Minute',
                    fxCall: 'CntrRate',
                    val: '1m'
                },
                {
                    label: 'Counter Per Hour',
                    fxCall: 'CntrRate',
                    val: '1h'
                }
            ]
        },
        {
            label: 'Rollup',
            functions: [
                {
                    label: 'Average',
                    fxCall: 'Rollup',
                    val: 'avg,auto'
                },
                {
                    label: 'Minimum',
                    fxCall: 'Rollup',
                    val: 'min,auto'
                },
                {
                    label: 'Maximum',
                    fxCall: 'Rollup',
                    val: 'max,auto'
                },
                {
                    label: 'Sum',
                    fxCall: 'Rollup',
                    val: 'sum,auto'
                }
            ]
        },
        {
            label: 'Timeshift',
            functions: [
                {
                    label: 'Hour Before',
                    fxCall: 'Timeshift',
                    val: '1h'
                },
                {
                    label: 'Day Before',
                    fxCall: 'Timeshift',
                    val: '1d'
                },
                {
                    label: 'Week Before',
                    fxCall: 'Timeshift',
                    val: '1w'
                },
                {
                    label: 'Month Before',
                    fxCall: 'Timeshift',
                    val: '4w'
                }
            ]
        },
        /*
        {
            label: 'Group By',
            functions: [
                {
                    label: 'Avg',
                    fxCall: 'GroupByAvg',
                    val: 'avg'
                },
                {
                    label: 'Min',
                    fxCall: 'GroupByMin',
                    val: 'min'
                },
                {
                    label: 'Max',
                    fxCall: 'GroupByMax',
                    val: 'max'
                },
                {
                    label: 'Sum',
                    fxCall: 'GroupBySum',
                    val: 'sum'
                },
                {
                    label: 'Count',
                    fxCall: 'GroupByCount',
                    val: 'count'
                }
            ]
        },
        */
        {
            label: 'Ratio',
            functions: [
                {
                    label: 'Ratio',
                    fxCall: 'Ratio',
                    val: null
                },
                {
                    label: 'Percentage',
                    fxCall: 'Percentage',
                    val: null
                }
            ]
        },
        {
            label: 'Sliding Window',
            functions: [
                {
                    label: 'Sliding Sum 5m',
                    fxCall: 'SlidingWindow',
                    val: "sum,5m"
                },
                {
                    label: 'Sliding Sum 15m',
                    fxCall: 'SlidingWindow',
                    val: "sum,15m"
                },{
                    label: 'Sliding Count 5m',
                    fxCall: 'SlidingWindow',
                    val: "count,5m"
                },
                {
                    label: 'Sliding Count 15m',
                    fxCall: 'SlidingWindow',
                    val: "count,15m"
                },
                {
                    label: 'Sliding Min 5m',
                    fxCall: 'SlidingWindow',
                    val: "min,5m"
                },
                {
                    label: 'Sliding Min 15m',
                    fxCall: 'SlidingWindow',
                    val: "min,15m"
                },
                {
                    label: 'Sliding Max 5m',
                    fxCall: 'SlidingWindow',
                    val: "max,5m"
                },
                {
                    label: 'Sliding Max 15m',
                    fxCall: 'SlidingWindow',
                    val: "max,15m"
                }
            ]
        },
        {
            label: 'Time Difference',
            functions: [
                {
                    label: 'Delta in Minutes',
                    fxCall: 'TimeDiff',
                    val: 'MINUTES'
                },
                {
                    label: 'Delta in Seconds',
                    fxCall: 'TimeDiff',
                    val: 'SECONDS'
                }
            ]
        }
    ];


    FunctionOptions: any = {
        'TotalUsingBaseInterval': {
            errorMessage: 'Pair of comma separated durations, e.g. "1s,1m"',
            regexValidator: /^\d+[smhd],*(\d+[smhd]){0,1}$/i
        },
        'RateOfChange' : {
            errorMessage: null,
            regexValidator: null
        },
        'EWMA' : {
            errorMessage: null,
            regexValidator: null
        },
        'Median' : {
            errorMessage: null,
            regexValidator: null
        },
        'ValueDiff' : {
            errorMessage: null,
            regexValidator: null,
            noVal: true
        },
        'CounterValueDiff' : {
            errorMessage: null,
            regexValidator: null,
            noVal: true
        },
        'CntrRate' : {
            errorMessage: null,
            regexValidator: null
        },
        'Rate' : {
            errorMessage: null,
            regexValidator: null
        },
        'Rollup' : {
            errorMessage: null,
            regexValidator: null
        },
        'Timeshift' : {
            errorMessage: 'Possible values: 1h, 2d, 3w, etc.',
            regexValidator: /^\d+[hdw]$/i
        },
        'GroupByAvg' : {
            groupByFx : true
        },
        'GroupByMin' : {
            groupByFx : true
        },
        'GroupByMax' : {
            groupByFx : true
        },
        'GroupBySum' : {
            groupByFx : true
        },
        'GroupByCount' : {
            groupByFx : true
        },
        'SlidingWindow' : {
            errorMessage: "Must have an aggregator and interval, e.g. 'sum,5m'",
            regexValidator: /^max|min|sum|avg|count,*(\d+[smhd]){0,1}$/i
        },
        'TimeDiff' : {
            errorMessage: "Must be SECONDS, MINUTES or HOURS.",
            regexValidator: /^SECONDS|MINUTES|HOURS$/
        }
    };

    // MAT-TABLE DEFAULT COLUMNS
    metricTableDisplayColumns: string[] = [
        'metric-index',
        'name',
        // 'alias',
        'modifiers',
        'action',
        'visual'
    ];

    // MAT-TABLE DATA SOURCE
    metricTableDataSource = new MatTableDataSource<any>([]);

    visualPanelId = -1;

    pctSelectedMetrics;

    // QUERY ALIAS EDITING
    queryAliasEdit: boolean = false;
    queryAliasFormControl: FormControl;

    constructor(
        private elRef: ElementRef,
        private utils: UtilsService,
        private fb: FormBuilder,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private dialog: MatDialog,
        private interCom: IntercomService,
        private multiService: MultigraphService
    ) {
        /*
        // add function (f(x)) icon to registry... url has to be trusted
        matIconRegistry.addSvgIcon(
            'function_icon',
            domSanitizer.bypassSecurityTrustResourceUrl('assets/function-icon.svg')
        ); */

    }

    ngOnChanges(changes: SimpleChanges) {
        // @Input tplVariables only for widget not alert
        if (changes.tplVariables && changes.tplVariables.currentValue.tvars) {
            this.tplVars = changes.tplVariables.currentValue.tvars;
        }
        if ( changes.options && changes.options.currentValue ) {
            this.initOptions();
            this.initSummarizerValue();
        }
    }

    ngOnInit() {
        this.initFormControls();
        this.initMetricDataSource();
        this.queryChanges$ = new BehaviorSubject(false);

        this.queryChangeSub = this.queryChanges$
            // tslint:disable-next-line:no-shadowed-variable
            .subscribe(trigger => {
                if (trigger) {
                    this.triggerQueryChanges();
                }
            });
        this.sortFilters(this.query.filters);
        // call this in case of not modify filter list yet
        this.buildTagFilters(this.query.filters);

        // check if inside alert editor
        if (this.elRef.nativeElement.closest('.alert-details-component')) {
            this.inAlertEditor = true;
        }

        if (!this.query.settings.visual.label) {
            this.query.settings.visual.label = '';
        }

    }

    ngOnDestroy() {
        this.queryChangeSub.unsubscribe();
    }

    initOptions() {
        const defaultOptions = {
            'deleteQuery': false,
            'toggleQuery': false,
            'cloneQuery': false,
            'enableAlias': true,
            'enableMetric': true,
            'toggleMetric': true,
            'enableGroupBy': true,
            'enableSummarizer': false,
            'enableMultiMetricSelection': true,
            'enableExplicitTagMatch': true,
            'showNamespaceBar': true
         };
        this.options = { ...defaultOptions, ...this.options};
    }

    hasValidFilter(query: any): Number {
        const index =  query.filters.findIndex(f => f.filter.length || (f.customFilter && f.customFilter.length));
        return  index;
    }

    isArray(d : any ) {
        return Array.isArray(d);
    }

    // helper function to format the table datasource into a structure
    // that allows the table to work more or less like it did before
    initMetricDataSource() {

        // extract metrics only, then format with pre-constructed label, a type, and reference to the metric data
        const metrics = [];
        // this.query.metrics.filter(d => d.expression === undefined);
        let mIndex = 0, eIndex = 0, indexLabel = '';
        for ( let i = 0 ; i < this.query.metrics.length; i++ ) {
            const isExpression = this.query.metrics[i].expression !== undefined;
            if (  !isExpression ) {
                mIndex++;
                indexLabel = 'm' + mIndex;
            } else {
                eIndex++;
                indexLabel = 'e' + eIndex;
            }
            metrics.push({ indexLabel: indexLabel, type: isExpression ? 'expression' : 'metric', metric: this.query.metrics[i], visual: this.options.enableMultiMetricSelection ? this.query.metrics[i].settings.visual : this.widget.settings.visual });
        }

        /*
        this.getMetricsByType('metrics').forEach((metric, i) => {
            metrics.push({ indexLabel: 'm' + (i + 1), type: 'metric', metric });
            // tslint:disable:max-line-length
            if ( this.options.enableMultiMetricSelection || metric.settings.visual.visible ) {
                // metrics.push( { visual: this.options.enableMultiMetricSelection ? metric.settings.visual : this.widget.settings.visual, metric: metric});
            }
        });

        // placeholder row for Add Metric form

        // extract expressions only, then format with pre-constructed label, a type, and reference to the expression data
        const expressions = [];
        this.getMetricsByType('expression').forEach((metric, i) => {
            expressions.push({ indexLabel: 'e' + (i + 1), type: 'expression', metric });
            // tslint:disable:max-line-length
            if ( this.options.enableMultiMetricSelection || metric.settings.visual.visible ) {
                // expressions.push( { visual: this.options.enableMultiMetricSelection ? metric.settings.visual : this.widget.settings.visual, metric: metric});
            }
        });
        */

        metrics.push({addMetric: true});
        // placeholder row for Add Expression form
        metrics.push({addExpression: true});

        // merge the arrays and create datasource
        this.metricTableDataSource = new MatTableDataSource(metrics);
    }

    initFormControls() {
        this.fg = new FormGroup({});
        const expressions = this.getMetricsByType('expression');
        for (let i = 0; i < expressions.length; i++) {
            this.fg.addControl(expressions[i].id, new FormControl(this.getExpressionUserInput(expressions[i].expression)));
        }
        this.fg.addControl('-1', new FormControl(''));
    }

    initSummarizerValue() {
        if (this.options.enableSummarizer) {
            for (const metric of this.query.metrics) {
                if (!metric.summarizer) {
                    metric.summarizer = 'avg';
                }
            }
        }
    }

    saveNamespace(namespace) {
        this.query.namespace = namespace;
        this.editNamespace = false;
        this.triggerQueryChanges();
    }

    cancelSaveNamespace(e) {
        this.editNamespace = false;
    }

    updateMetric(metrics, id) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if ( index !== -1 ) {
            this.query.metrics[index].name = metrics[0];
        } else {
            const insertIndex = this.getMetricsLength('metrics');
            for (let i = 0; i < metrics.length; i++) {
                // tslint:disable-next-line:no-shadowed-variable
                const id = this.utils.generateId(3, this.utils.getIDs( this.utils.getAllMetrics(this.queries)));
                const oMetric = {
                    id: id,
                    name: metrics[i],
                    filters: [],
                    settings: {
                        visual: {
                            visible: this.options.enableMultiMetricSelection,
                            color: '',
                            label: ''
                        }
                    },
                    tagAggregator: 'sum',
                    functions: [],
                    summarizer: ''
                };
                if (this.options.enableSummarizer) {
                    oMetric.summarizer = 'avg';
                }
                this.query.metrics.splice(insertIndex, 0, oMetric);
            }
            // update data source
            this.initMetricDataSource();
        }
        this.query.metrics = [...this.query.metrics];

        this.queryChanges$.next(true);
    }

    updateFilters(filters) {
        // when the filters list is updated, it might have adding the custom dashboard tag filter
        // we need to resolve it to diffrent obj to handle it to metric auto-complete
        this.query.filters = filters;
        this.queryChanges$.next(true);
        this.sortFilters(filters);
        this.buildTagFilters(filters);
    }

    sortFilters(filters) {
        filters.sort((a: any, b: any) => {
            return this.utils.sortAlphaNum(a.tagk, b.tagk);
        });
    }

    // helper function to create clean tag filters for metric auto-complete
    buildTagFilters (filters : any[]) {
        // clone it so we do not alert original object
        const mfilters = this.utils.deepClone(filters);
        this.tagFilters = []; // reset
        for (let i = 0; i < mfilters.length; i++) {
            if (mfilters[i].customFilter && mfilters[i].customFilter.length > 0) {
                // they do have one or more customFilter for same tag key, add value of it
                for (let j = 0; j < mfilters[i].customFilter.length; j++) {
                    const cusFilter = mfilters[i].customFilter[j];
                    for (let k = 0; k < this.tplVariables.tvars.length; k++) {
                        if ('[' + this.tplVariables.tvars[k].alias + ']' === cusFilter && this.tplVariables.tvars[k].filter !== '') {
                            mfilters[i].filter.push(this.tplVariables.tvars[k].filter);
                        }
                    }
                }
                if (mfilters[i].filter.length > 0) {
                    this.tagFilters.push(mfilters[i]);
                }
            } else {
                if (mfilters[i].filter.length > 0) {
                    this.tagFilters.push(mfilters[i]);
                }
            }
        }
    }

    functionUpdate(event: any) {
        // event have metricId and fx
        const mIndex = this.query.metrics.findIndex(m => m.id === event.metricId);
        this.query.metrics[mIndex].functions = this.query.metrics[mIndex].functions || [];
        const fxIndex = this.query.metrics[mIndex].functions.findIndex(fx => fx.id === event.fx.id);
        if (fxIndex !== -1) {
            this.query.metrics[mIndex].functions[fxIndex] = event.fx;
        } else {
            this.query.metrics[mIndex].functions.push(event.fx);
        }
        this.queryChanges$.next(true);
    }

    functionDelete(event: any) {
        // event have metricId and funcId
        const mIndex = this.query.metrics.findIndex(m => m.id === event.metricId);
        const fxIndex = this.query.metrics[mIndex].functions.findIndex(fx => fx.id === event.funcId);
        if (fxIndex !== -1) {
            this.query.metrics[mIndex].functions.splice(fxIndex, 1);
        }
        this.queryChanges$.next(true);
    }

    setMetricTagAggregator(id, value) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].tagAggregator = value;
            this.queryChanges$.next(true);
        }
    }

    setJoinType(id, value) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].joinType = value;
            this.queryChanges$.next(true);
        }
    }

    setMetricGroupByTags(id, tags) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].groupByTags = tags;
            // this is in edit widget mode, if they make change to groupby
            // we need also update the the multigraph conf
            if ( this.widget.settings ) {
                const groupByTags = this.multiService.getGroupByTags(this.widget.queries);
                this.multiService.updateMultigraphConf(groupByTags, this.widget.settings.multigraph);
            }
            this.queryChanges$.next(true);
        }
    }

    updateVisual(message, data) {
        if ( message.action === 'ClosePanel') {
            this.metricVisualPanelTrigger.closeMenu();
        } else {
            this.requestChanges(message.action, message.payload);
            // calling the initMetricDataSource causing the visual panel closing.
            // data visual needs to be updated reflect the changes on the readonly version
            data.visual = { ...data.visual, ...message.payload.visual };
            const newConfig = message.payload.visual;
            const overrideConfig: any = {};
            for ( let i = 0; i < this.widget.queries.length; i++ ) {
                for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                    const vconfig = this.widget.queries[i].metrics[j].settings.visual;
                    if ( ['area', 'bar'].includes(vconfig.type) ) {
                        overrideConfig.axis = vconfig.axis || 'y1';
                        overrideConfig.stacked = vconfig.stacked || 'true';
                        break;
                    }
                }
            }
            const qindex = this.widget.queries.findIndex(d => d.id === message.payload.qid);
            const mindex = this.widget.queries[qindex].metrics.findIndex(d => d.id === message.payload.mid);
            const curtype = this.widget.queries[qindex].metrics[mindex].settings.visual.type || 'line';
            for ( let i = 0; i < this.metricTableDataSource.data.length; i++ ) {
                if ( this.metricTableDataSource.data[i].visual ) {
                    // tslint:disable-next-line:max-line-length
                    if ( message.action === 'UpdateQueryMetricVisual' && (newConfig.axis || newConfig.stacked  || ['area', 'bar'].includes(newConfig.type)) && ['area', 'bar'].includes(curtype) && ['area', 'bar'].includes(this.metricTableDataSource.data[i].visual.type) ) {
                        this.metricTableDataSource.data[i].visual = {...this.metricTableDataSource.data[i].visual, ...newConfig};
                    } else if ( message.action === 'UpdateQueryVisual' && (newConfig.scheme || newConfig.color ||  newConfig.type ) ) {
                        this.metricTableDataSource.data[i].visual = {...this.metricTableDataSource.data[i].visual, ...newConfig};
                        // set existing bar axis
                        // tslint:disable-next-line:max-line-length
                        if ( newConfig.type && ['area', 'bar'].includes(newConfig.type) && ['area', 'bar'].includes(this.metricTableDataSource.data[i].visual.type)) {
                            this.metricTableDataSource.data[i].visual = {...this.metricTableDataSource.data[i].visual, ...overrideConfig};
                        }
                    // tslint:disable-next-line:max-line-length
                    } else if ( message.action === 'UpdateQueryVisual' && newConfig.axis && (curtype !== 'line' || !this.metricTableDataSource.data[i].visual.type || this.metricTableDataSource.data[i].visual.type === 'line') )  {
                        this.metricTableDataSource.data[i].visual.axis = newConfig.axis;
                    }
                }
            }
        }
    }

    getGroupByTags(id) {
        let groupByTags = [];
        const expression = this.utils.getMetricFromId(id, this.queries).expression;

        if (expression) {
            // replace {{<id>}} with query source id
            const re = new RegExp(this.handleBarsRegex, 'g');
            let matches = [];
            let i = 0;
            while (matches = re.exec(expression)) {
                const id = matches[1];
                const mTags = this.getGroupByTags( id );
                groupByTags = i === 0 ? mTags : groupByTags.filter(v => mTags.includes(v));
                i++;
            }
        } else {
            groupByTags = this.utils.getMetricFromId(id, this.queries).groupByTags || [];
        }
        return groupByTags;
    }

    getMetricLabel(index) {
        const isExpression = this.query.metrics[index].expression !== undefined;
        let labelIndex = 0;
        for (let i = 0; i <= index; i++) {
            if (!isExpression && this.query.metrics[i].expression === undefined) {
                labelIndex++;
            }
            if (isExpression && this.query.metrics[i].expression !== undefined) {
                labelIndex++;
            }
        }
        return isExpression ? 'e' + labelIndex : 'm' + labelIndex;
    }

    getMetricsLength(type) {
        const res = this.getMetricsByType(type);
        return res.length;
    }

    getMetricsByType(type) {
        if (type === 'metrics') {
            return this.query.metrics.filter(d => d.expression === undefined);
        } else {
            return this.query.metrics.filter(d => d.expression !== undefined);
        }
    }

    editExpression(id) {
        if (this.fg.controls[this.editExpressionId].errors) { return; }
        this.editExpressionId = id;
        if (id === -1) {
            this.fg.controls[this.editExpressionId].setValue('');
            // this.isAddExpressionProgress = true;
            this.addQueryItemProgress('expression');
        } else {
            const index = this.query.metrics.findIndex(d => d.id === id);
            this.fg.controls[this.editExpressionId].setValue(this.getExpressionUserInput(this.query.metrics[index].expression));
            setTimeout(() => {
                this.editExpressionInput.nativeElement.focus();
            }, 100);
        }
    }

    getExpressionUserInput(expression) {
        // replace {{<id>}} to m|e<index>
        const re = new RegExp(this.handleBarsRegex, 'g');
        let matches = [];
        let userExpression = expression;
        const aliases = this.getHashMetricIdUserAliases();
        while (matches = re.exec(expression)) {
            const id = '' + matches[1];
            const idreg = new RegExp('\\{\\{' + id + '\\}\\}', 'g');
            userExpression = userExpression.replace(idreg, aliases[id]);
        }
        return userExpression;
    }

    updateExpression(id, e) {
        const expression = e.srcElement.value.trim();
        let index = this.query.metrics.findIndex(d => d.id === id);
        if (expression && this.isValidExpression(id, expression)) {
            const expConfig: any = this.getExpressionConfig(expression);
            if (index === -1) {
                this.query.metrics.push(expConfig);
                this.isAddExpressionProgress = false;
                this.fg.addControl(expConfig.id, new FormControl(expression));
                index = this.query.metrics.length - 1;
            } else {
                expConfig.id = id;
                expConfig.settings.visual = this.query.metrics[index].settings.visual;
                expConfig.functions = this.query.metrics[index].functions;
                this.query.metrics[index] = expConfig;
                this.editExpressionId = -1;
            }
            this.query.metrics[index].groupByTags = this.getGroupByTags(expConfig.id);
            this.queryChanges$.next(true);
            this.initMetricDataSource();
        } else if (!expression && index === -1) {
            this.isAddExpressionProgress = false;
        }
    }

    updateMetricAlias(id, e) {
        const alias = e.srcElement.value.trim();
        const index = this.query.metrics.findIndex(d => d.id === id);
        this.query.metrics[index].settings.visual.label = alias;
        this.editAliasId = -1;
        this.requestChanges('UpdateQueryMetricVisual', { mid : id, visual: { label: alias } } );
    }

    isValidExpression(id, expression) {
        const result = expression.match(this.idRegex);
        const invalidRefs = [];

        const aliases = this.getMetricAliases();
        for (let i = 0; result && i < result.length; i++) {
            if (!aliases[result[i]]) {
                invalidRefs.push(result[i]);
            }
        }

        const isValid = result != null && !invalidRefs.length;
        this.fg.controls[id].setErrors(!isValid ? { 'invalid': true } : null);
        return isValid;
    }

    /* <metric.id>: m|e<index>, e.g. { aaa: m1, bbb: m2, ccc: e1 } */
    getHashMetricIdUserAliases() {
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
        for (let i = 0; i < this.query.metrics.length; i++) {
            const alias = this.query.metrics[i].expression === undefined ?
            'm' + ++metricIndex :
            'e' + ++expressionIndex;
            aliases[this.query.metrics[i].id] = alias;
        }

        return aliases;
    }

    /* m|e<index>:<metric.id>, e.g. { m1: aaa, m2: bbb, e1: ccc } */
    getMetricAliases() {
        let metricIndex = 0;
        let expressionIndex = 0;
        const aliases = {};

        // shorthand aliases
        for (let i = 0; i < this.query.metrics.length; i++) {
            const alias = this.query.metrics[i].expression === undefined ?
            'm' + ++metricIndex :
            'e' + ++expressionIndex;
            aliases[alias] = this.query.metrics[i].id;
        }

        // cross-query aliases
        for (let i = 0; i < this.queries.length; i++) {
            const queryIndex = i + 1;
            metricIndex = 0;
            expressionIndex = 0;
            for (let j = 0; j < this.queries[i].metrics.length; j++) {
                const alias = this.queries[i].metrics[j].expression === undefined ?
                    'q' + queryIndex + '.' + 'm' + ++metricIndex :
                    'q' + queryIndex + '.' + 'e' + ++expressionIndex;
                aliases[alias] = this.queries[i].metrics[j].id;
            }
        }

        return aliases;
    }

    getExpressionConfig(expression) {
        let transformedExp = expression;
        let result = expression.match(this.idRegex);
        result = result ? this.utils.arrayUnique(result) : result;
        result.sort().reverse(); // wanted to replace m10 first, then m1
        const aliases = this.getMetricAliases();
        // update the expression with metric ids
        // first cross-query
        for (let i = 0; i < result.length; i++) {
            if (result[i].includes('.')) {
                const regex = new RegExp( result[i] + '(?![^\\{\\}]*\\})', 'g');
                transformedExp = transformedExp.replace(regex, '{{' + aliases[result[i]] + '}}');
            }
        }
        // then shorthand
        for (let i = 0; i < result.length; i++) {
            if (!result[i].includes('.')) {
                const regex = new RegExp( result[i] + '(?![^\\{\\}]*\\})', 'g');
                transformedExp = transformedExp.replace(regex, '{{' + aliases[result[i]] + '}}');
            }
        }

        const config = {
            id: this.utils.generateId(3, this.utils.getIDs(this.utils.getAllMetrics(this.queries))),
            expression: transformedExp,
            originalExpression: expression,
            settings: {
                visual: {
                    visible: this.options.enableMultiMetricSelection,
                    color: '',
                    label: ''
                }
            },
            summarizer: this.options.enableSummarizer ? 'avg' : ''
        };
        return config;
    }

    functionMenuOpened($event, idx) {
        // maybe need this?
        this.currentFunctionMenuTriggerIdx = idx;
    }

    functionMenuClosed($event) {
        this.selectedFunctionCategoryIndex = -1;
        this.currentFunctionMenuTriggerIdx = null;
    }

    selectFunctionCategory($event, catIdx) {
        this.selectedFunctionCategoryIndex = catIdx;
    }

    addFunction(func: any, metricId: string) {
        const metricIdx = this.query.metrics.findIndex(d => d.id === metricId ) ;
        this.query.metrics[metricIdx].functions = this.query.metrics[metricIdx].functions || [];

        const newFx = {
            id: this.utils.generateId(3, this.utils.getIDs(this.query.metrics[metricIdx].functions)),
            fxCall: func.fxCall,
            val: func.val
        };

        this.query.metrics[metricIdx].functions.push(newFx);
        // tslint:disable-next-line:max-line-length
        // tslint:disable-next-line:no-shadowed-variable
        const trigger: MatMenuTrigger = <MatMenuTrigger>this.functionMenuTriggers.find((el, i) => i === this.currentFunctionMenuTriggerIdx);
        if (trigger) {
            trigger.closeMenu();
        }
        this.queryChanges$.next(true);
    }

    setSummarizerValue(id, summarizer: string) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].summarizer = summarizer;
            this.requestChanges('SummarizerChange', { summarizer });
        }
    }

    setMissingMetrics(id, flag) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].substituteMissing = flag;
            this.queryChanges$.next(true);
        }
    }

    showMetricAC() {

    }

    requestChanges(action, data = {}) {
        const message = {
            id: this.query.id,
            action: action,
            payload: data
        };
        this.queryOutput.emit(message);
    }

    triggerQueryChanges() {
        this.requestChanges('QueryChange', { 'query': this.query });
    }

    toggleExplictTagMatch(e: any) {
        this.query.settings.explicitTagMatch = e.checked;
        this.queryChanges$.next(true);
    }

    showTagFilterMenu() {
        this.tagFilterMenuTrigger.openMenu();
    }

    toggleMetric(id) {
        this.requestChanges('ToggleQueryMetricVisibility', { mid : id} );
    }

    toggleQuery() {
        this.requestChanges('ToggleQueryVisibility');
    }

    cloneQuery() {
        this.requestChanges('CloneQuery');
    }

    deleteQuery() {
        this.confirmDeleteDialog.close({deleted: true});
    }


    confirmQueryDelete(label) {
        this.confirmDeleteDialog = this.dialog.open(this.confirmDeleteDialogRef, {data: { label: label}});
        this.confirmDeleteDialog.afterClosed().subscribe(event => {
            if ( event.deleted ) {
                this.requestChanges('DeleteQuery');
            }
        });
    }

    canDeleteQuery() {
        let canDelete = true;
        const metricIds = [];
        for (const metric of this.query.metrics) {
            metricIds.push(metric.id);
        }

        if (this.queries) { // cross queries
            for (const query of this.queries) {
                for ( let i = 0; i < query.metrics.length; i++ ) {
                    const expression = query.metrics[i].expression;
                    if (expression && query.id !== this.query.id && this.expressionContainIds(expression, metricIds)) {
                        canDelete = false;
                        break;
                    }
                }
            }
        }
        return canDelete;

    }

    expressionContainIds(expression, ids) {
        for (const id of ids) {
            if (expression.indexOf('{{' + id + '}}') !== -1) {
                return true;
            }
        }
        return false;
    }

    reorderMetric(event: any) {
        const curIndex = event.currentIndex;
        const dragItem = this.query.metrics[event.previousIndex];
        const dropItem = this.query.metrics[event.currentIndex];
        this.query.metrics[event.currentIndex] = dragItem;
        this.query.metrics[event.previousIndex] = dropItem;
        this.initMetricDataSource();
        this.requestChanges('UpdateQueryMetricOrder', { qid: this.query.id, query: this.query });
    }

    cloneMetric(id) {
        const index = this.query.metrics.findIndex(d => d.id === id );
        const oMetric = this.query.metrics[index];
        const nMetric = this.utils.deepClone(oMetric);
        nMetric.id = this.utils.generateId(3, this.utils.getIDs(this.utils.getAllMetrics(this.queries)));

        if (!this.options.enableMultiMetricSelection && nMetric.settings && nMetric.settings.visual) {
            nMetric.settings.visual.visible = false;
        }

        const insertIndex = this.query.metrics.findIndex(d => d.id === oMetric.id ) + 1;
        this.query.metrics.splice(insertIndex, 0, nMetric);
        this.queryChanges$.next(true);
        this.initMetricDataSource();
    }

    deleteMetric(id) {
        this.requestChanges('DeleteQueryMetric', { mid : id} );
        this.initMetricDataSource();
    }

    canDeleteMetric(id) {
        const index = this.query.metrics.findIndex(d => d.id === id ) ;
        const metrics = this.query.metrics;
        let canDelete = true;

        if (this.queries) { // cross queries
            for (const query of this.queries) {
                for ( let i = 0; i < query.metrics.length; i++ ) {
                    const expression = query.metrics[i].expression;
                    if ( expression && i !== index  &&  expression.indexOf('{{' + id + '}}') !== -1 ) {
                        canDelete = false;
                        break;
                    }
                }
            }
        } else {
            for ( let i = 0; i < metrics.length; i++ ) {
                const expression = metrics[i].expression;
                if ( expression && i !== index  &&  expression.indexOf('{{' + id + '}}') !== -1 ) {
                    canDelete = false;
                    break;
                }
            }
        }
        return canDelete;
    }

    addQueryItemProgress(type: string) {
        if (type === 'metric') {
            this.isAddExpressionProgress = false;
            this.isAddMetricProgress = !this.isAddMetricProgress;
        }
        if (type === 'expression') {
            this.isAddMetricProgress = false;
            this.isAddExpressionProgress = !this.isAddExpressionProgress;
            setTimeout(() => {
                this.addExpressionInput.nativeElement.focus();
            }, 100);
        }
    }

    toggleVisualRow(index, highlight) {
        if (highlight) {
            this.visualPanelHighlight = index;
        } else {
            this.visualPanelHighlight = false;
        }
    }

    closeTagFilterModal(event: any) {
        this.tagFilterMenuTrigger.closeMenu();
    }

    createPercentageMetrics() {
        if ( this.pctSelectedMetrics.length > 1 ) {
            const expConfig = this.getExpressionConfig(this.pctSelectedMetrics.join(' + '));
            expConfig.settings.visual.label = 'Total';
            expConfig.settings.visual.visible = false;
            this.query.metrics.push(expConfig);

            const expLabel = this.getMetricLabel(this.query.metrics.length - 1);
            const aliases = this.getMetricAliases();
            for ( let i = 0; i < this.pctSelectedMetrics.length; i++ ) {
                const mid = aliases[this.pctSelectedMetrics[i]];
                const index = this.query.metrics.findIndex( d =>  d.id === mid );
                // set the actual metric visible=false and groupby=everything
                this.query.metrics[index].settings.visual.visible = false;
                this.query.metrics[index].groupByTags = [];

                const expConfig: any = this.getExpressionConfig( this.pctSelectedMetrics[i] + ' * 100 / ' + expLabel );
                expConfig.settings.visual.type = 'area';
                expConfig.settings.visual.label = this.query.metrics[index].name + ' %';
                this.query.metrics.push(expConfig);
            }
            this.requestChanges('ChangeAxisLabel', { axis: 'y1', label: '%' } );
            this.queryChanges$.next(true);
            this.initMetricDataSource();
        }
        this.closeMetricDialog();
    }

    closeMetricDialog() {
        this.artifactsMenuTrigger.closeMenu();
    }

    // QUERY ALIAS EDITING
    toggleQueryAliasEditForm() {
        if (!this.queryAliasEdit) {
            this.queryAliasFormControl = new FormControl(this.query.settings.visual.label);
            this.queryAliasEdit = true;
        } else {
            this.queryAliasEdit = false;
        }
    }

    saveQueryAliasForm() {
        let value = this.queryAliasFormControl.value;
        this.query.settings.visual.label = value;
        this.queryAliasEdit = false;
        this.requestChanges('UpdateQueryAlias', { visual: { label: value } } );
    }


    // datasource table stuff - predicate helpers to determine if add metric/expression rows should show
    checkAddMetricRow = (i: number, data: object) => data.hasOwnProperty('addMetric');
    checkMetricVisualRow = (i: number, data: any) => data.hasOwnProperty('visual');
    checkAddExpressionRow = (i: number, data: object) => data.hasOwnProperty('addExpression');
}
