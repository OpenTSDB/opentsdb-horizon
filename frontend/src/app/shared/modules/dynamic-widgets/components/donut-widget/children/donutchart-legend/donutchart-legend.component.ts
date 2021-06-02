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
