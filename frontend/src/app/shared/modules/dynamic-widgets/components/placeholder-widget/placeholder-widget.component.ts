import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'placeholder-widget',
    templateUrl: './placeholder-widget.component.html',
    styleUrls: ['./placeholder-widget.component.scss']
})
export class PlaceholderWidgetComponent  {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.placeholder-widget') private _componentClass = true;

    @Input() editMode: boolean;
    @Input() widget: any;
    @Output() loadNewWidget = new EventEmitter<any>();

    // Available Widget Types
    availableWidgetTypes: any[] = [
        {
            label: 'Bar Graph',
            type: 'BarchartWidgetComponent',
            iconClass: 'widget-icon-bar-graph'
        }, /*
        {
            label: 'Area Graph',
            type: 'WidgetAreaGraphComponent',
            iconClass: 'widget-icon-area-graph'
        }, */
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

    selectWidgetType(wtype: any) {
        this.loadNewWidget.emit(wtype);
    }

}
