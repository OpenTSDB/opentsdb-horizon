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
import { Component, OnInit, HostBinding, Input, OnChanges, SimpleChanges, OnDestroy, Inject, ViewChild, ViewChildren, QueryList, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { UtilsService } from '../../../../../core/services/utils.service';

import { Subscription } from 'rxjs';
import { IntercomService } from '../../../../../core/services/intercom.service';
import { ISLAND_DATA } from '../../info-island.tokens';
import { distinctUntilChanged } from 'rxjs/operators';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'event-stream',
    templateUrl: './event-stream.component.html',
    styleUrls: ['./event-stream.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EventStreamComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @HostBinding('class.event-stream') private _componentClass = true;

    @ViewChild('eventAccordion', { read: MatAccordion, static: true }) private eventAccordion: MatAccordion;
    @ViewChildren('eventPanel', {read: MatExpansionPanel}) eventPanels: QueryList<MatExpansionPanel>;

    buckets: any[] = [];
    startTime: number;  // in milliseconds
    endTime: number;    // in milliseconds
    timezone: string;
    expandedBucketIndex: number;
    maxEventsShown = 30;
    title = '';

    tags = [];
    props = [];

    private subscription: Subscription = new Subscription();

    displayReady = false;

    constructor(
        private util: UtilsService,
        private interCom: IntercomService,
        @Inject(ISLAND_DATA) private _data: any
    ) {

        this.title = _data.data.title;

        this.subscription.add(_data.data.timeRange$.subscribe( time => {
            // this.logger.log('TIME RANGE RECEIVED', {time});
            this.startTime = time.startTime;
            this.endTime = time.endTime;
        }));

        this.subscription.add(_data.data.timezone$.subscribe( timezone => {
            // this.logger.log('TIME ZONE RECEIVED', {timezone});
            this.timezone = timezone;
        }));

        this.subscription.add(this._data.data.expandedBucketIndex$.pipe(distinctUntilChanged()).subscribe( index => {
            this.expandedBucketIndex = index;

            if (this.displayReady) {

                this.eventAccordion.closeAll();

                const newSelected = this.eventPanels.find( (panel: MatExpansionPanel, idx: number) => idx === index);

                if (newSelected) {
                    setTimeout( () => {
                        newSelected.open();
                    }, 200);
                }
            }
        }));

        this.subscription.add(_data.data.buckets$.pipe(distinctUntilChanged()).subscribe( buckets => {
            this.buckets = buckets.map(bucket => {
                if (bucket.events.length > 1) {
                    bucket.displayTime = this.util.buildDisplayTime(bucket.endTime, this.startTime, this.endTime, true, this.timezone);
                } else {
                    // tslint:disable-next-line: max-line-length
                    bucket.displayTime = this.util.buildDisplayTime(bucket.events[0].timestamp, this.startTime, this.endTime, true, this.timezone);
                }

                for (let i = 0; i < bucket.events.length; i++) {
                    const event: any = this.util.deepClone(bucket.events[i]);
                    event.displayTime = this.util.buildDisplayTime(event.timestamp, this.startTime, this.endTime, true, this.timezone);
                    event.showDetails = false;
                    bucket.events[i] = event;
                }

                return bucket;
            });
            this.generateTagsAndProps();
        }));
    }

    ngOnInit() { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // tslint:disable-next-line:max-line-length
        /*if (changes && changes.buckets
            && changes.buckets.currentValue && changes.buckets.previousValue
            && changes.buckets.previousValue.length !== changes.buckets.currentValue.length) {
            this.collapseExpansion();
        }
        if (changes && changes.expandedBucketIndex && changes.expandedBucketIndex.currentValue !== this.expandedBucketIndex) {
            this.openExpansion(this.expandedBucketIndex);
        }*/
    }

    ngAfterViewInit() {

        this.eventAccordion.closeAll();
        this.eventAccordion.multi = true;

        const newSelected = this.eventPanels.find( (panel: MatExpansionPanel, idx: number) => idx === this.expandedBucketIndex);

        setTimeout( function() {
            if (newSelected) {
                newSelected.open();
            }
            this.displayReady = true;
        }.bind(this), 200);
    }

    /*hide() {
        this.collapseExpansion();
        this.show = false;
        this.updatedShowing.emit(this.show);
    }*/

    generateTagsAndProps() {
        this.tags = [];
        this.props = [];
        let i = 0;

        for (const b of this.buckets) {
            this.tags[i] = [];
            this.props[i] = [];
            for (const e of b.events) {
                this.tags[i].push(this.util.transformTagMapToArray(e.tags));
                this.props[i].push(this.util.transformTagMapToArray(e.additionalProps));
            }
            i++;
        }
    }

    // Accordion opens
    openExpansion(index) {
        // this.expandedBucketIndex = index;
        // this.updatedExpandedBucketIndex.emit(this.expandedBucketIndex);
        this.interCom.responsePut({
            action: 'UpdateExpandedBucketIndex',
            id: this._data.originId,
            payload: {
                index
            }
        });
    }

    // accodion closes
    collapseExpansion(index: number = -1) {
        // an expansion panel can call collapse after a different panel has been opened
        if (index === -1 || index === this.expandedBucketIndex) {
            // this.expandedBucketIndex = -1;
            // this.updatedExpandedBucketIndex.emit(this.expandedBucketIndex);

            this.interCom.responsePut({
                action: 'UpdateExpandedBucketIndex',
                id: this._data.originId,
                payload: {
                    index: -1
                }
            });
        }
    }

}
