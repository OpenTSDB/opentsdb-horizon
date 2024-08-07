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

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor() {}

    getLocal(key: string) {
        return localStorage.getItem(key);
    }

    setLocal(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    clearAll() {
        localStorage.clear();
    }

    getKeys(): string[] {
        return Object.keys(localStorage);
    }

    hasKey(key: string): boolean {
        const keys = this.getKeys();
        return keys.includes(key);
    }
}
