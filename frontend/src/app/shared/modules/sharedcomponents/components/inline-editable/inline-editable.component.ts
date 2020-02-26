import { Component, Input, EventEmitter, Output, ViewChild, Renderer2,
          ElementRef, HostListener, HostBinding, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'inline-editable',
  templateUrl: './inline-editable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: []
})

export class InlineEditableComponent implements OnInit, OnChanges {
  @HostBinding('class.inline-editable') private _hostClass = true;

  @Input() fieldValue: string;
  @Input() minLength: number;
  @Input() maxLength: number;
  @Output() updatedValue: EventEmitter<any> = new EventEmitter();
  @ViewChild('container') container: ElementRef;

  isRequired = true;
  isEditView = false;
  fieldFormControl: FormControl;
  placeholder = '_placeholder';

  constructor(private renderer: Renderer2, private eRef: ElementRef) { }

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
    }
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  showEditable() {
    this.isEditView = true;

     // click outside the edit zone
    this.renderer.listen('document', 'click', (event) => {
      if (!this.container.nativeElement.contains(event.target)) {
        this.resetFormField();
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
  }

  resetFormField() {
    this.isEditView = false;
    this.fieldFormControl.setValue(this.fieldValue);
  }

  @HostListener('document:keydown', ['$event'])
  closeEditIfEscapePressed(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.resetFormField();
    }
  }
}
