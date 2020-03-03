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

    gForms: FormGroup;

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
        this.gForms = new FormGroup({});
        let enableStackOrderCntrl = false;

        // all others - LineChart, BarChart, DonutChart
        this.widget.queries.forEach((query, index) => {
            this.dataSources[index] = query.metrics;
            this.gForms.addControl(index, this.createFormArray(this.dataSources[index]));
            if (this.widget.settings.component_type === 'LinechartWidgetComponent') {
                for ( let i = 0; i < query.metrics.length; i++ ) {
                    const type = query.metrics[i].settings.visual.type;
                    if ( type === 'area' || type === 'bar' ) {
                        enableStackOrderCntrl = true;
                    }
                }
            }
        });
        // console.log(this.gForms, 'this.gforms');

        if (this.widget.settings.component_type !== 'LinechartWidgetComponent') {
            const displayControlDefault = (this.widget.settings.component_type === 'DonutWidgetComponent') ? 'doughnut' : 'vertical';
            this.displayControl = new FormControl(this.widget.settings.visual.type || displayControlDefault);
        } else {
            this.stackOrderControl = new FormControl( {
                                                        value: this.widget.settings.visual.stackOrder || 'metric',
                                                        disabled: !enableStackOrderCntrl
                                                        }
                                                    );
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

        if ( this.displayControl ) {
            this.displayControl.valueChanges.subscribe( d => {
                // console.log('display changed', d );
                this.widgetChange.emit( {'action': 'ChangeVisualization', payload: { type: d }});
            });
        }

        if ( this.stackOrderControl ) {
            this.stackOrderControl.valueChanges.subscribe( d => {
                this.widgetChange.emit( {'action': 'SetStackOrder', payload: { orderBy: d }});
            });
        }

        Object.keys(this.gForms.controls).forEach( gIndex => {
            this.gSubscriptions[gIndex] = this.gForms.get(gIndex).valueChanges.subscribe(data => {
                // console.log(data, 'data....');
                this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: gIndex, data: data }});
            });
        });

    }
    ngOnChanges( changes: SimpleChanges ) {

    }
    createFormArray(ds): FormArray {
        switch ( this.widget.settings.component_type ) {
            case 'BarchartWidgetComponent':
            case 'DonutWidgetComponent':
            case 'TopnWidgetComponent':
            case 'HeatmapWidgetComponent':
                return new FormArray(ds.map(item => new FormGroup({
                    label : new FormControl(item.settings.visual.label),
                    color : new FormControl(item.settings.visual.color)
                })));
            case 'LinechartWidgetComponent':
                return new FormArray(ds.map(item => new FormGroup({
                    type: new FormControl( item.settings.visual.type || 'line'),
                    label : new FormControl(item.settings.visual.label),
                    color : new FormControl(item.settings.visual.color),
                    lineWeight : new FormControl(item.settings.visual.lineWeight || '1px'),
                    lineType: new FormControl(item.settings.visual.lineType || 'solid'),
                    axis: new FormControl( item.settings.visual.axis || 'y1' )
                })));
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

    setVisualType(type, qIndex, index ) {
        let axis = null;
        let hasStackType = type === 'area' || type === 'bar';
        if (this.widget.settings.component_type === 'LinechartWidgetComponent') {
            for ( let i = 0; i < this.widget.queries.length; i++ ) {
                for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                    const vType = this.widget.queries[i].metrics[j].settings.visual.type;
                    if ( (i !== qIndex || (i === qIndex && j !== index)) ) {
                        if ( vType === type ) {
                            axis = this.widget.queries[i].metrics[j].settings.visual.axis;
                        }
                        if ( vType === 'area' || vType === 'bar' ) {
                            hasStackType = true;
                        }
                    }
                }
            }
            if ( axis !== null && (type === 'area' || type === 'bar') ) {
                this.gForms.controls[qIndex]['controls'][index]['controls'].axis.setValue(axis, {emitEvent: false});
            }

            // move area or bar to new type
            if ( type === 'area' || type === 'bar' ) {
                const axis = this.gForms.controls[qIndex]['controls'][index]['controls'].axis.value;
                for ( let i = 0; i < this.widget.queries.length; i++ ) {
                    for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                        const vType = this.widget.queries[i].metrics[j].settings.visual.type;
                        if ( (i !== qIndex || (i === qIndex && j !== index)) && type !== vType && vType !== 'line') {
                            this.gForms.controls[i]['controls'][j]['controls'].type.setValue(type, {emitEvent: false, emitModelToViewChange: true});
                            this.gForms.controls[i]['controls'][j]['controls'].axis.setValue(axis, {emitEvent: false, emitModelToViewChange: true});
                        }
                    }
                    if  (i !== qIndex ) {
                        this.gForms.controls[i].updateValueAndValidity({ emitEvent: true });
                    }
                }
            }
            // enable the stackOrder control
            if ( hasStackType ) {
                this.stackOrderControl.enable();
            } else {
                this.stackOrderControl.disable();
            }
        }
        this.gForms.controls[qIndex]['controls'][index]['controls'].type.setValue(type);
    }

    setAxis(axis, qIndex, index ) {
        const type = this.widget.queries[qIndex].metrics[index].settings.visual.type;
        // make same axis for area or bar type
        if (this.widget.settings.component_type === 'LinechartWidgetComponent' && ( type === 'area' || type === 'bar' )) {
            for ( let i = 0; i < this.widget.queries.length; i++ ) {
                for ( let j = 0; j < this.widget.queries[i].metrics.length; j++ ) {
                    // tslint:disable-next-line: max-line-length
                    if ( (i !== qIndex || (i === qIndex && j !== index)) && this.widget.queries[i].metrics[j].settings.visual.type === type ) {
                        this.gForms.controls[i]['controls'][j]['controls'].axis.setValue(axis, {emitEvent: false});
                    }
                }
                if  (i !== qIndex ) {
                    this.gForms.controls[i].updateValueAndValidity({ emitEvent: true });
                }
            }
        }
        this.gForms.controls[qIndex]['controls'][index]['controls'].axis.setValue(axis);
    }
}
