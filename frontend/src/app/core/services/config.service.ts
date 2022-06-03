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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
  private appConfig;
  public initialized;
  public errors = [];

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    if ( environment.runtimeConfig ) {
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
          if ( !this.errors.length ) {
            this.appConfig = {...environment, ...data};
          }
        })
        .catch(error => {
          this.initialized = false;
          // throw new Error('CONFIGERROR');
        });
    } else {
        this.appConfig = {...environment };
        this.initialized = true;
    }
  }

  setConfig(key, value) {
    this.appConfig[key] = value;
  }

  getConfig() {
    return this.appConfig;
  }

  getDefaultNamespace() {
    return this.appConfig.namespace && this.appConfig.namespace.default ? this.appConfig.namespace.default : '_default';
  }
}