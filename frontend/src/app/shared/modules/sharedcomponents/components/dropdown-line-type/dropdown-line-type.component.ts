import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-line-type',
  templateUrl: './dropdown-line-type.component.html',
  styleUrls: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownLineTypeComponent),
      multi: true,
    }]
})
export class DropdownLineTypeComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @HostBinding('class.dropdown-line-type') private _hostClass = true;

    @Input() value;

    @Output()
    valueChange = new EventEmitter<string>();

    lineTypeOptions: Array<object> = [
        {
            label: 'Solid',
            value: 'solid'
        },
        {
            label: 'Dotted',
            value: 'dotted'
        },
        {
            label: 'Dashed',
            value: 'dashed'
        },
        {
            label: 'Dot-Dashed',
            value: 'dot-dashed'
        }
    ];

    lineTypeControl: FormControl;
    defaultLineType = 'solid';

    subscription: Subscription;

    get triggerLabel(): string {
        const val: string = this.lineTypeControl.value;
        const obj: any = this.lineTypeOptions.filter(function(opt: any) {
            return opt.value === val;
        });
        return obj[0].label;
    }

    constructor() { }

    // the method set in registerOnChange to emit changes back to the form
    propagateChange = ( _: any ) => {};

    public writeValue(v: any) {
        if (v) {
            this.lineTypeControl.setValue(v);
        }
    }

    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    public registerOnTouched() { }

    ngOnInit() {
        if ( !this.value ) {
            this.value = this.defaultLineType;
            this.propagateChange(this.value);
        }
        this.lineTypeControl = new FormControl( this.value );
        this.subscription = this.lineTypeControl.valueChanges.subscribe( data => {
            this.propagateChange(data);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
