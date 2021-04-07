import { Component, OnInit, HostBinding, Input } from '@angular/core';

// import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition } from '@angular/material';

import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';

import { WidgetModel } from '../../../../../dashboard/state/widgets.state';

import {
    WidgetConfigAxesComponent,
    WidgetConfigGeneralComponent,
    WidgetConfigLegendComponent,
    WidgetConfigMetricQueriesComponent,
    WidgetConfigQueryInspectorComponent,
    WidgetConfigTimeComponent,
    WidgetConfigVisualAppearanceComponent
} from '../../../sharedcomponents/components';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'developer-widget',
    templateUrl: './developer-widget.component.html',
    styleUrls: []
})
export class DeveloperWidgetComponent implements OnInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.developer-widget') private _componentClass = true;

    /** Inputs */
    @Input() editMode: boolean;
    @Input() widget: WidgetModel;

    /** Outputs */

    /** Local variables */
    fakeData: any = [
        ['data-row-0-1', 'data-row-0-2', 'data-row-0-3', 'data-row-0-4', 'data-row-0-5', 'data-row-0-6', 'data-row-0-7', 'data-row-0-8'],
        ['data-row-1-1', 'data-row-1-2', 'data-row-1-3', 'data-row-1-4', 'data-row-1-5', 'data-row-1-6', 'data-row-1-7', 'data-row-1-8']
    ];

    // NOTE: widget types should only be temporary here, as they should be added to some starting point widget
    // Available Widget Types
    availableWidgetTypes: Array<object> = [
        {
            label: 'Bar Graph',
            type: 'WidgetBarGraphComponent',
            iconClass: 'widget-icon-bar-graph'
        },
        {
            label: 'Area Graph',
            type: 'WidgetAreaGraphComponent',
            iconClass: 'widget-icon-area-graph'
        },
        {
            label: 'Line Chart',
            type: 'LineChartComponent',
            // TODO: need to eventually switch to WidgetLineChartComponent
            // type: 'WidgetLineChartComponent',
            iconClass: 'widget-icon-line-chart'
        },
        {
            label: 'Big Number',
            type: 'WidgetBigNumberComponent',
            iconClass: 'widget-icon-big-number'
        },
        {
            label: 'Donut Chart',
            type: 'WidgetDonutChartComponent',
            iconClass: 'widget-icon-donut-chart'
        },
        {
            label: 'Statuses',
            type: 'WidgetStatusComponent',
            iconClass: 'widget-icon-statuses'
        },
        {
            label: 'Table',
            type: 'WidgetTableComponent',
            iconClass: 'widget-icon-table'
        }
    ];

    constructor(private interCom: IntercomService) { }

    ngOnInit() {
    }

    /**
     * Services
     */

    // None yet

    /**
     * Behaviors
     */

     closeViewEditMode() {
        this.interCom.requestSend(<IMessage>{
            action: 'closeViewEditMode',
            payload: 'dashboard'
        });
    }


}
