import {
    AfterViewInit, Attribute, Component, ElementRef,
    forwardRef, HostBinding, Input, OnDestroy,
    OnInit, Provider, Renderer2, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInput, MatFormField } from '@angular/material';
import { Subscription } from 'rxjs';

const GENERIC_INPUT_CONTROL_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AdminConfigGenericInputComponent),
    multi: true,
};

@Component({
    selector: 'app-admin-config-generic-input',
    templateUrl: './admin-config-generic-input.component.html',
    styleUrls: ['./admin-config-generic-input.component.scss'],
    providers: [
        GENERIC_INPUT_CONTROL_VALUE_ACCESSOR
    ]
})
export class AdminConfigGenericInputComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

    @HostBinding('class') get classAttribute(): string {
        let defaultClasses = 'app-admin-config-generic-input form-group';
        return defaultClasses + ' ' + this.classNames;
    }
    @HostBinding('class.row-align') get horizontalAlignClass(): boolean { return this.horizontalAlign; }

    @ViewChild(MatInput) inputControl: MatInput;
    @ViewChild(MatInput, {read: ElementRef}) inputControlEl: ElementRef;
    @ViewChild(MatFormField, {read: ElementRef}) private formFieldEl: ElementRef;

    @Input() inputType: string = 'text'; // TODO: limit to the types with an enum, or possible templates
    @Input() inputPlaceholder: string = 'Enter value';
    @Input() inputLabel: string;

    @Input() hasErrors: boolean = false;
    @Input() errorMsg: any;

    // should label and input be aligned in row?
    // true: aligns label and input on same line
    // false: label aligns above input (default)
    @Input() horizontalAlign: boolean = false;

    inputValue: any;
    inputValueControl: FormControl = new FormControl(null);

    disabled: boolean = false;
    private onTouched!: Function;
    private onChanged!: Function;

    private subscription: Subscription = new Subscription();

    constructor(
        @Attribute('class') public classNames: string,
        private renderer: Renderer2,
        private eRef: ElementRef
    ) { }

    ngOnInit() {
        this.subscription.add(this.inputValueControl.valueChanges.subscribe((changes: any) => {
            this.inputValueChange(changes);
        }));
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.fixAutoWidth();
        }, 200);
    }

    private fixAutoWidth() {
        // NOTE: this is for the autosizing of the function inputs
        // NOTE: css uses the data-value attribute to correctly size item
        // set the initial data-value
        // needs to live on the .mat-form-field-infix
        // aka, the wrapper around the actual input field
        const formFieldInfix: HTMLElement = this.formFieldEl.nativeElement.querySelector('.mat-form-field-infix');
        formFieldInfix.dataset.value = this.inputValue;
    }

    private inputValueChange(value: any) {
        if (this.onTouched) {
            this.onTouched();
        }
        this.inputValue = value;
        this.fixAutoWidth();
        if (this.onChanged) {
            this.onChanged(value);
        }
    }

    // CONTROL VALUE ACCESSOR IMPLEMENTATIONS
    writeValue(value: any): void {
        this.inputValueControl.setValue(value);
    }

    registerOnChange(fn: any): void {
        this.onChanged = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
        if (disabled) {
            this.inputValueControl.disable();
        } else {
            this.inputValueControl.enable();
        }
    }

    // DESTROY LAST
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
