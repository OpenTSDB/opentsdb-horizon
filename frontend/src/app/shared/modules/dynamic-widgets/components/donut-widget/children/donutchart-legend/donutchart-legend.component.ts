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
import { Component, OnInit,  HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'donutchart-legend',
  templateUrl: './donutchart-legend.component.html',
  styleUrls: []
})
export class DonutchartLegendComponent implements OnInit {

    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.donutchart-legend-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;


    gForm: FormGroup;

    subs: Subscription;

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

    percentagesOptions: any[] = [
        {
            label: 'Show',
            value: true
        },
        {
            label: 'Hide',
            value: false
        }
    ];

    valueOptions: any[] = [
        {
            label: 'Show',
            value: true
        },
        {
            label: 'Hide',
            value: false
        }
    ];

    positionOptions: any[] = [
        {
            label: 'Right',
            value: 'right'
        },
        {
            label: 'Left',
            value: 'left'
        }
    ];

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.gForm = new FormGroup({
            display : new FormControl(this.widget.settings.legend.display || false),
            position: new FormControl(this.widget.settings.legend.position ||  'right'),
            showPercentages: new FormControl( this.widget.settings.legend.showPercentages || false),
            showValue: new FormControl( this.widget.settings.legend.showValue || false)
        });

        this.subs = this.gForm.valueChanges.subscribe(data => {
            this.widgetChange.emit( {action: 'SetLegend', payload: {data: data} } );
        });
    }

    setPercentage(isVisible) {
        if ( isVisible && this.gForm.controls['showValue'].value ) {
            this.gForm['controls']['showValue'].setValue(!isVisible, { emitEvent: false, onlySelf: true });
        }
        this.gForm['controls']['showPercentages'].setValue(isVisible);
    }

    setValue(isVisible) {
        if ( isVisible && this.gForm.controls['showPercentages'].value ) {
            this.gForm['controls']['showPercentages'].setValue(!isVisible, { emitEvent: false, onlySelf: true });
        }
        this.gForm['controls']['showValue'].setValue(isVisible);
    }
}
