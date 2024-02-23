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
    Output,
    EventEmitter,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'placeholder-widget',
    templateUrl: './placeholder-widget.component.html',
    styleUrls: ['./placeholder-widget.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PlaceholderWidgetComponent {
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
            iconClass: 'widget-icon-bar-graph',
        } /*
        {
            label: 'Area Graph',
            type: 'WidgetAreaGraphComponent',
            iconClass: 'widget-icon-area-graph'
        }, */,
        {
            label: 'Line Chart',
            type: 'LinechartWidgetComponent',
            iconClass: 'widget-icon-line-chart',
        },
        {
            label: 'Heatmap',
            type: 'HeatmapWidgetComponent',
            iconClass: 'widget-icon-heatmap',
        },
        {
            label: 'Big Number',
            type: 'BignumberWidgetComponent',
            iconClass: 'widget-icon-big-number',
        },
        {
            label: 'Donut Chart',
            type: 'DonutWidgetComponent',
            iconClass: 'widget-icon-donut-chart',
        },
        {
            label: 'Top N',
            type: 'TopnWidgetComponent',
            iconClass: 'widget-icon-topn-chart',
        },
        {
            label: 'Notes',
            type: 'MarkdownWidgetComponent',
            iconClass: 'widget-icon-notes',
        },
        {
            label: 'Events',
            type: 'EventsWidgetComponent',
            iconClass: 'widget-icon-events',
        },
        {
            label: 'Table',
            type: 'TableWidgetComponent',
            iconClass: 'widget-icon-table',
        },
        /* ,
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
