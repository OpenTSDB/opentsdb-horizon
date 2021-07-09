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
import { Component,OnInit, OnChanges, SimpleChanges, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '../../../../../core/services/utils.service';

import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'alert-details-suppress-config',
  templateUrl: './alert-details-suppress-config.component.html'
})
export class AlertDetailsSuppressConfigComponent implements OnInit, OnChanges {

  @HostBinding('class.alert-details-suppress-config-component') private _hostClass = true;

  @Input() queries = [];
  @Input() tags = [];
  @Input() data: any = {};
  @Input() config: any = null;
  @Output() configChange = new EventEmitter();
  metricEdit= false;
  suppressForm: FormGroup;
  constructor( private fb: FormBuilder, private utils: UtilsService ) { }

  ngOnInit() {
    this.setupForm();
  }

  ngOnChanges( changes: SimpleChanges ) {
    if (changes.config && changes.config.previousValue && changes.config.currentValue || changes.queries && changes.queries.previousValue && changes.queries.currentValue) {
      this.validateForm();
    }
  }

  setupForm(update= false) {
    this.suppressForm = this.fb.group({
      metricId: this.config.metricId,
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


  validateForm() {
    this.resetFormErrors();
    const formval = this.suppressForm.getRawValue();
    if ( formval.metricId ) {
      const [qindex, mindex] = this.utils.getMetricIndexFromId(formval.metricId, this.queries);
      const suppressTags =  this.queries[qindex].metrics[mindex].groupByTags || [];
      if  ( this.tags.length &&  !suppressTags.length ) {
        this.suppressForm.get('metricId').setErrors({ 'tagRequired': true });
      }
      if (this.tags.length && suppressTags.length && !this.utils.isArraySubset(this.tags, suppressTags)) {
        this.suppressForm.get('metricId').setErrors({ 'tagSubset': true });
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
    this.suppressForm.get('metricId').setErrors(null);
    this.suppressForm.get('threshold').setErrors(null);
    this.suppressForm.get('reportingInterval').setErrors(null);
  }

  updateSuppressConfig(field, v) {
    if ( field === 'name' && !v ) {
        this.suppressForm.get('threshold').setErrors(null);
        this.suppressForm.get('reportingInterval').setErrors(null);
    }
  }
}
