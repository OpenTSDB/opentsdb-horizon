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
import { Observable, Subject } from 'rxjs';

export interface IMessage {
    id?: string;
    action: string;
    payload?: any;
}

@Injectable({
    providedIn: 'root',
})
export class IntercomService {
    private requestStream: Subject<IMessage>;
    private responseStream: Subject<IMessage>;

    constructor() {
        this.requestStream = new Subject();
        this.responseStream = new Subject();
    }

    // child makes request
    requestSend(event: IMessage): void {
        this.requestStream.next(event);
    }

    // parent listens (subscribe) to child requests
    requestListen(): Observable<IMessage> {
        return this.requestStream.asObservable();
    }

    // parent put (send) data to response stream
    responsePut(event: IMessage): void {
        this.responseStream.next(event);
    }

    // child get data response from parents
    responseGet(): Observable<IMessage> {
        return this.responseStream.asObservable();
    }
}
