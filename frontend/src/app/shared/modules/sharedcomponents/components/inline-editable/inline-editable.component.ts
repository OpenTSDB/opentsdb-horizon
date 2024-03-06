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
import {
    Component,
    Input,
    EventEmitter,
    Output,
    ViewChild,
    Renderer2,
    ElementRef,
    HostListener,
    HostBinding,
    OnInit,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ChangeDetectionStrategy,
    AfterViewInit,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'inline-editable',
    templateUrl: './inline-editable.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./inline-editable.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InlineEditableComponent
implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @HostBinding('class.inline-editable') private _hostClass = true;

    @Input() fieldValue: string;
    @Input() minLength: number;
    @Input() maxLength: number;
    @Input() showEditIcon = false;
    @Output() updatedValue: EventEmitter<any> = new EventEmitter();
    @ViewChild('container', { static: true }) container: ElementRef;
    @ViewChild(MatInput, { static: true }) inputControl: MatInput;
    @ViewChild(MatInput, { read: ElementRef, static: true })
    inputControlEl: ElementRef;
    @ViewChild(MatFormField, { read: ElementRef, static: true })
    private formFieldEl: ElementRef;

    isRequired = true;
    isEditView = false;
    fieldFormControl: UntypedFormControl;
    placeholder = 'placeholder';

    private showEditableEventListener: any;
    private documentKeydownEventListener: any;

    constructor(
        private renderer: Renderer2,
        private eRef: ElementRef,
    ) {}

    ngOnInit() {
        if (!this.fieldValue || this.fieldValue.trim().length === 0) {
            this.fieldValue = this.placeholder;
        }

        this.fieldFormControl = new UntypedFormControl('', []);
        this.fieldFormControl.setValue(this.fieldValue);
        const validators: any[] = [];
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
        this.fixAutoWidth();
    }

    private fixAutoWidth() {
        // NOTE: this is for the autosizing of the function inputs
        // NOTE: css uses the data-value attribute to correctly size item
        // set the initial data-value
        // needs to live on the .mat-form-field-infix
        // aka, the wrapper around the actual input field
        const formFieldInfix: HTMLElement =
            this.formFieldEl.nativeElement.querySelector(
                '.mat-form-field-infix',
            );
        formFieldInfix.dataset.value = this.fieldValue;
    }

    noWhitespaceValidator(control: UntypedFormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { whitespace: true };
    }

    showEditable() {
        this.isEditView = true;

        setTimeout(() => {
            this.inputControlEl.nativeElement.focus();
        }, 200);

        this.documentKeydownEventListener = this.renderer.listen(
            'document',
            'keydown',
            (event) => {
                if (event.key === 'Escape') {
                    this.resetFormField();
                    // remove document.keydown listener
                    this.documentKeydownEventListener();
                    // remove document.click listener
                    // this.showEditableEventListener();
                    this.inputControlEl.nativeElement.blur();
                    document.body.focus();
                }
            },
        );
    }

    save() {
        // only save if no errors, not placeholder, and a change
        // eslint-disable-next-line max-len
        if (
            !this.fieldFormControl.errors &&
            this.fieldFormControl.value !== this.placeholder &&
            this.fieldValue !== this.fieldFormControl.value
        ) {
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
