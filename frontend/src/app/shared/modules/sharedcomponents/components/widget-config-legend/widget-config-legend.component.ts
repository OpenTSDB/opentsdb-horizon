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
import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'widget-config-legend',
    templateUrl: './widget-config-legend.component.html',
    styleUrls: ['./widget-config-legend.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WidgetConfigLegendComponent implements OnInit, OnDestroy {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.legend-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    /** Form Group */
    widgetConfigLegend: FormGroup;

    // subscriptions
    subscription: Subscription;
    formatsubs: Subscription;

    /** Form Control Options */

    visibilityOptions: any[] = [
        {
            label: 'Visible',
            value: true
        },
        {
            label: 'Hidden',
            value: false
        }
    ];

    formatOptions: any[] = [
        {
            label: 'Inline',
            value: 'inline'
        },
        {
            label: 'Table',
            value: 'table'
        }
    ];

    columns: any[] = [
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
            label: 'Sum',
            value: 'sum'
        },
        {
            label: 'Last',
            value: 'last'
        }
    ];
    tags = [];
    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.widget.settings.legend.columns = this.widget.settings.legend.columns || [];
        // populate form controls
        this.createForm();
        for (let i = 0; i < this.widget.queries.length; i++) {
            const query = this.widget.queries[i];
            for ( let j = 0; query.filters && j < query.filters.length; j++ ) {
                if ( query.filters[j].groupBy ) {
                    this.tags.push(query.filters[j].tagk);
                }
            }
        }
    }

    createForm() {

        this.widgetConfigLegend = this.fb.group({
            display:   new FormControl( this.widget.settings.legend.display || false ),
            position: new FormControl(this.widget.settings.legend.position || 'bottom'),
            columns: new FormControl(this.widget.settings.legend.columns),
            tags: new FormControl(this.widget.settings.legend.tags || [])
        });

        this.subscription = this.widgetConfigLegend.valueChanges
                                                        .pipe(debounceTime(500))
                                                        .subscribe(data => {
                                                            this.widgetChange.emit( {action: 'SetLegend', payload: {data: data} } );
                                                        });

        // this.formatsubs = this.widgetConfigLegend.controls.format.valueChanges.subscribe( format => {
            // this.widgetConfigLegend.controls.position.setValue(format === 'table' ? 'right' : 'bottom');
        // });
    }

    setLegendColumns(e) {
        const column = e.source.value;
        const columns = this.widgetConfigLegend.controls.columns.value;
        if ( e.checked ) {
            columns.push(column);
        } else {
            columns.splice( columns.indexOf(column),1);
        }
        this.widgetConfigLegend.controls.columns.setValue(columns);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
