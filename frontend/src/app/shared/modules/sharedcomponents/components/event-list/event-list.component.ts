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
import { Component, OnInit, HostBinding, Input, SimpleChanges, OnChanges, ViewEncapsulation } from '@angular/core';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'event-list',
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EventListComponent implements OnInit, OnChanges {
    @HostBinding('class.event-list') private _componentClass = true;

    @Input() events: any[];
    @Input() timezone: string;
    @Input() startTime: number;
    @Input() endTime: number;
    @Input() previewLimit: number;
    @Input() loading: boolean;
    @Input() error: string;

    expandedBucketIndex = -1;

    titles = [];
    tags = [];
    slicedList = [];
    additionalProps = [];

    constructor(
        private util: UtilsService
    ) { }

    ngOnInit() {

        if (!this.events) {
            this.events = [];
        }
        if (!this.timezone) {
            this.timezone = 'local';
        }
        if (!this.startTime) {
            this.startTime = 1;
        }
        if (!this.endTime) {
            this.endTime = 1;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['events'] && changes.events.currentValue) {
          this.generateTitlesTagsList();
          this.collapseExpansion();
        }
      }

    getSlicedList() {
        if (Number.isInteger(this.previewLimit) && this.events.length - 1 > this.previewLimit && this.previewLimit > 0 ) {
            return this.events.slice(0, this.previewLimit);
        } else {
            return this.events;
        }
      }

    openExpansion(index) {
        this.expandedBucketIndex = index;
    }

    // accodion closes
    collapseExpansion(index: number = -1) {
        // an expansion panel can call collapse after a different panel has been opened
        if (index === -1 || index === this.expandedBucketIndex) {
            this.expandedBucketIndex = -1;
        }
    }

    getTags(tags) {
        const arr = this.util.transformTagMapToArray(tags);
        const sArr = arr.sort(function(a, b) {
            if (a['key'] > b['key']) {
                return 1;
            } else if (b['key'] > a['key']) {
                return -1;
            } else {
                return 0;
            }
        });
        return sArr;
    }

    generateTitlesTagsList() {
        this.slicedList = this.getSlicedList();
        this.titles = [];
        this.tags = [];
        this.additionalProps = [];
        for (const e of this.events) {
            this.titles.push(this.util.buildDisplayTime(e.timestamp, this.startTime, this.endTime, true, this.timezone));
            this.tags.push(this.getTags(e.tags));
            this.additionalProps.push(this.getTags(e.additionalProps));
        }
    }
}
