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
 import { Observable, Subject,BehaviorSubject, throwError } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class RightDrawerService {

  /* STREAMS */
  // private _drawerState: Subject<string> = new Subject(); // tooltip data
  // doRefreshData$: BehaviorSubject<string>;
  drawerState$: BehaviorSubject<string>;
  drawerParams$: BehaviorSubject<object>;

  constructor(

  ) {
    this.drawerState$ = new BehaviorSubject('closed');
    this.drawerParams$ = new BehaviorSubject({});
      // this.$drawerState = this._drawerState.asObservable();
      // this.setDrawerState('closed');
  }

  /*
  drawerStateListen(): Observable<string> {
      // return this._drawerState.asObservable();
  }
  */

  setDrawerState(val: string) {
      console.log("123456 servrice setDrawerState  =", val);
      this.drawerState$.next(val);
  }

  setDrawerParams(val: object) {
    console.log("123456 servrice  setDrawerContentType=", val);
    this.drawerParams$.next(val);
  }
  
}
