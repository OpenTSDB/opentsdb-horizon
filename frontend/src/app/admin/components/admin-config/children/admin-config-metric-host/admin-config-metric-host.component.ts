import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatLegacyFormField as MatFormField } from '@angular/material/legacy-form-field';
import { MatLegacyInput as MatInput } from '@angular/material/legacy-input';

@Component({
    selector: 'app-admin-config-metric-host',
    templateUrl: './admin-config-metric-host.component.html',
    styleUrls: ['./admin-config-metric-host.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminConfigMetricHostComponent
implements OnInit, OnChanges, AfterViewInit {
    @HostBinding('class') classAttribute =
    'app-admin-config-metric-host';
    @HostBinding('class.editing-mode') private get tplEdit() {
        return this.editMode;
    }
    @HostBinding('class.reading-mode') private get tplRead() {
        return !this.editMode;
    }

    @ViewChild(MatInput) inputControl: MatInput;
    @ViewChild(MatInput, { read: ElementRef }) inputControlEl: ElementRef;
    @ViewChild(MatFormField, { read: ElementRef })
    private formFieldEl: ElementRef;

    @Input() host: UntypedFormControl;
    @Input() index: number;

    @Output() metricHostUpdate: EventEmitter<any> = new EventEmitter();

    hostValue: any;

    needDeleteConfirm = false;

    private _originalValue: any;

    private _editMode = false;

    @Input()
    get editMode(): boolean {
        return this._editMode;
    }

    set editMode(mode: boolean) {
        this._editMode = mode;
        if (this._editMode === true) {
            this._originalValue = this.host.value;
        }
        // this.tplEdit = !this.editMode ? false : true;
        // this.tplRead = !this.tplEdit;
    }

    constructor(
        private renderer: Renderer2,
        private eRef: ElementRef,
    ) {}

    ngOnInit() {
        this.hostValue = this.host.value;

        if (this.host.value === '_new_') {
            this.editMode = true;
            this.hostValue = '';
            this.host.setValue('');
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.fixAutoWidth();
        }, 200);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hostValue && changes.hostValue.currentValue) {
            this.hostValue = changes.hostValue.currentValue;
            // when dashboard load, this one is undefined
            if (this.host) {
                this.host.setValue(this.hostValue);
            }
            this.fixAutoWidth();
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;

        if (this.editMode === true) {
            this.hostValue = this.host.value;
            setTimeout(() => {
                this.fixAutoWidth();
                this.inputControlEl.nativeElement.focus();
            }, 200);
        }
    }

    apply() {
        // do something
        this.toggleEditMode();
    }

    cancel() {
        // do something... maybe revert?
        if (this._originalValue === '_new_') {
            this.metricHostUpdate.emit({
                action: 'remove',
                index: this.index,
            });
        }
        this.host.setValue(this._originalValue);
        this.toggleEditMode();
    }

    delete() {
        this.needDeleteConfirm = true;
    }

    deleteConfirm() {
        this.metricHostUpdate.emit({
            action: 'remove',
            index: this.index,
        });
    }

    deleteCancel() {
        this.needDeleteConfirm = false;
    }

    private fixAutoWidth() {
        if (this.editMode) {
            // NOTE: this is for the autosizing of the function inputs
            // NOTE: css uses the data-value attribute to correctly size item
            // set the initial data-value
            // needs to live on the .mat-form-field-infix
            // aka, the wrapper around the actual input field
            const formFieldInfix: HTMLElement =
                this.formFieldEl.nativeElement.querySelector(
                    '.mat-form-field-infix',
                );
            formFieldInfix.dataset.value = this.hostValue;
        }
    }
}
