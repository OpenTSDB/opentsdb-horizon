import { Component, OnInit, OnChanges, SimpleChanges, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/*
export interface VisualizationData {
    color: string;
    lineWeight: string;
    lineType: string;
  }
*/
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-visual-appearance',
    templateUrl: './widget-config-visual-appearance.component.html',
    styleUrls: []
})
export class WidgetConfigVisualAppearanceComponent implements OnInit, OnChanges  {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.visual-appearance-configuration') private _tabClass = true;
    @HostBinding('class.has-columns') private _modifierClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    dataSources = [];

    gForms = new FormGroup({});

    displayControl: FormControl;
    stackOrderControl: FormControl;

    gSubscriptions: Subscription[] = [];

    stackOrderOptions: Array<any> = [
        {
            label: 'Metric',
            value: 'metric'
        },
        {
            label: 'AVG',
            value: 'avg'
        },
        {
            label: 'MIN',
            value: 'min'
        },
        {
            label: 'MAX',
            value: 'max'
        },
        {
            label: 'SUM',
            value: 'sum'
        },
        {
            label: 'FIRST',
            value: 'first'
        },
        {
            label: 'LAST',
            value: 'last'
        }
    ];

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
    }
    ngOnChanges( changes: SimpleChanges ) {
        let enableStackOrderCntrl = false;

        if ( !changes.widget ) {
            return;
        }
        // all others - LineChart, BarChart, DonutChart
        this.widget.queries.forEach((query, index) => {
            if (this.widget.settings.component_type === 'LinechartWidgetComponent') {
                for ( let i = 0; i < query.metrics.length; i++ ) {
                    const type = query.metrics[i].settings.visual.type;
                    if ( type === 'area' || type === 'bar' ) {
                        enableStackOrderCntrl = true;
                    }
                }
            }
        });

        if (this.widget.settings.component_type !== 'LinechartWidgetComponent') {
            const displayControlDefault = (this.widget.settings.component_type === 'DonutWidgetComponent') ? 'doughnut' : 'vertical';
            this.displayControl = new FormControl(this.widget.settings.visual.type || displayControlDefault);
        } else {
            if ( !this.stackOrderControl ) {
                this.stackOrderControl = new FormControl(this.widget.settings.visual.stackOrder || 'metric');
            }
            if ( enableStackOrderCntrl ) {
                this.stackOrderControl.enable({emitEvent: false});
            } else {
                this.stackOrderControl.disable({emitEvent: false});
            }
        }
        /*
        switch ( this.widget.settings.component_type ) {
            case 'BarchartWidgetComponent':
                this.displayControl = new FormControl(this.widget.query.settings.visual.type || 'vertical');
            break;
            case 'DonutWidgetComponent':
                this.displayControl = new FormControl(this.widget.query.settings.visual.type || 'doughnut');
            break;
        }*/

        this.gForms.updateValueAndValidity( { emitEvent: false });
        if ( this.displayControl ) {
            this.displayControl.valueChanges.subscribe( d => {
                this.widgetChange.emit( {'action': 'ChangeVisualization', payload: { type: d }});
            });
        }

        if ( this.stackOrderControl ) {
            this.stackOrderControl.valueChanges.subscribe( d => {
                this.widgetChange.emit( {'action': 'SetStackOrder', payload: { orderBy: d }});
            });
        }
    }

    selectColor(color, gIndex, index ) {
        this.gForms.controls[gIndex]['controls'][index]['controls'].color.setValue(color.hex);
    }

    // for stacked barcharts
    selectStackColor(color, index ) {
        this.gForms.controls['stacks']['controls'][index]['controls'].color.setValue(color.hex);
    }

    setVisualConditions(conditions) {
        this.widgetChange.emit( {'action': 'SetVisualConditions', payload: { data: conditions}});
    }

    setUnit( value ) {
        this.widgetChange.emit( {'action': 'SetUnit', payload: { data: value}});
    }
}
