import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { UtilsService } from '../../../../../core/services/utils.service';
import { FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

// tslint:disable:max-line-length
@Component({
  selector: 'alert-details-metric-period-over-period',
  templateUrl: './alert-details-metric-period-over-period.component.html',
  styleUrls: []
})
export class AlertDetailsMetricPeriodOverPeriodComponent implements OnInit {
  @HostBinding('class.period-over-period') private _hostClass = true;

  constructor(
    public utils: UtilsService
  ) { }

  @Input() queries: any[];
  @Input() viewMode: boolean;
  @Input() config: any;
  @Input() suppressConfig: any;
  @Input() tags = [];
  @Output() configChange = new EventEmitter();

  showThresholdAdvanced = false; // toggle in threshold form
  slidingWindowPresets = [60, 300, 600, 900, 3600, 3600 * 6, 3600 * 24];
  periodPresets = [3600, 3600 * 24, 3600 * 24 * 7];
  maxSlidingWindow = 3600 * 24; // 1 day

  // form control
  lookbacks = new FormControl('');
  badUpperThreshold = new FormControl('');
  warnUpperThreshold = new FormControl('');
  badLowerThreshold = new FormControl('');
  warnLowerThreshold = new FormControl('');
  highestOutliersToRemove = new FormControl('');
  lowestOutliersToRemove = new FormControl('');

  get anyErrors(): boolean {
    if (this.lookbacks.errors) {
      return true;
    } else if (this.badUpperThreshold.errors) {
      return true;
    } else if (this.warnUpperThreshold.errors) {
      return true;
    } else if (this.badLowerThreshold.errors) {
      return true;
    } else if (this.warnLowerThreshold.errors) {
      return true;
    } else if (this.highestOutliersToRemove.errors) {
      return true;
    } else if (this.lowestOutliersToRemove.errors) {
      return true;
    } else if (!this.atleastOneThresholdSet()) {
      return true;
    }
    return false;
}

  ngOnInit() {

    if (!this.config || !this.config.periodOverPeriod) {
      this.setDefaultConfig();
      this.configChange.emit({requeryData: true, thresholdChanged: false, config: {...this.config}});
    }

    this.updateValidators();
  }

  setDefaultConfig() {
    if (!this.config) {
      this.config = {};
    }
    if (!this.config.periodOverPeriod) {
      this.config.periodOverPeriod = {};
    }

    this.config.subType = this.config.subType || 'periodOverPeriod';
    this.config.delayEvaluation = this.config.delayEvaluation || '0';
    this.config.periodOverPeriod.queryType = this.config.periodOverPeriod.queryType || 'tsdb';
    this.config.periodOverPeriod.slidingWindow = this.config.periodOverPeriod.slidingWindow || '300';
    this.config.periodOverPeriod.period = this.config.periodOverPeriod.period || '3600';
    this.config.periodOverPeriod.lookbacks = this.config.periodOverPeriod.lookbacks || '6';
    this.config.periodOverPeriod.badUpperThreshold = this.config.periodOverPeriod.badUpperThreshold || '';
    this.config.periodOverPeriod.warnUpperThreshold = this.config.periodOverPeriod.warnUpperThreshold || '';
    this.config.periodOverPeriod.badLowerThreshold = this.config.periodOverPeriod.badLowerThreshold || '';
    this.config.periodOverPeriod.warnLowerThreshold = this.config.periodOverPeriod.warnLowerThreshold || '';
    this.config.periodOverPeriod.upperThresholdType = this.config.periodOverPeriod.upperThresholdType || 'value';
    this.config.periodOverPeriod.lowerThresholdType = this.config.periodOverPeriod.lowerThresholdType || 'value';
    this.config.periodOverPeriod.highestOutliersToRemove = this.config.periodOverPeriod.highestOutliersToRemove || '1';
    this.config.periodOverPeriod.lowestOutliersToRemove = this.config.periodOverPeriod.lowestOutliersToRemove || '1';
    this.config.periodOverPeriod.algorithm = this.config.periodOverPeriod.algorithm || 'simple-average';
    console.log("this.config", this.config)
  }

  getDelayEvalutionPlaceholder(): string {
    let placeholder = 'Enter value';

    if (this.viewMode && !this.config.periodOverPeriod.delayEvaluation) {
      placeholder = '0';
    }

    return placeholder;
  }
  updateConfig(prop, val) {
    let thresholdChanged = false;
    let requeryData = false;

    if (prop === 'badUpperThreshold' || prop === 'warnUpperThreshold' || prop === 'badLowerThreshold' || prop === 'warnLowerThreshold') {
      thresholdChanged = true;
    }

    if (prop === 'lookbacks' || prop === 'highestOutliersToRemove' || prop === 'lowestOutliersToRemove' || prop === 'slidingWindow' || prop === 'period') {
      requeryData = true;
    }

    if (prop === 'delayEvaluation') {
      this.config[prop] = val;
    } else {
      this.config.periodOverPeriod[prop] = val;
    }

    this.updateValidators();

    if (!this.anyErrors) {
      this.configChange.emit({ thresholdChanged, requeryData, config: {...this.config}});
    }
  }

  updateSuppressConfig(config) {
    this.configChange.emit( { suppressConfig: config, config: {...this.config} });
  }

  updateValidators() {
    this.lookbacks = new FormControl(this.config.periodOverPeriod['lookbacks'], [Validators.max(10), Validators.min(1), this.positiveNumberValidator()]);
    this.badUpperThreshold = new FormControl(this.config.periodOverPeriod['badUpperThreshold'],   [this.positiveNumberValidator(), this.thresholdValidator('warnUpperThreshold')]);
    this.warnUpperThreshold = new FormControl(this.config.periodOverPeriod['warnUpperThreshold'], [this.positiveNumberValidator(), this.thresholdValidator('badUpperThreshold')]);
    this.badLowerThreshold = new FormControl(this.config.periodOverPeriod['badLowerThreshold'],   [this.positiveNumberValidator(), this.thresholdValidator('warnLowerThreshold')]);
    this.warnLowerThreshold = new FormControl(this.config.periodOverPeriod['warnLowerThreshold'], [this.positiveNumberValidator(), this.thresholdValidator('badLowerThreshold')]);
    this.highestOutliersToRemove = new FormControl(this.config.periodOverPeriod['highestOutliersToRemove'], [this.integerValidator(), this.outliersValidator()]);
    this.lowestOutliersToRemove = new FormControl(this.config.periodOverPeriod['lowestOutliersToRemove'], [this.integerValidator(), this.outliersValidator()]);
  }

  thresholdValidator(thresholdToCompare: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        let forbidden;
        if (control.value === '') {
          forbidden = false;
        } else if (thresholdToCompare.includes('bad')) { // compare warn value to bad threshold
          forbidden = this.isValueLargerThanThreshold(thresholdToCompare, control.value, Number.MAX_SAFE_INTEGER);
        } else { // compare bad value to warn threshold
          forbidden = !this.isValueLargerThanThreshold(thresholdToCompare, control.value, -1);
        }
        return forbidden ? { 'forbiddenValue': { value: control.value } } : null;
    };
  }

  integerValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let forbidden = true;
      if (Number.isInteger(Number(control.value))) {
        forbidden = false;
      }
      return forbidden ? { 'forbiddenValue': { value: control.value } } : null;
    };
  }

  positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        let forbidden = false;
        if (control.value !== '') {
          const re = /^\d*\.?\d+$/; // number, interger or decimal
          forbidden = !re.test(control.value);

          // number greater than 0
          if (Number.parseFloat(control.value) <= 0) {
            forbidden = true;
          }
        }
        return forbidden ? { 'forbiddenValue': { value: control.value } } : null;
    };
  }

  outliersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        let forbidden = false;
        const totalOutliersToRemove = Number(this.config.periodOverPeriod['lowestOutliersToRemove']) + Number(this.config.periodOverPeriod['highestOutliersToRemove']);
        if (totalOutliersToRemove >= Number(this.config.periodOverPeriod['lookbacks'])) {
          forbidden = true;
        }
        return forbidden ? { 'forbiddenValue': { value: control.value } } : null;
    };
  }

  isValueLargerThanThreshold(threshold: string, value: string, defaultValue: number): boolean {
    const thresholdValue: number = this.config.periodOverPeriod[threshold] === '' ? defaultValue :  Number(this.config.periodOverPeriod[threshold]);
    return Number(value) >= thresholdValue;
  }

  atleastOneThresholdSet() {
    return this.config.periodOverPeriod['badUpperThreshold'] ||
           this.config.periodOverPeriod['warnUpperThreshold'] ||
           this.config.periodOverPeriod['warnLowerThreshold'] ||
           this.config.periodOverPeriod['badLowerThreshold'];
  }
}
