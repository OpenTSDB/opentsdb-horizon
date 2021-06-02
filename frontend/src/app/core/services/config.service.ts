import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
  private appConfig;
  public initialized;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/config')
      .toPromise()
      .then(data => {
        this.appConfig = data;
        this.initialized = true;
      })
      .catch(error => {
        this.initialized = false;
        // throw new Error('CONFIGERROR');
      });
  }

  setConfig(key, value) {
    this.appConfig[key] = value;
  }

  getConfig() {
    return this.appConfig;
  }
}