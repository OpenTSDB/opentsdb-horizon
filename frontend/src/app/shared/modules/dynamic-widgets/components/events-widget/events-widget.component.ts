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
        private cdRef: ChangeDetectorRef
    ) { }

    /** Inputs */
    @Input() editMode: boolean;
    @Input() widget: any; // includes query

    /** Local Variables */
    events: any[] = [];
    startTime: number;
    endTime: number;
    timezone: string;
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
                case 'ZoomDateRange':
                    this.getEvents();
                    break;
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
            // console.log(changes);
        }
    }

    getEvents() {
        this.interCom.requestSend({
            id: this.widget.id,
            action: 'getEventData',
            payload: {eventQueries: this.widget.eventQueries, limit: this.editMode ? this.previewEventsCount : this.eventsCount}
        });
    }

    getTitle() {
        return this.widget.eventQueries[0].search ?
            this.widget.eventQueries[0].namespace + ' - ' + this.widget.eventQueries[0].search :
            this.widget.eventQueries[0].namespace;
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
