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
import { Component, OnInit, HostBinding, Input, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';
import { Subscription } from 'rxjs';

import { UtilsService } from '../../../../../core/services/utils.service';
import { DateUtilsService } from '../../../../../core/services/dateutils.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'events-widget',
    templateUrl: './events-widget.component.html',
    styleUrls: []
})
export class EventsWidgetComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.events-widget') private _componentClass = true;

    constructor(
        private interCom: IntercomService,
        private util: UtilsService,
        private dateUtil: DateUtilsService,
        private cdRef: ChangeDetectorRef,
    ) { }

    /** Inputs */
    @Input() mode = 'view'; // view/edit
    @Input() widget: any; // includes query
    @Input() readonly = true;

    /** Local Variables */
    events: any[] = [];
    startTime: number;
    endTime: number;
    timezone: string;
    isCustomZoomed = false;
    previewEventsCount = 100;
    eventsCount = 100;
    loading: boolean = false;
    error: string = '';

    // state control
    isDataRefreshRequired = false;
    private listenSub: Subscription;

    ngOnInit() {

        this.widget = { ... this.util.setDefaultEventsConfig(this.widget, true) };
        this.getEvents();

        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            switch (message.action) {
                case 'TimeChanged':
                case 'reQueryData':
                    this.getEvents();
                    break;
                case 'ZoomDateRange':
                    const overrideTime = this.widget.settings.time.overrideTime;
                    if ( message.payload.date.isZoomed && overrideTime ) {
                        const oStartUnix = this.dateUtil.timeToMoment(overrideTime.start, message.payload.date.zone).unix();
                        const oEndUnix = this.dateUtil.timeToMoment(overrideTime.end, message.payload.date.zone).unix();
                        if ( oStartUnix <= message.payload.date.start && oEndUnix >= message.payload.date.end ) {
                            this.isCustomZoomed = message.payload.date.isZoomed;
                            this.widget.settings.time.zoomTime = message.payload.date;
                            this.getEvents();
                        }
                    // tslint:disable-next-line: max-line-length
                    } else if ( (message.payload.date.isZoomed && !overrideTime && !message.payload.overrideOnly) || (this.isCustomZoomed && !message.payload.date.isZoomed) ) {
                        this.isCustomZoomed = message.payload.date.isZoomed;
                        this.getEvents();
                    }
                    // unset the zoom time
                    if ( !message.payload.date.isZoomed ) {
                        delete this.widget.settings.time.zoomTime;
                    }
                    break;
                /*case 'ResizeAllWidgets':
                    if(this.resizeSensor) {
                        this.resizeSensor.detach();
                    }
                    this.resizeSensor = new ResizeSensor(this.widgetOutputElement.nativeElement, () => {
                        this.newSize$.next(1);
                    });
                    break;*/
            }

            if (message && (message.id === this.widget.id)) {
                switch (message.action) {
                    case 'getUpdatedWidgetConfig': // called when switching to presentation view
                        this.widget = message.payload.widget;
                        this.getEvents();
                        break;
                    case 'updatedEvents':
                        if (message.payload.error) {
                            this.events = [];
                            this.error = message.payload.error;
                        } else {
                            this.events = message.payload.events;
                            this.error = '';
                        }
                        this.loading = false;
                        this.timezone = message.payload.time.zone;
                        this.startTime = this.dateUtil.timeToMoment(message.payload.time.start, this.timezone).unix() * 1000;
                        this.endTime = this.dateUtil.timeToMoment(message.payload.time.end, this.timezone).unix() * 1000;
                        this.cdRef.detectChanges();
                        break;
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            // do something?
        }
    }

    getEvents() {
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'getEventData',
            payload: this.util.deepClone({eventQueries: this.widget.eventQueries, limit: this.mode === 'edit' ? this.previewEventsCount : this.eventsCount})
        });
    }

    getTitle() {
        return this.widget.eventQueries[0].search ?
            this.widget.eventQueries[0].namespace + ' - ' + this.widget.eventQueries[0].search :
            this.widget.eventQueries[0].namespace;
    }

    setTitle(title) {
        this.widget.settings.title = title;
    }

    resolveTitle(title) {
        const v = {
            eventCount: this.events.length,
            namespace: this.widget.eventQueries[0].namespace,
            eventQuery: this.widget.eventQueries[0].search
        };
        const regex = /\{\{([\w-.:\/]+)\}\}/ig
        title = title.trim();
        const matches = title.match(regex);
        if ( matches ) {
            for ( let i = 0, len = matches.length; i < len; i++ ) {
                const key = matches[i].replace(/\{|\}/g,'');
                title = title.replace(matches[i], v[key] !== undefined ? v[key] : '');
            }
        }
        return title;
    }

    applyConfig() {
        const cloneWidget = { ...this.widget };
        cloneWidget.id = cloneWidget.id.replace('__EDIT__', '');
        this.interCom.requestSend({
            action: 'updateWidgetConfig',
            id: cloneWidget.id,
            payload: { widget: cloneWidget, isDataRefreshRequired: this.isDataRefreshRequired }
        });
        this.closeViewEditMode();
    }

    closeViewEditMode() {
        this.interCom.requestSend({
            action: 'closeViewEditMode',
            id: this.widget.id,
            payload: 'dashboard'
        });
    }

    ngOnDestroy() {
        this.listenSub.unsubscribe();
    }

    updateConfig(message) {
        switch (message.action) {
            case 'SetEventQuerySearch':
                this.setEventQuerySearch(message.payload.search);
                break;
            case 'SetEventQueryNamespace':
                this.setEventQueryNamespace(message.payload.namespace);
                break;
        }
    }

    setEventQuerySearch(search: string) {
      // todo: set correctly
      const deepClone = JSON.parse(JSON.stringify(this.widget));
      deepClone.eventQueries[0].search = search;
      this.widget.eventQueries = [... deepClone.eventQueries];
      this.getEvents();
      this.loading = true;
    }

    setEventQueryNamespace(namespace: string) {
      // todo: set correctly
      const deepClone = JSON.parse(JSON.stringify(this.widget));
      deepClone.eventQueries[0].namespace = namespace;
      this.widget.eventQueries = [... deepClone.eventQueries];
      this.getEvents();
      this.loading = true;
    }
}
