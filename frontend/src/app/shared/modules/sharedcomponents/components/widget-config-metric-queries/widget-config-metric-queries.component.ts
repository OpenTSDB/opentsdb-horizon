import {
    Component, OnInit, HostBinding, Input, Output, ElementRef, EventEmitter, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';

import {
    MatDialog, MatDialogConfig, MatDialogRef, DialogPosition
} from '@angular/material';

import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';



import { Subscription } from 'rxjs';
import { UtilsService } from '../../../../../core/services/utils.service';
import { FormControl } from '@angular/forms';

interface IMetricQueriesConfigOptions {
    enableMultipleQueries?: boolean;
    enableGroupBy?: boolean;
    enableSummarizer?: boolean;
    enableMultiMetricSelection?: boolean;
    // toggleMetric?: boolean;  // future use
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-metric-queries',
    templateUrl: './widget-config-metric-queries.component.html',
    styleUrls: []
})
export class WidgetConfigMetricQueriesComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.metric-queries-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;
    @Input() options: IMetricQueriesConfigOptions;
    /** Outputs */
    @Output() widgetChange = new EventEmitter;


    /** Local variables */

    modGroup: any; // current group that is adding metric
    mgroupId = undefined;

    // lookup table for selected icons
    // primarily for checkboxes that have intermediate states
    selectedToggleIcon: any = {
        'none': 'check_box_outline_blank',
        'all': 'check_box',
        'some': 'indeterminate_check_box'
    };

    editQuery: any;
    queryEditMode = false;
    showNewQueryEditor = false;
    newQueryId = '';
    editQueryId = '';
    selectAllToggle: String = 'none'; // none/all/some
    tplVariables: any = {};
    hasCustomFilter = false;
    private subscription: Subscription = new Subscription();

    constructor(
        public dialog: MatDialog,
        private interCom: IntercomService,
        private util: UtilsService,
        private elRef: ElementRef
    ) { }

    ngOnInit() {
        this.initOptions();

        this.subscription.add(this.interCom.responseGet().subscribe(message => {
            if (message.action === 'TplVariables') {
                this.tplVariables = message.payload;
            }
        }));
        this.interCom.requestSend({
            action: 'GetTplVariables'
        });
    }

    initOptions() {
        const defaultOptions = {
            'enableGroupBy': true,
            'enableSummarizer': false,
            'enableMultipleQueries': false,
            'enableMultiMetricSelection': true };
        this.options = Object.assign(defaultOptions, this.options);
    }

    addNewQuery() {
        this.widget.queries.push(this.getNewQueryConfig());
    }

    getNewQueryConfig() {
        // const gconfig = this.util.getObjectByKey(this.widget.query.groups, 'id', gid);
        const query: any = { namespace: '' , metrics: [], filters: [] };
        switch (this.widget.settings.component_type) {
            case 'LinechartWidgetComponent':
            case 'HeatmapWidgetComponent':
            case 'BarchartWidgetComponent':
            case 'DonutWidgetComponent':
            case 'TopnWidgetComponent':
                query.settings = {
                                    visual: {
                                        visible: true,
                                    }
                                };
                break;
            case 'BignumberWidgetComponent':
                    query.settings = {
                        visual: {
                            visible: true,
                            queryID: 0
                        }
                    };
        }
        query.id = this.util.generateId(3, this.util.getIDs(this.widget.queries));
        return query;
    }

    getQueryLabel(query) {
        const index = this.widget.queries.findIndex(q => q.id === query.id);
        const label = 'Q' + (index + 1);
        return label;
    }

    ngOnChanges(changes: SimpleChanges) {
        // when editing mode is loaded, we need to temporary adding default UI state
        // to editing widget
        if ( changes.widget.currentValue ) {
            if ( !changes.widget.currentValue.queries.length ) {
                this.addNewQuery();
            }
        }
    }

    handleQueryRequest(message: any) {
        switch ( message.action ) {
            case 'ToggleQueryVisibility':
                this.widgetChange.emit({ id: message.id, action: 'ToggleQueryVisibility' });
                break;
            case 'ToggleQueryMetricVisibility':
                this.widgetChange.emit({ id: message.id, action: 'ToggleQueryMetricVisibility', payload: {  mid: message.payload.mid }});
                break;
            case 'CloneQuery':
                this.widgetChange.emit({ id: message.id, action: 'CloneQuery' });
                break;
            case 'DeleteQuery':
                this.widgetChange.emit({ id: message.id, action: 'DeleteQuery' });
                break;
            case 'DeleteQueryMetric':
                this.widgetChange.emit({ id: message.id, action: 'DeleteQueryMetric', payload: {  mid: message.payload.mid }});
                break;
            case 'QueryChange':
                this.updateQuery(message.payload.query);
                break;
            case 'SummarizerChange':
                this.widgetChange.emit({ id: message.id, action: 'SummarizerChange', payload:  { summarizer: message.payload.summarizer }});
                break;
        }
    }

    updateQuery(query) {
        console.log('widget-query :: updateQuery, query, gid', query);
        query.metrics = this.updateLabelsForTimeShift(query.metrics);
        const payload = { action: 'UpdateQuery', payload: { query: query } };
        this.newQueryId = '';
        this.widgetChange.emit(payload);

        // check if user manually add dashboard tag filters to common tags
        // clone it so we can handle it here
        const cWidget = this.util.deepClone(this.widget);
        const qIndx = cWidget.queries.findIndex(q => q.id === query.id);
        if (qIndx === -1) {
            cWidget.queries.push(query);
        } else {
            cWidget.queries[qIndx] = query;
        }
    }

    updateLabelsForTimeShift(metrics: any[]) {
        for (const metric of metrics) {
            const totalTimeShift = this.util.getTotalTimeShift(metric.functions);
            if (totalTimeShift) {
                if (metric.settings.visual.label === '' || metric.settings.visual.label.startsWith( metric.name + '-')) {
                    metric.settings.visual.label = metric.name + '-' + totalTimeShift;
                }
            } else { // timeshift potentially removed
                if (metric.settings.visual.label && metric.settings.visual.label.startsWith(metric.name + '-')) {
                    metric.settings.visual.label = '';
                }
            }
        }
        return metrics;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
