import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
  private appConfig;
  public initialized;
  public errors = [];

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/config')
      .toPromise()
      .then( (data: any) => {
        this.initialized = true;
        if ( !data.tsdb_host && ( !data.tsdb_hosts || !data.tsdb_hosts.length ) ) {
          this.errors.push("TSDB endpoint is invalid");
        }
        if ( !data.configdb ) {
          this.errors.push("Configdb endpoint is invalid");
        }
        if ( !data.metaApi ) {
          this.errors.push("Meta endpoint is invalid");
        }
        if ( !data.auraUI ) {
          this.errors.push("Aura UI endpoint is invalid");
        }
        if ( !this.errors.length ) {
          this.appConfig = data;
        }
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