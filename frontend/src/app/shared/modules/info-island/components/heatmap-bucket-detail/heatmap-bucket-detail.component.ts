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
    Component, OnInit, AfterViewInit, ChangeDetectorRef, HostBinding, Inject, OnDestroy, ViewChild, ElementRef, ViewEncapsulation
} from '@angular/core';
import { ISLAND_DATA } from '../../info-island.tokens';
import { IntercomService } from '../../../../../core/services/intercom.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { ElementQueries, ResizeSensor } from 'css-element-queries';

import { InfoIslandComponent } from '../../containers/info-island.component';
import { UtilsService } from '../../../../../core/services/utils.service';
import { UnitConverterService } from '../../../../../core/services/unit-converter.service';

import * as d3 from 'd3';
import * as moment from 'moment';

@Component({
    selector: 'heatmap-bucket-detail',
    templateUrl: './heatmap-bucket-detail.component.html',
    styleUrls: ['./heatmap-bucket-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HeatmapBucketDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @HostBinding('class.heatmap-bucket-detail-component') private _hostClass = true;

    @ViewChild('chartContainer', { static: true }) private chartContainer: ElementRef;
    @ViewChild(MatSort) sort: MatSort;

    islandRef: InfoIslandComponent;

    /** Subscription handler */
    private subscription: Subscription = new Subscription();

    dialogOptions: any = {
        trackMouse: false,
        open: false
    };
    meta: any = {};
    options: any = {};
    barData: any = {
        direction: 'vertical',
        data: [],
        axes: {
            x: { 'type': 'linear', display: true, position: 'bottom', key: 'start' },
            y: { 'type': 'linear', display: true, position: 'left', format: { unit: 'auto', precision: 'auto' } }
        },
        format: {}
    };
    size: any = {};
    newSize$: BehaviorSubject<any>;

    dataLimitTypes: string[] = ['Top', 'Bottom', 'All'];

    dataLimitType = 'All'; // all || top |\ bottom
    showAmount: FormControl = new FormControl(50);


    /** Table Stuff */
    tableColumns = [];
    tableDataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>([]);

    highlightTag: any = { key: '', value: '' };


    constructor(
        private interCom: IntercomService,
        private cdr: ChangeDetectorRef,
        private utilsService: UtilsService,
        private unitConvertor: UnitConverterService,
        @Inject(ISLAND_DATA) private _islandData: any
    ) {

        this.dialogOptions.open = true;
        this.setData(_islandData.data);
    }


    ngOnInit() {
        this.subscription.add(this.interCom.requestListen().subscribe(message => {
            switch (message.action) {
                case 'tsTickDataChange':
                    this.setData(message.payload);
                    break;
                default:
                    break;
            }
        }));
    }

    ngAfterViewInit() {
        ElementQueries.listen();
        ElementQueries.init();
        const initSize = {
            width: this.chartContainer.nativeElement.clientWidth,
            height: this.chartContainer.nativeElement.clientHeight
        };
        this.newSize$ = new BehaviorSubject(initSize);

        this.subscription.add(this.newSize$.subscribe(size => {
            this.setSize(size);
        }));
        const resizeSensor = new ResizeSensor(this.chartContainer.nativeElement, () => {
            const newSize = {
                width: this.chartContainer.nativeElement.clientWidth,
                height: this.chartContainer.nativeElement.clientHeight
            };
            this.newSize$.next(newSize);
        });
    }

    setSize(newSize) {
        this.size = { width: newSize.width, height: newSize.height };
        this.cdr.detectChanges();
    }

    setData(payload) {
        this.options = payload.tickData.options;
        this.meta.xTime = payload.tickData.x;
        this.meta.bucket = payload.tickData.bucket;
        const format = this.options.axes.y.tickFormat;
        const precision = format.precision ? format.precision : 2;
        const yScale = d3.scaleQuantize()
            .domain(this.options.axes.y.valueRange)
            .range(Array.from(Array(this.options.heatmap.buckets), (x, index) => (index + 1)));

        const label = this.options.heatmap.metric;
        this.meta.metric = label.length > 50 ? label.substr(0, 48) + '..' : label;
        // tslint:disable-next-line: max-line-length
        this.meta.formattedTime = this.options.labelsUTC ? moment(payload.tickData.x).utc().format('MM/DD/YYYY h:mm a') : moment(payload.tickData.x).format('MM/DD/YYYY h:mm a');
        // tslint:disable-next-line: max-line-length
        this.meta.bucketNSeries = this.options.series[this.meta.bucket] && this.options.series[this.meta.bucket][this.meta.xTime] ? this.options.series[this.meta.bucket][this.meta.xTime].length : 0;
        // tslint:disable-next-line: max-line-length
        this.meta.bucketNSPercent = this.meta.bucketNSeries ? this.unitConvertor.convert((this.meta.bucketNSeries / this.options.heatmap.nseries) * 100, '', '', { unit: '', precision: 'auto' }) : 0;
        const range = yScale.invertExtent(this.meta.bucket);
        for (let i = 0; i < 2; i++) {
            const dunit = this.unitConvertor.getNormalizedUnit(range[i], format);
            range[i] = this.unitConvertor.convert(range[i], format.unit, dunit, { unit: format.unit, precision: precision });
        }
        this.meta.bucketRange = range;

        const barData = [];
        for (let i = 1; i <= this.options.heatmap.buckets; i++) {
            const range = yScale.invertExtent(i);
            // tslint:disable-next-line: max-line-length
            barData.push({ label: i, value: this.options.series[i] && this.options.series[i][this.meta.xTime] ? this.options.series[i][this.meta.xTime].length : 0, start: range[0] });
            if (i === this.meta.bucket) {
                barData[i - 1].color = '#227aec';
            }
        }
        this.barData = { ...this.barData, data: barData, format: format };
        this.setTableData();
    }

    private setTableData() {
        // tslint:disable-next-line: max-line-length
        const data = this.options.series[this.meta.bucket] && this.options.series[this.meta.bucket][this.meta.xTime] ? this.options.series[this.meta.bucket][this.meta.xTime] : [];
        const format = this.options.axes.y.tickFormat;
        const precision = format.precision ? format.precision : 2;

        const dsData = [];
        const tagsKeys: any = {};
        for (let i = 0; i < data.length; i++) {
            const dunit = this.unitConvertor.getNormalizedUnit(data[i].v, format);
            const val = this.unitConvertor.convert(data[i].v, format.unit, dunit, { unit: format.unit, precision: precision });
            const tags = data[i].tags;
            for (const k in tags) {
                if (tags[k]) {
                    tagsKeys[k] = true;
                }
            }
            dsData.push({ metric: data[i].label, value: val, ...tags });
        }
        const columns = Object.keys(tagsKeys).sort();
        columns.push('value');
        this.tableColumns = columns;
        this.tableDataSource.data = dsData;
        this.tableDataSource.sort = this.sort;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
