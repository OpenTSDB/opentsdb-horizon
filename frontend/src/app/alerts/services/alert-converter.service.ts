import { Injectable } from '@angular/core';
import { UtilsService } from '../../core/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AlertConverterService {

  currentVersion = 1;

  constructor(private utils: UtilsService) { }

  convert(alert: any) {
    const version = !alert.version ? 0 : alert.version;
    for (let i = version + 1; i <= this.currentVersion; i++) {
      if (this['toAlertVersion' + i] instanceof Function) {
        alert = this['toAlertVersion' + i](alert);
      }
    }
    return alert;
  }
  // to return current max version of dashboard
  getAlertCurrentVersion() {
    return this.currentVersion;
  }

  toAlertVersion1(alert: any) {
    const queries = {};
    const version = 1;
    for (let i = 0; i < alert.queries.raw.length; i++) {
        queries[i] = alert.queries.raw[i];
    }
    alert.version = version;
    const metricId = alert.threshold.singleMetric.metricId;
    const mindex = metricId.split('-')[0].replace( /\D+/g, '');
    alert.threshold.singleMetric.metricId = this.utils.getDSId(queries, alert.threshold.singleMetric.queryIndex, mindex) + '_groupby';
    return alert;
  }
}
