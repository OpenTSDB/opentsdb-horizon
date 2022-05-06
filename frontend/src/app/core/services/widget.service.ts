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
import { Injectable } from '@angular/core';
import {
    PlaceholderWidgetComponent,
    LinechartWidgetComponent,
    HeatmapWidgetComponent,
    BarchartWidgetComponent,
    DonutWidgetComponent,
    TopnWidgetComponent,
    DeveloperWidgetComponent,
    BignumberWidgetComponent,
    MarkdownWidgetComponent,
    EventsWidgetComponent,
    TableWidgetComponent
} from '../../shared/modules/dynamic-widgets/components';

@Injectable({
    providedIn: 'root'
})
export class WidgetService {
    constructor() { }

    getComponentToLoad(name: string) {
        switch (name) {
            case 'LinechartWidgetComponent':
                return LinechartWidgetComponent;
            case 'HeatmapWidgetComponent':
                return HeatmapWidgetComponent;
            case 'BarchartWidgetComponent':
                return BarchartWidgetComponent;
            case 'DonutWidgetComponent':
                return DonutWidgetComponent;
            case 'TopnWidgetComponent':
                return TopnWidgetComponent;
            case 'DeveloperWidgetComponent':
                return DeveloperWidgetComponent;
            case 'BignumberWidgetComponent':
                return BignumberWidgetComponent;
            case 'MarkdownWidgetComponent':
                return MarkdownWidgetComponent;
            case 'EventsWidgetComponent':
                return EventsWidgetComponent;
            case 'TableWidgetComponent':
                    return TableWidgetComponent;
            default:
                return PlaceholderWidgetComponent;
        }
    }

    getWidgetDefaultSettings(name: string ) {
        let settings = {};
        switch (name) {
            case 'LinechartWidgetComponent':
                settings =  {
                    axes: {
                        y1: {},
                        y2: {}
                    },
                    legend: {
                        display: false,
                        position: 'bottom',
                        columns: []
                    },
                    chartOptions: {}
                };
                break;
            case 'DonutWidgetComponent':
                settings = {
                    dataSummary: true,
                    legend: {
                        display: true,
                        position: 'right',
                        showPercentages: false
                    }
                };
                break;
            case 'BarchartWidgetComponent':
                settings = {
                    dataSummary: true,
                    axes: {
                        y1: {}
                    }
                };
                break;
            case 'TopnWidgetComponent':
                settings = {
                    dataSummary: true,
                };
                break;
            case 'BignumberWidgetComponent':
                settings = {
                    dataSummary: true,
                    visual: {
                        queryID: 0
                    }
                };
        }
        return settings;
    }

    convertToNewType(type, widget) {
        // widget requires data series
        const series = ['LinechartWidgetComponent', 'HeatmapWidgetComponent'];
        // widget requires data summary
        const summary = ['BarchartWidgetComponent', 'DonutWidgetComponent', 'TopnWidgetComponent', 'BignumberWidgetComponent'];
        // multi metric widgets
        const isMulti = ['LinechartWidgetComponent', 'BarchartWidgetComponent', 'DonutWidgetComponent', 'TableWidgetComponent'].includes(type);
        // summarizer required
        const summarizer = type !== 'LinechartWidgetComponent' && type !== 'HeatmapWidgetComponent' && type !== 'TableWidgetComponent';
        const queries = widget.queries;
        let hasVisible = false;
        const source = widget.settings.component_type;
        widget.settings.component_type = type;
        /* eslint-disable max-len */
        const needRefresh = type === 'BignumberWidgetComponent' || !( series.includes(source) && series.includes(type) || summary.includes(source) && summary.includes(type));
        // query override
        for (let i = 0;  i < queries.length; i++) {
            for (let j = 0;  j < queries[i].metrics.length; j++) {
                if ( !isMulti && hasVisible ) {
                    queries[i].metrics[j].settings.visual.visible = false;
                }
                if ( !summarizer ) {
                    delete queries[i].metrics[j].summarizer;
                } else {
                    queries[i].metrics[j].summarizer =  queries[i].metrics[j].summarizer || 'avg';
                }
                if ( queries[i].metrics[j].settings.visual.visible ) {
                    hasVisible = true;
                }
                // remove the metric settings
                let msettings = ['lineType', 'lineWeight', 'type', 'axis'];
                // big number doesn't have groupby
                if ( type === 'BignumberWidgetComponent' ) {
                    delete queries[i].metrics[j].groupByTags;
                    delete queries[i].metrics[j].settings.visual.label;
                    delete queries[i].metrics[j].settings.visual.color;
                }
                if ( type === 'TopnWidgetComponent' || type === 'HeatmapWidgetComponent' ) {
                    delete queries[i].metrics[j].settings.visual.color;
                }
                if ( source === 'LinechartWidgetComponent' ) {
                    for ( let k = 0; k < msettings.length; k++ ) {
                        const key = msettings[k];
                        delete queries[i].metrics[j].settings.visual[key];
                    }
                }
            }
        }
        const defSettings: any = this.getWidgetDefaultSettings(type);

        // override axes, linechart and barchart have axes in commmon
        if ( ['LinechartWidgetComponent', 'BarchartWidgetComponent'].includes(type) ) {
            const oAxesConfig = widget.settings.axes || {};
            widget.settings.axes = defSettings.axes;
            for ( const k in widget.settings.axes ) {
                if ( oAxesConfig[k] ) {
                    widget.settings.axes[k] = oAxesConfig[k];
                }
            }
        } else {
            delete widget.settings.axes;
        }

        // override visual
        const oVisualConf = widget.settings.visual || {};
        const visual: any = defSettings.visual || {};
        // bignumber, heatmap and topn have units
        if ( oVisualConf.unit && ['BignumberWidgetComponent', 'HeatmapWidgetComponent', 'TopnWidgetComponent', ].includes(type) ) {
            visual.unit = oVisualConf.unit;
        }

        if ( ['HeatmapWidgetComponent', 'TopnWidgetComponent', ].includes(type) ) {
            visual.color = type === 'HeatmapWidgetComponent' ? '#3F00FF' : '#dff0ff';
        }


        // bignumber and topn widgets have visual conditions
        if ( oVisualConf.conditions && ['BignumberWidgetComponent', 'TopnWidgetComponent'].includes(type)) {
            visual.conditions = oVisualConf.conditions;
        }
        widget.settings.visual = visual;

        // override legend
        const oLegendConfig = widget.settings.legend || {};
        widget.settings.legend = defSettings.legend || {};
        // line and donut have legend configuration
        if (  oLegendConfig &&  ['LinechartWidgetComponent', 'DonutWidgetComponent'].includes(type) ) {
            for ( const k in widget.settings.legend ) {
                if ( oLegendConfig[k] ) {
                    widget.settings.legend[k] = oLegendConfig[k];
                }
            }
        } else {
            delete widget.settings.legend;
        }

        // sorting preference, the following don't have sorting preference
        if  ( ['BignumberWidgetComponent', 'LinechartWidgetComponent', 'HeatmapWidgetComponent', 'TableWidgetComponent'].includes(type) ) {
            delete widget.settings.sorting;
        }

        if ( source === 'LinechartWidgetComponent' ) {
            delete widget.eventQueries;
            delete widget.settings.multigraph;
        }
        return [ widget, needRefresh ];
      }
}
