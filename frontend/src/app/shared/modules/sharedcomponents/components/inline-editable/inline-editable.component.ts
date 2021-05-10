import {
    Component, Input, EventEmitter, Output, ViewChild, Renderer2,
    ElementRef, HostListener, HostBinding, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, AfterViewInit
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ConsoleService } from '../../../../../core/services/console.service';
import { MatFormField, MatInput } from '@angular/material';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'inline-editable',
    templateUrl: './inline-editable.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: []
})

export class InlineEditableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @HostBinding('class.inline-editable') private _hostClass = true;

    @Input() fieldValue: string;
    @Input() minLength: number;
    @Input() maxLength: number;
    @Input() showEditIcon: boolean = false;
    @Output() updatedValue: EventEmitter<any> = new EventEmitter();
    @ViewChild('container') container: ElementRef;
    @ViewChild(MatInput) inputControl: MatInput;
    @ViewChild(MatInput, {read: ElementRef}) inputControlEl: ElementRef;
    @ViewChild(MatFormField, {read: ElementRef}) private formFieldEl: ElementRef;

    isRequired = true;
    isEditView = false;
    fieldFormControl: FormControl;
    placeholder = 'placeholder';

    private showEditableEventListener: any;
    private documentKeydownEventListener: any;

    constructor(
        private renderer: Renderer2,
        private eRef: ElementRef,
        private console: ConsoleService
    ) { }

    ngOnInit() {

        if (!this.fieldValue || this.fieldValue.trim().length === 0) {
            this.fieldValue = this.placeholder;
        }

        this.fieldFormControl = new FormControl('', []);
        this.fieldFormControl.setValue(this.fieldValue);
        const validators: any[] = new Array;
        validators.push(Validators.required, this.noWhitespaceValidator);

        if (this.minLength) {
            validators.push(Validators.minLength(this.minLength));
        }
        if (this.maxLength) {
            validators.push(Validators.maxLength(this.maxLength));
        }
        this.fieldFormControl.setValidators(validators);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.fieldValue.currentValue) {
            this.fieldValue = changes.fieldValue.currentValue;
            // when dashboard load, this one is undefined
            if (this.fieldFormControl) {
                this.fieldFormControl.setValue(this.fieldValue);
            }
            this.fixAutoWidth();
        }
    }

    ngAfterViewInit() {
        this.fixAutoWidth()
    }

    private fixAutoWidth() {
        // NOTE: this is for the autosizing of the function inputs
        // NOTE: css uses the data-value attribute to correctly size item
        // set the initial data-value
        // needs to live on the .mat-form-field-infix
        // aka, the wrapper around the actual input field
        const formFieldInfix: HTMLElement = this.formFieldEl.nativeElement.querySelector('.mat-form-field-infix');
        formFieldInfix.dataset.value = this.fieldValue;
    }

    noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }

    showEditable() {
        this.isEditView = true;

        setTimeout(() => {
            this.inputControlEl.nativeElement.focus();
        }, 200);

        this.documentKeydownEventListener = this.renderer.listen('document','keydown', (event) => {
            if (event.key === 'Escape') {
                this.resetFormField();
                // remove document.keydown listener
                this.documentKeydownEventListener();
                // remove document.click listener
                //this.showEditableEventListener();
                this.inputControlEl.nativeElement.blur();
                document.body.focus();
            }
        });
    }

    save() {
        // only save if no errors, not placeholder, and a change
        // tslint:disable-next-line:max-line-length
        if (!this.fieldFormControl.errors && this.fieldFormControl.value !== this.placeholder && this.fieldValue !== this.fieldFormControl.value) {
            this.updatedValue.emit(this.fieldFormControl.value);
            this.fieldValue = this.fieldFormControl.value;
            this.isEditView = false;
        } else if (!this.fieldFormControl.errors) {
            this.resetFormField();
        }
        // remove document.keydown listener
        this.documentKeydownEventListener();
    }

    resetFormField() {
        this.isEditView = false;
        this.fieldFormControl.setValue(this.fieldValue);
    }

    ngOnDestroy() {
        if (this.documentKeydownEventListener) {
            this.documentKeydownEventListener();
        }
    }
}
