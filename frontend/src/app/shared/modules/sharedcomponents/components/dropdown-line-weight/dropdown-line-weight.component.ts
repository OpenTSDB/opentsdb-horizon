import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-line-weight',
  templateUrl: './dropdown-line-weight.component.html',
  styleUrls: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownLineWeightComponent),
      multi: true,
    }]
})

export class DropdownLineWeightComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @HostBinding('class.dropdown-line-weight') private _hostClass = true;

    @Input() value;

    @Output()
    valueChange = new EventEmitter<string>();

    lineWeightOptions: Array<object> = [
        {
            label: '0.5px',
            value: '0.5px'
        },
        {
            label: '1px',
            value: '1px'
        },
        {
            label: '2px',
            value: '2px'
        },
        {
            label: '3px',
            value: '3px'
        },
        {
            label: '4px',
            value: '4px'
        },
        {
            label: '5px',
            value: '5px'
        },
        {
            label: '6px',
            value: '6px'
        }
    ];

    lineWeightControl: FormControl;
    defaultLineWeight = '1px';

    subscription: Subscription;

    constructor() { }

    // the method set in registerOnChange to emit changes back to the form
    propagateChange = ( _: any ) => {};

    public writeValue(v: any) {
        if (v) {
            this.lineWeightControl.setValue(v);
        }
    }

    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    public registerOnTouched() { }

    ngOnInit() {
        if ( !this.value ) {
            this.value = this.defaultLineWeight;
            this.propagateChange(this.value);
        }
        this.lineWeightControl = new FormControl( this.value );
        this.subscription = this.lineWeightControl.valueChanges.subscribe( data => {
            this.propagateChange(data);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
