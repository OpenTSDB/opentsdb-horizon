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

import {
    Component,
    OnInit, OnChanges, Input, Output, EventEmitter, OnDestroy,
    SimpleChanges,
    HostBinding,
    ViewChild, ElementRef, HostListener, ViewEncapsulation
} from '@angular/core';

import { MatChipInputEvent } from '@angular/material/chips';
import { MatInput } from '@angular/material/input';
import { MatMenuTrigger } from '@angular/material/menu';
import {COMMA, ENTER} from '@angular/cdk/keycodes';


import { FormBuilder, FormGroup, FormControl, FormGroupDirective } from '@angular/forms';

import { Subscription, Observable } from 'rxjs';
import { UtilsService } from '../../../core/services/utils.service';
import { MetaService } from '../../../core/services/meta.service';



import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { IntercomService } from '../../../core/services/intercom.service';

import { DatepickerComponent } from '../../../shared/modules/date-time-picker/components/date-picker-2/datepicker.component';

import * as moment from 'moment';
import { InfoIslandService } from '../../../shared/modules/info-island/services/info-island.service';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'snooze-details',
    templateUrl: './snooze-details.component.html',
    styleUrls: ['./snooze-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: DateAdapter, useClass:  MomentDateAdapter},
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ]
})
export class SnoozeDetailsComponent implements OnInit, OnChanges, OnDestroy {

    @HostBinding('class.snooze-alert-dialog-component') private _hostclass = true;

    @ViewChild('formDirective', { read: FormGroupDirective, static: false }) formDirective: FormGroupDirective;
    @ViewChild('alertListMenu', { read: MatMenuTrigger, static: true }) private alertListMenuTrigger: MatMenuTrigger;
    @ViewChild('alertInput', { read: MatInput, static: true }) private alertInput: MatInput;

    @ViewChild('datetimePickerStart', { static: false }) startTimeReference: DatepickerComponent;
    @ViewChild('datetimePickerEnd', { static: false }) endTimeReference: DatepickerComponent;


    @Input() viewMode: string = ''; // edit || view

    @Input() hasWriteAccess: boolean = false;
    @Input() alertListMeta = [];

    get readOnly(): boolean {
        if (!this.hasWriteAccess) { return true; }
        return (this.viewMode === 'edit') ? false : true;
    }

    @Output() configChange = new EventEmitter();

    // placeholder for expected data from dialogue initiation
    @Input() data: any = {
        namespace: ''
    };

    /** Form  */
    snoozeForm: FormGroup;
    dateType = 'preset';
    timePreset = '1hr';

    presetOptions: any[] = [ {label: '1hr', value: 1, unit: 'hours'},
                             {label: '6hr', value: 6, unit: 'hours'},
                             {label: '12hr', value: 12, unit: 'hours'},
                             {label: '1d', value: 1, unit: 'days'},
                             {label: '2d', value: 2, unit: 'days'},
                             {label: '1w', value: 1, unit: 'weeks'}
                            ];

    presetChangeSub: Subscription;
    timeOptions: any[] = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    pickerOptions: any;
    queries: any[] = [];
    alertLabels: any[] = [];

    constructor(
        private elRef: ElementRef,
        private fb: FormBuilder,
        private utils: UtilsService,
        private interCom: IntercomService,
        private metaService: MetaService,
        private infoIslandService: InfoIslandService
    ) { }

    ngOnInit() {
        this.pickerOptions = {  startFutureTimesDisabled: false,
                                endFutureTimesDisabled: true,
                                defaultStartText: '',
                                defaultEndText: '',
                                defaultStartHoursFromNow: 1,
                                defaultEndHoursFromNow: 0,
                                startMaxDateError: 'Future not allowed',
                                endMaxDateError: 'Future not allowed',
                                startMinDateError: 'Must be > 1B seconds after unix epoch',
                                endMinDateError: 'Must be > 1B seconds after unix epoch',
                                startDateFormatError:  'Invalid.',
                                endDateFormatError:  'Invalid.',
                                startTimePlaceholder: '',
                                endTimePlaceholder: '',
                                startTimeInputBoxName: 'Start Time',
                                endTimeInputBoxName: 'End Time',
                                minMinuteDuration: 2
                            };
        for ( let i = 0; i < 24; i++ ) {
            for ( let j = 0; j < 60; j = j + 15 ) {
                this.timeOptions.push( {
                                            label: i.toString().padStart(2, '0') + ':' + j.toString().padStart(2, '0'),
                                            value: (i * 60 * 60 + j * 60) * 1000 } );
            }
        }
        this.setupForm(this.data);
    }

    ngOnChanges( changes: SimpleChanges ) {
        if (changes.alertListMeta && changes.alertListMeta.currentValue) {
            const alertListMeta = changes.alertListMeta.currentValue;
            for ( let i = 0; this.data.alertIds && i < this.data.alertIds.length; i++ ) {
                const option = alertListMeta.find(d => d.id === this.data.alertIds[i]);
                if ( option ) {
                    this.alertLabels.push(option);
                }
            }
        }
    }

