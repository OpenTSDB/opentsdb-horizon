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
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nl2br' })
export class Nl2BrPipe implements PipeTransform {
    transform(value: string, args?: string[]): any {
        if (!value) {
            return value;
        }
        const breakTag = '<br>';
        return (value + '').replace(
            /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
            '$1' + breakTag + '$2',
        );
    }
}
