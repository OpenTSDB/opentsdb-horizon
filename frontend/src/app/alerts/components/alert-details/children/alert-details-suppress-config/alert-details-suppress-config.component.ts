import { Component,OnInit, OnChanges, SimpleChanges, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'alert-details-suppress-config',
  templateUrl: './alert-details-suppress-config.component.html'
})
export class AlertDetailsSuppressConfigComponent implements OnInit, OnChanges {

  @HostBinding('class.alert-details-suppress-config-component') private _hostClass = true;

  @Input() tags = [];
  @Input() data: any = {};
  @Input() config: any = null;
  @Output() configChange = new EventEmitter();
  canSuppressAlert = true;
  metricEdit= false;
  suppressForm: FormGroup;
  constructor( private fb: FormBuilder ) { }

  ngOnInit() {
    this.setupForm();
  }

  ngOnChanges( changes: SimpleChanges ) {
    if (changes.config && changes.config.previousValue && changes.config.currentValue) {
        this.updateForm();
    }
  }

  setupForm(update= false) {
    this.suppressForm = this.fb.group({
      query: this.fb.group({
          namespace: this.config ? this.config.query.namespace : '',
          metric: this.fb.group({ 
              name: this.config ? this.config.query.metric.name : '',
              tagAggregator: this.config ? this.config.query.metric.tagAggregator : 'sum',
              groupByTags: this.config ? [ this.config.query.metric.groupByTags ] : []
          }),
      }),
      comparisonOperator: this.config.comparisonOperator || 'missing',
      threshold: this.config.threshold ||  0,
      timeSampler: this.config.timeSampler ||  'all_of_the_times',
      reportingInterval: this.config.reportingInterval || 60,
    });
    
    const sub = this.suppressForm.valueChanges.subscribe(formval => {
      this.validateForm();
      this.configChange.emit(formval);
    });
  }

  updateForm() {
    this.suppressForm.get('query').get('namespace').setValue(this.config.query.namespace, {emitEvent : false });
    this.suppressForm.get('query').get('metric').get('name').setValue(this.config.query.metric.name, {emitEvent : false });
    this.suppressForm.get('query').get('metric').get('groupByTags').setValue(this.config.query.metric.groupByTags, {emitEvent : false });
    this.validateForm();
  }

  validateForm() {
    this.resetFormErrors();
    const formval = this.suppressForm.getRawValue();
    if ( formval.query.metric.name ) {
      if  ( this.tags.length && ( formval.query.metric.groupByTags === null ||  formval.query.metric.groupByTags && !formval.query.metric.groupByTags.length ) ) {
        this.suppressForm.get('query').get('metric').get('groupByTags').setErrors({ 'required': true });
      }
      if ( formval.comparisonOperator !== 'missing' && formval.threshold === null ) {
          this.suppressForm.get('threshold').setErrors({ 'required': true });
      }
      if ( formval.reportingInterval <= 0 ) {
          this.suppressForm.get('reportingInterval').setErrors({ 'invalid': true });
      }
    }
  }

  resetFormErrors() {
    this.suppressForm.get('threshold').setErrors(null);
    this.suppressForm.get('reportingInterval').setErrors(null);
    this.suppressForm.get('query').get('metric').get('groupByTags').setErrors(null);
  }

  updateSuppressConfig(field, v) {
    this.suppressForm.get('query').get('metric').get(field).setValue(v);
    if ( field === 'name' && !v ) {
        this.suppressForm.get('query').get('metric').get('groupByTags').setErrors(null);
        this.suppressForm.get('threshold').setErrors(null);
        this.suppressForm.get('reportingInterval').setErrors(null);
    }
  }
}