    setupForm(data) {
        const def = {
            alertIds: [],
            labels: [],
            filters: {},
        };
        data = Object.assign({}, def, data);

        this.snoozeForm = this.fb.group({
            // tslint:disable-next-line:max-line-length
            startTime: data.startTime ? moment(data.startTime).format('MM/DD/YYYY h:mm a') : moment().format('MM/DD/YYYY h:mm a'),
            // tslint:disable-next-line:max-line-length
            endTime: data.endTime ? moment(data.endTime).format('MM/DD/YYYY h:mm a') : moment().add(1, 'hours').format('MM/DD/YYYY h:mm a'),
            reason: data.reason || ''
        });
        // add alerts to selection list
        // add labels to selection list
        for ( let i = 0; i < data.labels.length; i++ ) {
            this.alertLabels.push({ label: data.labels[i], type: 'label'});
        }

        this.dateType = data.id !== '_new_' ? 'custom' : 'preset';
        // tslint:disable-next-line:max-line-length
        const filters = data.filter && Object.keys(data.filter).length ? this.utils.getFiltersTsdbToLocal(data.filter) : [];
        this.setQuery({ namespace: this.data.namespace, filters: filters} );
    }

    setDate(field, value) {
        this.snoozeForm.get('endTime').setErrors(null);
    }

    setQuery(query) {
        this.queries =  [ this.getQueryConfig(query) ];
    }

    getQueryConfig(query) {
        const def: any = {
            id: this.utils.generateId(6, this.utils.getIDs(this.queries)),
            namespace: '',
            metrics: [],
            filters: [],
            settings: {
                visual: {
                    visible: true
                }
            }
        };
        query = Object.assign({}, def, query);
        return query;
    }

    showAlertPanel() {
            this.alertListMenuTrigger.toggleMenu();
    }

    addAlertOrLabel(item) {
        if ( !this.alertLabels.includes(item) ) {
            this.alertLabels.push(item);
        }
    }

    removeAlertOrLabel(index) {
        this.alertLabels.splice(index, 1);
    }

    alertRecipientsUpdate(event: any) {
        this.snoozeForm.get('notification').get('recipients').setValue(event);
    }

    /*
    get form() {
        return this.snoozeForm.controls;
    }

    get custom() {
        return this.form.custom['controls'];
    }
    */

    getMetaFilter() {
        const query: any = { search: '', namespace: this.queries[0].namespace, tags: this.queries[0].filters, metrics: [] };
        const metaQuery = this.metaService.getQuery('aurastatus:alert', 'TAG_KEYS', query);
        const filter = metaQuery.queries[0].filter;
        filter.filters = filter.filters.filter(d => d.key !== 'statusType' );
        return filter;
    }

    validate() {
        this.snoozeForm.markAsTouched();
        this.snoozeForm.get('startTime').setErrors(null);
        this.snoozeForm.get('endTime').setErrors(null);
        this.snoozeForm.setErrors(null);

        if ( this.alertLabels.length === 0 && this.queries[0].filters.length === 0 ) {
            this.snoozeForm.setErrors({ 'required': true });
        }

        if ( this.dateType === 'custom' ) {
            if ( !this.startTimeReference.isDateValid || !this.endTimeReference.isDateValid ) {
                this.snoozeForm.setErrors({ 'invalid': true });
            }
            const startts = this.startTimeReference.date;
            const endts = this.endTimeReference.date;
            if ( moment(endts).valueOf() <= moment().valueOf() ) {
                this.snoozeForm.get('endTime').setErrors({ 'future': true });
            } else if ( moment(endts).valueOf() <= moment(startts).valueOf()) {
                this.snoozeForm.get('endTime').setErrors({ 'greater': true });
            }
        }

        if ( this.snoozeForm.valid ) {
            // clear system message bar
            this.interCom.requestSend({
                action: 'clearSystemMessage',
                payload: {}
            });
           this.saveSnooze();

        } else {
            // set system message bar
            this.interCom.requestSend({
                action: 'systemMessage',
                payload: {
                    type: 'error',
                    message: 'Your form has errors. Please review your form, and try again.'
                }
            });
        }

    }

    saveSnooze() {
        const data: any = this.utils.deepClone(this.snoozeForm.getRawValue());
        data.id = this.data.id !== '_new_' ? this.data.id : '';
        data.alertIds = this.alertLabels.filter(d => d.type === 'alert').map(d => d.id);
        data.labels = this.alertLabels.filter(d => d.type === 'label').map(d => d.label);
        if ( this.dateType === 'preset' ) {
            const tconfig = this.presetOptions.find( d => d.label === this.timePreset );
            const m = moment();
            data.startTime = m.valueOf();
            data.endTime = m.add(tconfig.value, tconfig.unit).valueOf();
        } else {
            data.startTime = moment(this.startTimeReference.date).valueOf();
            data.endTime = moment(this.endTimeReference.date).valueOf();
        }
        data.filter = this.queries[0].filters.length ? this.getMetaFilter() : {};
        // emit to save the snooze
        this.configChange.emit({ action: 'SaveSnooze', namespace: this.data.namespace, payload: { data: this.utils.deepClone([data]) }} );
    }

    cancelEdit() {
        // snooze created from alerts page
        if (this.data && this.data.cancelToAlerts) {
            this.configChange.emit({
                action: 'CancelToAlerts'
            });
        } else {
            this.configChange.emit({
                action: 'CancelSnoozeEdit'
            });
        }
    }

    ngOnDestroy() {
        this.infoIslandService.closeIsland();
        this.interCom.requestSend({
            action: 'clearSystemMessage',
            payload: {}
        });
    }

    @HostListener('document:click', ['$event'])
    clickOutsideComponent(event) {
        if ( this.alertListMenuTrigger.menuOpened && !event.target.classList.contains('mat-chip-input')) {
            this.alertListMenuTrigger.closeMenu();
        }
    }

}
