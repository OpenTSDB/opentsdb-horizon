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
import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface TooltipData { data: any; position: any; };

@Injectable()
export class TooltipDataService implements OnInit {

    /* STREAMS */
    private _tooltipStream: Subject<TooltipData | Boolean> = new Subject(); // tooltip data

    constructor() {}

    ngOnInit() {}

    /* Testing New Stuff */

    _ttStreamListen(): Observable<TooltipData | Boolean> {
        return this._tooltipStream.asObservable();
    }

    _ttDataPut(data: TooltipData | Boolean) {
        this._tooltipStream.next(data);
    }

}
