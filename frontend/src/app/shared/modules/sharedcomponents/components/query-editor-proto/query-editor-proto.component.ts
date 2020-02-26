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
import { debounceTime } from 'rxjs/operators';
import { MatMenuTrigger, MatMenu } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IMessage, IntercomService } from '../../../../../core/services/intercom.service';

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

    @Output() queryOutput = new EventEmitter;

    @ViewChild('tagFilterMenuTrigger', { read: MatMenuTrigger }) tagFilterMenuTrigger: MatMenuTrigger;

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
            regexValidator: null
        },
        'CounterValueDiff' : {
            errorMessage: null,
            regexValidator: null
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
    };

    // MAT-TABLE DEFAULT COLUMNS
    metricTableDisplayColumns: string[] = [
        'metric-index',
        'name',
        'alias',
        'modifiers'
    ];

    // MAT-TABLE DATA SOURCE
    metricTableDataSource = new MatTableDataSource<any[]>([]);

    visualPanelId = -1;
    constructor(
        private elRef: ElementRef,
        private utils: UtilsService,
        private fb: FormBuilder,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private dialog: MatDialog,
        private interCom: IntercomService
    ) {
        // add function (f(x)) icon to registry... url has to be trusted
        matIconRegistry.addSvgIcon(
            'function_icon',
            domSanitizer.bypassSecurityTrustResourceUrl('assets/function-icon.svg')
        );

    }

    ngOnChanges(changes: SimpleChanges) {
        // @Input tplVariables only for widget not alert
        if (changes.tplVariables && changes.tplVariables.currentValue.tvars) {
            this.tplVars = changes.tplVariables.currentValue.tvars;
        }
    }

    ngOnInit() {
        this.initOptions();
        this.initFormControls();
        this.initMetricDataSource();
        this.initSummarizerValue();
        this.queryChanges$ = new BehaviorSubject(false);

        this.queryChangeSub = this.queryChanges$
            // tslint:disable-next-line:no-shadowed-variable
            .subscribe(trigger => {
                if (trigger) {
                    this.triggerQueryChanges();
                }
            });
        // call this in case of not modify filter list yet
        this.buildTagFilters(this.query.filters);
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

    // helper function to format the table datasource into a structure
    // that allows the table to work more or less like it did before
    initMetricDataSource() {

        // extract metrics only, then format with pre-constructed label, a type, and reference to the metric data
        const metrics = [];
        this.getMetricsByType('metrics').forEach((metric, i) => {
            metrics.push({ indexLabel: 'm' + (i + 1), type: 'metric', metric });
            metrics.push( { visual: metric.settings.visual, metric: metric});
        });

        // placeholder row for Add Metric form
        metrics.push({addMetric: true});

        // extract expressions only, then format with pre-constructed label, a type, and reference to the expression data
        const expressions = [];
        this.getMetricsByType('expression').forEach((metric, i) => {
            expressions.push({ indexLabel: 'e' + (i + 1), type: 'expression', metric });
            expressions.push( { visual: metric.settings.visual, metric: metric});
        });

        // placeholder row for Add Expression form
        expressions.push({addExpression: true});

        // merge the arrays and create datasource
        this.metricTableDataSource = new MatTableDataSource(metrics.concat(expressions));
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
                            color: 'auto',
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
        this.buildTagFilters(filters);
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

    setMetricGroupByTags(id, tags) {
        const index = this.query.metrics.findIndex(item => item.id === id);
        if (index !== -1) {
            this.query.metrics[index].groupByTags = tags;
            this.queryChanges$.next(true);
        }
    }

    toggleVisualPanel(id) {
        this.visualPanelId = this.visualPanelId === id ? -1 : id;
    }
    setMetricVisual(id, key, value) {
        const index = this.query.metrics.findIndex(d => d.id === id);
        this.query.metrics[index].settings.visual[key] = value;
        this.initMetricDataSource();
        const visual = {};
        visual[key] = value;
        this.requestChanges('UpdateQueryMetricVisual', { mid : id, visual: visual } );
    }
    setVisualType(id, type) {
        this.setMetricVisual(id, 'type', type);
    }
    setLineType(id, type) {
        this.setMetricVisual(id, 'lineType', type);
    }

    setLineWeight(id, weight) {
        this.setMetricVisual(id, 'lineWeight', weight);
    }

    setColor(id, color, key = 'color') {
        this.setMetricVisual(id, key, color.hex);
    }

    setAxis(id, axis) {
        this.setMetricVisual(id, 'axis', axis);
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
            const expConfig = this.getExpressionConfig(expression);
            if (index === -1) {
                this.query.metrics.push(expConfig);
                this.isAddExpressionProgress = false;
                this.fg.addControl(expConfig.id, new FormControl(expression));
                index = this.query.metrics.length - 1;
            } else {
                expConfig.id = id;
                expConfig.settings.visual.visible = this.query.metrics[index].settings.visual.visible;
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
                const regex = new RegExp( result[i] + '(?!})', 'g');
                transformedExp = transformedExp.replace(regex, '{{' + aliases[result[i]] + '}}');
            }
        }
        // then shorthand
        for (let i = 0; i < result.length; i++) {
            if (!result[i].includes('.')) {
                const regex = new RegExp( result[i] +  '(?!})' , 'g');
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
                    color: 'auto',
                    label: ''
                }
            },
            summarizer: this.options.enableSummarizer ? 'avg' : ''
        };
        return config;
    }

    functionMenuOpened($event, idx) {
        // maybe need this?
        // console.log('MENU OPENED', $event, idx);
        // console.log('TRIGGERS', this.functionMenuTriggers);
        this.currentFunctionMenuTriggerIdx = idx;
    }

    functionMenuClosed($event) {
        // console.log('MENU CLOSED', $event);
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
        // console.log('ADD QUERY ITEM PROGRESS', type);
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

    // datasource table stuff - predicate helpers to determine if add metric/expression rows should show
    checkAddMetricRow = (i: number, data: object) => data.hasOwnProperty('addMetric');
    checkMetricVisualRow = (i: number, data: any) => data.hasOwnProperty('visual');
    checkAddExpressionRow = (i: number, data: object) => data.hasOwnProperty('addExpression');
}
