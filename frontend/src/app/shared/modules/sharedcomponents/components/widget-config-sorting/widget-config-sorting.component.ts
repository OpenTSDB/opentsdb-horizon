import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { FormGroup , FormBuilder, Validators, ValidatorFn, AbstractControl, FormControl} from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'widget-config-sorting',
  templateUrl: './widget-config-sorting.component.html',
  styleUrls: ['./widget-config-sorting.component.scss']
})
export class WidgetConfigSortingComponent implements OnInit {

  @HostBinding('class') private _hostClass = true;

  /** Inputs */
  @Input() widget: any;

  /** Outputs */
  @Output() widgetChange = new EventEmitter;

  limitForm: FormGroup;
  searchField: FormControl;
  order: string;
  limit: number;
  decimals: number;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.limitForm = this.formBuilder.group({
      limitInput: ['', [ Validators.min(1), Validators.max(1000), Validators.required, this.integerValidator()]],
    });

    if (!this.widget.settings.sorting || !this.widget.settings.sorting.order || !this.widget.settings.sorting.limit) {
      this.order = 'top';
      this.limitForm.setValue( {limitInput: 25});
      this.limit = 25;
      this.widgetChange.emit( {action: 'SetSorting', payload: {order: this.order, limit: this.limit} } );
    } else {
      this.order = this.widget.settings.sorting.order;
      this.limit = this.widget.settings.sorting.limit;
      this.limitForm.setValue( {limitInput: this.limit});
    }

    this.decimals = this.widget.settings.visual.decimals !== undefined ? this.widget.settings.visual.decimals : 2; 
}

  // convenience getter for easy access to form fields
  get formFields() { return this.limitForm.controls; }

  limitInputChanged() {
    if (!this.formFields.limitInput.errors) {
      this.limit = this.limitForm.value.limitInput;
      this.widgetChange.emit( {action: 'SetSorting', payload: {order: this.order, limit: this.limit} } );
    }
  }

  setDecimals(v) {
    this.widgetChange.emit( { action: 'UpdateQueryMetricVisual', payload: { visual: { 'decimals': v } } } );
  }

  integerValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        let forbidden = true;
        if (Number.isInteger(control.value)) {
            forbidden = false;
        }
        return forbidden ? {'format': {value: control.value}} : null;
    };
  }

  orderChanged(event) {
    this.order = event.value;
    this.widgetChange.emit( {action: 'SetSorting', payload: {order: this.order, limit: this.limit} } );
  }

}
