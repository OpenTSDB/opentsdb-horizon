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
import { OpenTSDBService } from './opentsdb.service';

@Injectable({
    providedIn: 'root',
})
export class QueryService {
    constructor(private openTSDB: OpenTSDBService) {}

    buildQuery(widget, time, query, options: any = {}) {
        const source = widget.settings.data_source;
        const summary =
            widget.settings.component_type === 'LinechartWidgetComponent' ||
            widget.settings.component_type === 'TableWidgetComponent' ||
            widget.settings.component_type === 'HeatmapWidgetComponent'
                ? false
                : true;
        const downsample =
            widget.settings && widget.settings.time
                ? widget.settings.time.downsample
                : { aggregator: 'avg' };
        const sorting =
            widget.settings && widget.settings.sorting
                ? widget.settings.sorting
                : {};
        return this[source].buildQuery(
            time,
            query,
            downsample,
            summary,
            sorting,
            options,
        );
    }
}
