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
    Component, OnInit, HostBinding, Inject, OnDestroy, ViewChild, Renderer2, ElementRef, HostListener, AfterContentInit
} from '@angular/core';
import { ISLAND_DATA } from '../../info-island.tokens';
import { IntercomService } from '../../../../../core/services/intercom.service';
import { fromEvent, Subscription } from 'rxjs';
import { MatTableDataSource, MatTable, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { CdkObserveContent } from '@angular/cdk/observers';
import { InfoIslandComponent } from '../../containers/info-island.component';
import { UtilsService } from '../../../../../core/services/utils.service';
import { I } from '@angular/cdk/keycodes';
import { TableItemSizeDirective, TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { ResizeSensor} from 'css-element-queries';
import * as moment from 'moment';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'timeseries-legend-component',
    templateUrl: './timeseries-legend.component.html',
    styleUrls: []
})
export class TimeseriesLegendComponent implements OnInit, OnDestroy, AfterContentInit {

    @HostBinding('class.timeseries-legend-component') private _hostClass = true;

    @ViewChild('legendTable', { read: MatTable }) private _legendTable: MatTable<any>;
    @ViewChild('legendTable', { read: ElementRef }) private _legendTableEl: ElementRef<any>;
    @ViewChild('legendTable', { read: CdkObserveContent }) private _legendTableObserve: CdkObserveContent;
    @ViewChild('tsDataWrapper', { read: ElementRef }) private _tsDataWrapper: ElementRef<any>;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(CdkVirtualScrollViewport) viewportComponent: CdkVirtualScrollViewport;

    islandRef: InfoIslandComponent;

    /** Subscription handler */
    private subscription: Subscription = new Subscription();

    /** Local Variables */
    currentWidgetId: string = '';
    currentWidgetOptions: any = {};
    currentWidgetQueries: any = {};
    currentWidgetType: string = '';

    options: any = {
        trackMouse: true,
        open: false,
        showLogscaleToggle: true
    };
    data: any;

    dataLimitTypes: string[] = ['Top', 'Bottom', 'All'];

    dataLimitType = 'All'; // all || top |\ bottom
    showAmount: FormControl = new FormControl(50);

    logScaleY1 = false;
    logScaleY2 = false;

    /** Table Stuff */
    tableColumns: string[] = [];
    //tableDataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>([]);
    tableDataSource: TableVirtualScrollDataSource<any[]> = new TableVirtualScrollDataSource<any[]>([]);
    resultTagKeys: string[] = [];

    highlightTag: any = { key: '', value: '' };

    masterChecked = false;
    masterIndeterminate = false;

    shiftModifierKey: boolean = false;
    firstClickedSrcIndex: any = -1;
    lastClickedSrcIndex: any = -1;

    virtualScrollHeight: number = 193;

    multigraph: any = false;

    private tableListen;

    constructor(
        private interCom: IntercomService,
        private renderer: Renderer2,
        private utilsService: UtilsService,
        @Inject(ISLAND_DATA) private _islandData: any
    ) {
        //console.log('[TSL] Constructor', { ISLAND_DATA: _islandData });
        // Set initial incoming data (data from first click that opens island)
        this.currentWidgetId = _islandData.originId;
        if (_islandData.widget && _islandData.widget.settings && _islandData.widget.settings.component_type) {
            this.currentWidgetType = _islandData.widget.settings.component_type;
        }

        if (_islandData.data && _islandData.data.showLogscaleToggle === false) {
            this.options.showLogscaleToggle = false;
        }

        //this.currentWidgetOptions = utilsService.deepClone(_islandData.data.options);
        //this.currentWidgetQueries = utilsService.deepClone(_islandData.data.queries);
        this.currentWidgetOptions = _islandData.data.options;
        this.currentWidgetQueries = _islandData.data.queries;

        this.multigraph = _islandData.data.multigraph;
        //this.data = utilsService.deepClone(_islandData.data.tsTickData);
        this.data = _islandData.data.tsTickData;
        this.setTableColumns();
        this.setTableData();
        this.options.open = true;

        if (this.multigraph) {
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendFocusChange',
                payload: this.multigraph
            });
        } else {
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendFocusChange',
                payload: true
            });
        }

        let widgetAxes: any = {};
        if (_islandData.widget && _islandData.widget.settings && _islandData.widget.settings.axes) {
            widgetAxes = _islandData.widget.settings.axes;
        }
        this.logScaleY1 = (widgetAxes.y1 && widgetAxes.y1.hasOwnProperty('logscale')) ? widgetAxes.y1.logscale : false;
        this.logScaleY2 = (widgetAxes.y2 && widgetAxes.y2.hasOwnProperty('logscale')) ? widgetAxes.y2.logscale : false;

        // set subscriptions
        this.subscription.add(this.interCom.responseGet().subscribe(message => {
            switch (message.action) {
                case 'islandResizeComplete':
                    // island got resized... need to tell virtual scrollport to check size
                    this.viewportComponent.checkViewportSize();
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.interCom.requestListen().subscribe(message => {
            // this.console.intercom('[TSL] RequestListen', {message});
            switch (message.action) {
                case 'tsLegendWidgetOptionsUpdate':
                    //this.currentWidgetOptions = this.utilsService.deepClone(message.payload.options);
                    this.currentWidgetOptions = message.payload.options;
                    this.updateMasterCheckboxStates();
                    break;
                case 'tsLegendWidgetSettingsResponse':
                    //this.currentWidgetOptions = this.utilsService.deepClone(message.payload.options);
                    this.currentWidgetOptions = message.payload.options;
                    const settings = message.payload.settings;
                    this.currentWidgetType = settings.component_type;
                    const axes = settings.axes;
                    this.logScaleY1 = (axes.y1.hasOwnProperty('logscale')) ? axes.y1.logscale : false;
                    this.logScaleY2 = (axes.y2.hasOwnProperty('logscale')) ? axes.y2.logscale : false;
                    this.updateMasterCheckboxStates();
                    break;
                case 'tsTickDataChange':
                    // if the incoming message has a trackMouse property, it came from a click that is resetting it
                    // otherwise if the local options.trackMouse is true, compare the widget ids, and if multigraph, compare multigraph x/y
                    if (
                        (message.payload.trackMouse) ||
                        (this.options.trackMouse && (this.currentWidgetId === message.id) && (!this.multigraph || (this.multigraph && (this.multigraph.y === message.payload.multigraph.y) && (this.multigraph.x === message.payload.multigraph.x))))
                    ) {
                        let newOptionsNeeded = false;
                        // if new widget, then get new options
                        if (this.currentWidgetId !== message.id) {
                            // check if previous series were all hidden, if so, then turn on
                            this.checkExitVisbility();
                            //this.masterIndeterminate = false;
                            newOptionsNeeded = true;
                            this.tableHighlightTag('', '');
                        } else if (message.payload.multigraph) {
                            if (this.multigraph && (this.multigraph.y !== message.payload.multigraph.y || this.multigraph.x !== message.payload.multigraph.x)) {
                                // check if previous series were all hidden, if so, then turn on
                                this.checkExitVisbility();
                                this.masterIndeterminate = false;
                                // this.console.error('DIFFERENT MULTIGRAPH GRAPH', message);
                                newOptionsNeeded = true;
                                this.tableHighlightTag('', '');
                            }
                        }

                        if (message.payload.trackMouse) {
                            this.trackmouseCheckboxChange(message.payload.trackMouse);
                        }
                        this.currentWidgetId = message.id;
                        this.multigraph = message.payload.multigraph;
                        if (message.payload.queries) {
                            //this.currentWidgetQueries = this.utilsService.deepClone(message.payload.queries);
                            this.currentWidgetQueries = message.payload.queries;
                        }
                        //this.data = this.utilsService.deepClone(message.payload.tickData);
                        this.data = message.payload.tickData;
                        this.setTableColumns();
                        this.setTableData();

                        // need new options
                        if (newOptionsNeeded) {
                            // request widget settings
                            // need this for axis logscale settings
                            this.interCom.responsePut({
                                id: message.id,
                                action: 'tsLegendRequestWidgetSettings',
                                payload: {
                                    multigraph: this.multigraph
                                }
                            });
                            this._legendTableObserve.disabled = false;
                            // request new overlayOrginRef
                            this.interCom.responsePut({
                                id: message.id,
                                action: 'tsLegendRequestUpdatedOverlayOrigin',
                                payload: {
                                    multigraph: this.multigraph
                                }
                            });
                        }

                        // focus change
                        if (this.multigraph) {
                            this.interCom.responsePut({
                                id: this.currentWidgetId,
                                action: 'tsLegendFocusChange',
                                payload: this.multigraph
                            });
                        } else {
                            this.interCom.responsePut({
                                id: this.currentWidgetId,
                                action: 'tsLegendFocusChange',
                                payload: true
                            });
                        }
                    }
                    break;
                default:
                    break;
            }
        }));

        this.subscription.add(this.showAmount.valueChanges.subscribe(val => {
            this.setTableData();
        }));

        // interCom out the options
        this.interCom.responsePut({
            action: 'tsLegendOptionsChange',
            payload: this.options
        });

    }

    ngOnInit() {
        this.tableDataSource.sort = this.sort;
        this.tableDataSource.sortingDataAccessor = this.sortingDataAccessor;
        this.tableDataSource.sortData = this.sortData;
    }

    ngAfterContentInit() {
        const resizeSensor = new ResizeSensor(this._tsDataWrapper.nativeElement, (size) => {
           this.virtualScrollHeight = size.height ? size.height : 193;
        });
    }

    get visibleDataCount() {
        const visible = this.currentWidgetOptions.visibility.filter(item => item === true);
        return visible.length;
    }

    get sortActiveText() {
        if (this.sort) {
            return this.sort.active;
        }
        return 'value';
    }

    /** Toolbar controls */
    trackmouseCheckboxChange(event: any) {
        // update options, then interCom requestSend change
        this.options.trackMouse = event.checked;
        this.interCom.responsePut({
            action: 'tsLegendOptionsChange',
            payload: this.options
        });
    }

    logscaleCheckboxChange(axis: string, value: boolean) {
        if (axis === 'y1') {
            this.logScaleY1 = value;
        }

        if (axis === 'y2') {
            this.logScaleY2 = value;
        }

        // need to interCom to widget to update logScale
        this.interCom.responsePut({
            action: 'tsLegendLogscaleChange',
            id: this.currentWidgetId,
            payload: {
                y1: this.logScaleY1,
                y2: this.logScaleY2
            }
        });
    }

    dataLimitTypeChange(value: string) {
        this.dataLimitType = value;
        // trigger some sort of data filtering here
        this.setTableData();
    }

    formattedMetricLabel(data: any): string {
        return this.sortingDataAccessor(data, 'metric');
    }

    /** Table controls & functions */

    tableContentChanged(event: any) {
        // calculate size of table
        const tableSize: DOMRect = this._legendTableEl.nativeElement.getBoundingClientRect();

        // attempt to tell island window of potential minimum size to open with all data visible
        this.islandRef.updateSize(tableSize);

        // then disable this watcher
        this._legendTableObserve.disabled = true;
    }

    onMatSortChange(event: any) {
        // trigger some sort of data filtering?
        this.setTableData();
    }

    private setTableColumns() {
        // columns always start with these
        let columns = ['checkbox', 'metric'];

        // extract tags, excluding 'metric' as we already set it after 'checkbox'
        let tagKeys: any[] = [];

        let tagKeyProps: any = {};

        if (this.data.series.length > 0) {
            //tagKeys = Object.keys(this.data.series[0].series.tags).filter(tag => tag !== 'metric');

            for (const index in this.data.series) {
                if (this.data.series[index]) {
                    const seriesTags: any = {...this.data.series[index].series.tags};
                    if (seriesTags.metric) {
                        delete seriesTags.metric;
                    }
                    tagKeyProps = Object.assign(tagKeyProps, seriesTags);
                }
            }

            tagKeys = Object.keys(tagKeyProps);

        }

        columns = columns.concat(tagKeys, ['value']);
        this.resultTagKeys = tagKeys;
        this.tableColumns = columns;
    }

    private setTableData() {
        if (this.data.series.length === 0) {
            this.tableDataSource.data = [];
        } else {
            for (const index in this.data.series) {
                if (this.data.series[index]) {
                    // tslint:disable-next-line: radix
                    this.data.series[index]['srcIndex'] = parseInt(index);
                    this.data.series[index]['visible'] = this.currentWidgetOptions.visibility[this.data.series[index].srcIndex];
                }
            }

            // go ahead and sort by value so showLimit will show correctly
            const newDataArray: any[] = this.sortData(this.data.series, (this.sort) ? this.sort : <MatSort>{ active: 'value', direction: 'asc' });

            const showLimit = this.showAmount.value;

            switch (this.dataLimitType) {
                case 'Top':
                    this.tableDataSource.data = (newDataArray.length < showLimit) ? newDataArray : newDataArray.slice(0, showLimit);
                    break;
                case 'Bottom':
                    this.tableDataSource.data = (newDataArray.length < showLimit) ? newDataArray : newDataArray.slice(newDataArray.length - showLimit, newDataArray.length);
                    break;
                default:
                    this.tableDataSource.data = newDataArray;
                    break;
            }

            // double check the sort if it is a tag (if not value or metric, it is a tag)
            if (this.sort && this.sort.active !== 'value' && this.sort.active !== 'metric') {
                // check if by changing data (and possibly changing graph)
                // if the sort.active exists on the data
                // if not, go back to default of 'value'
                if (!(this.tableDataSource.data[0] as any).series.tags[this.sort.active]) {
                    this.sort.active = 'value';
                }
            }
        }

        this.updateMasterCheckboxStates();
        if (this._legendTable) {
            this._legendTable.renderRows();
        }
    }

    /* TABLE SORTING */

    // because our data columns sometimes use nested data to display,
    // we have to use a sort accessor depending on column to
    // return correct data to sort against
    private sortingDataAccessor(item: any, property: any) {
        let value: any;
        if (property === 'value') {
            // formatted value
            value = item.data.yval;
        } else if (property === 'metric') {
            // regex to test if expression
            // group indentifiers don't work in some versions of node, even if valid
            // const regex = /^q(?<queryIndex>[1-9][0-9]*?)\:e(?<metricIndex>[1-9][0-9]*?)$/gmi;
            const regex = /^q([1-9][0-9]*)\:e([1-9][0-9]*)$/gmi;
            // if it IS expression
            if (regex.test(item.series.tags.metric)) {
                if (item.series.label === item.series.tags.metric) {
                    // need to lookup from widget
                    // get query and metric index from label (should be something like 'Q1:e1')
                    const regMatch = item.series.label.toLowerCase().split(':');
                    const qIndex = regMatch[0].substring(1); // get everything but the 'q'
                    const mIndex = regMatch[1].substring(1); // get everything but the 'e'

                    // TODO: need to get expression from widget queries
                    if (
                        this.currentWidgetQueries[qIndex] &&
                        this.currentWidgetQueries[qIndex].metrics[mIndex] &&
                        this.currentWidgetQueries[qIndex].metrics[mIndex].expression
                    ) {
                        value = this.currentWidgetQueries[qIndex].metrics[mIndex].originalExpression;
                    } else {
                        // fallback to label
                        value = item.series.label;
                    }
                } else {
                    value = item.series.label;
                }
            } else {
                // Its not an expression
                value = item.series.label;
            }
        } else if (item.series.tags.hasOwnProperty(property)) {
            // must be a tag
            value = item.series.tags[property];
        } else {
            // everything else
            value = item[property];
        }

        return value;
    }

    // custom sort to be able to place NaN values properly if sorting by 'value'
    private sortData(data: any[], sort: MatSort): any[] {
        const active = sort.active;
        const direction = sort.direction;

        let dataValues: any[] = [];
        let nanValues: any[] = [];
        let sortedValues: any[];

        // if sorting by value (which should be an integer/float)
        if (active === 'value') {
            // need to remove NaN temporarily
            nanValues = data.slice().filter((item: any) => isNaN(item.data.yval));
            // real integer/float values
            dataValues = data.slice().filter((item: any) => !isNaN(item.data.yval));
        } else {
            // sorting by something else, most likely a string
            dataValues = data.slice();
        }

        // sort it
        sortedValues = dataValues.sort((a: any, b: any) => {
            const valueA = this.sortingDataAccessor(a, active);
            const valueB = this.sortingDataAccessor(b, active);
            if (active === 'value') {
                // for sorting integer/float
                return (direction === 'asc') ? valueA - valueB : valueB - valueA;
            } else {
                // string type sort
                return (valueA < valueB ? -1 : 1) * (direction === 'asc' ? 1 : -1);
            }
        });

        let finalValues: any[];

        // add NaN values back in their proper place depending on sort
        if (direction === 'asc') {
            // ascending sort has NaN items first
            finalValues = nanValues.concat(sortedValues);
        } else {
            // descending has NaN values last
            finalValues = sortedValues.concat(nanValues);
        }

        // return sorted data
        return finalValues;
    }

    /* table checkbox controls */
    private updateMasterCheckboxStates() {
        let visCount = 0;

        for (let i = 0; i < this.tableDataSource.data.length; i++) {
            const item: any = this.tableDataSource.data[i];
            const srcIndex = item.srcIndex;

            if (this.currentWidgetOptions.visibility[srcIndex] === true) {
                visCount++;
            }
        }

        const indeterminateCheck = (visCount < this.tableDataSource.data.length && visCount > 0) ? true : false;
        if (this.masterIndeterminate !== indeterminateCheck) {
            this.masterIndeterminate = (visCount < this.tableDataSource.data.length && visCount > 0) ? true : false;
        }
        // need to timeout slightly to let indeterminate to set first, otherwise it would cancel out masterChecked (if true)
        setTimeout(() => {
            this.masterChecked = (visCount === 0) ? false : (visCount === this.tableDataSource.data.length) ? true : false;
        }, 50);

    }

    // master checkbox change
    masterCheckboxClick($event) {
        const checked = this.masterChecked;
        const indeterminate = this.masterIndeterminate;

        if (!checked && !indeterminate) {
            // everything is not visible
            // need to toggle everything to be turned on
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: true,
                    batch: <number[]>this.tableDataSource.data.map((item: any) => item.srcIndex),
                    multigraph: this.multigraph
                }
            });
        } else if (checked && !indeterminate) {
            // everything is visible
            // need to toggle everything to turn off
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: false,
                    batch: <number[]>this.tableDataSource.data.map((item: any) => item.srcIndex),
                    multigraph: this.multigraph
                }
            });
        } else {
            // indeterminate
            // partial not visible
            // need to turn those on
            const notVisible = this.tableDataSource.data.filter((item: any) => !this.currentWidgetOptions.visibility[item.srcIndex]);

            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: true,
                    batch: <number[]>notVisible.map((item: any) => item.srcIndex),
                    multigraph: this.multigraph
                }
            });
        }
    }

    // single table row checkbox
    timeSeriesVisibilityToggle(srcIndex: any, currentCheckedStatus: boolean, event: any) {
        const newVisibilityState = !currentCheckedStatus;
        let itemIndex: any = this.tableDataSource.data.findIndex((item: any) => item.srcIndex === srcIndex);
        let lastItemIndex: any = this.lastClickedSrcIndex >= 0 ? this.tableDataSource.data.findIndex((item: any) => item.srcIndex === this.lastClickedSrcIndex) : this.lastClickedSrcIndex;
        let firstItemIndex: any = this.firstClickedSrcIndex >= 0 ? this.tableDataSource.data.findIndex((item: any) => item.srcIndex === this.firstClickedSrcIndex) : this.firstClickedSrcIndex;

        let toHide: number[] = [];
        let toShow: number[] = [];

        if (this.shiftModifierKey && this.firstClickedSrcIndex >= 0) {
            let srcIndexVisibilityMap: any = {}
            for(var i = 0; i < this.tableDataSource.data.length; i++) {
                const item: any = this.tableDataSource.data[i];
                srcIndexVisibilityMap[item.srcIndex] = {
                    dataIndex: i,
                    visible: this.currentWidgetOptions.visibility[item.srcIndex]
                };
            }

            if (itemIndex > firstItemIndex && itemIndex > lastItemIndex) {
                for(let i = lastItemIndex; i <= itemIndex; i++) {
                    const item: any = this.tableDataSource.data[i];
                    srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                }
            } else if (itemIndex > firstItemIndex && itemIndex < lastItemIndex) {
                for(let i = itemIndex; i <= lastItemIndex; i++) {
                    const item: any = this.tableDataSource.data[i];
                    srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                }
            } else if (itemIndex < firstItemIndex && itemIndex < lastItemIndex ) {
                for(let i = itemIndex; i <= lastItemIndex; i++) {
                    const item: any = this.tableDataSource.data[i];
                    srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                }
            } else if (itemIndex < firstItemIndex && itemIndex > lastItemIndex ) {
                for(let i = lastItemIndex; i <= itemIndex; i++) {
                    const item: any = this.tableDataSource.data[i];
                    srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                }
            } else if (itemIndex === firstItemIndex) {
                // they clicked on the same checkbox as the first click
                if (itemIndex > lastItemIndex) {
                    for(let i = lastItemIndex; i <= itemIndex; i++) {
                        const item: any = this.tableDataSource.data[i];
                        srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                    }

                } else if (itemIndex < lastItemIndex ) {
                    for(let i = itemIndex; i <= lastItemIndex; i++) {
                        const item: any = this.tableDataSource.data[i];
                        srcIndexVisibilityMap[item.srcIndex].visible = newVisibilityState;
                    }
                }
            }

            let mapKeys: number[] = Object.keys(srcIndexVisibilityMap).map(item => parseInt(item));

            for(let i = 0; i < mapKeys.length; i++) {
                if (srcIndexVisibilityMap[mapKeys[i]].visible) {
                    toShow.push(mapKeys[i]);
                } else {
                    toHide.push(mapKeys[i]);
                }
                (<any>this.tableDataSource.data[srcIndexVisibilityMap[mapKeys[i]].dataIndex]).visible = srcIndexVisibilityMap[mapKeys[i]].visible;
            }

            if (toHide.length > 0) {
                this.interCom.responsePut({
                    id: this.currentWidgetId,
                    action: 'tsLegendToggleSeries',
                    payload: {
                        visible: false,
                        batch: toHide,
                        multigraph: this.multigraph
                    }
                });
            }

            if (toShow.length > 0) {
                this.interCom.responsePut({
                    id: this.currentWidgetId,
                    action: 'tsLegendToggleSeries',
                    payload: {
                        visible: true,
                        batch: toShow,
                        multigraph: this.multigraph
                    }
                });
            }


        } else {

            if (this.shiftModifierKey && this.firstClickedSrcIndex === -1) {
                this.firstClickedSrcIndex = srcIndex;
            }

            (<any>this.tableDataSource.data[itemIndex]).visible = newVisibilityState;

            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: newVisibilityState,
                    batch: [srcIndex],
                    multigraph: this.multigraph
                }
            });
        }

        this.lastClickedSrcIndex = srcIndex;

    }

    timeseriesVisibilityBy(filter: string, data: any, event: any) {

        let toHide: number[] = [];
        let toShow: number[] = [];

        let modifierKey = false;
        if (event.shiftKey || event.metaKey || event.ctrlKey) {
            modifierKey = true;
        }

        // FILTERING BY ROW (i.e., Metric Name or checkbox)
        if (filter === 'row' && data.srcIndex > -1) {
            if (modifierKey && event.shiftKey) {
                // get some indices
                const itemIndex = this.tableDataSource.data.findIndex((item: any) => item.srcIndex === data.srcIndex);
                const lastIndex = this.tableDataSource.data.findIndex((item:any) => item.srcIndex === this.lastClickedSrcIndex);

                // check the direction of the shift select

                // select an item ABOVE the last clicked item in the list
                if (itemIndex < lastIndex) {
                    for(let i = itemIndex; i <= lastIndex; i++) {
                        let item = <any>this.tableDataSource.data[i];
                        toShow.push(item.srcIndex);
                    }
                }

                // select an item BELOW the last clicked item in the list
                if(itemIndex > lastIndex) {
                    for(let i = lastIndex; i <= itemIndex; i++) {
                        let item = <any>this.tableDataSource.data[i];
                        toShow.push(item.srcIndex);
                    }
                }

                // filter out the ones to hide
                toHide = this.tableDataSource.data.filter((item: any) => !toShow.includes(item.srcIndex)).map((item: any) => item.srcIndex);

            } else if(modifierKey && (event.metaKey || event.ctrlKey)) {

                // since this is a single click to add an item to the existing list,
                // we need to find the currently selected items
                for (let i = 0; i < this.currentWidgetOptions.visibility.length; i++) {
                    const itemVis = this.currentWidgetOptions.visibility[i];
                    if (itemVis === true) {
                        toShow.push(i);
                    }
                }

                // add the new clicked one
                toShow.push(data.srcIndex);

                // filter out the ones to hide
                toHide = this.tableDataSource.data.filter((item: any) => !toShow.includes(item.srcIndex)).map((item: any) => item.srcIndex);

            } else {
                // default behavior, select only the one you click
                toHide = (this.tableDataSource.data.filter((item: any) => item.srcIndex !== data.srcIndex)).map((item: any) => item.srcIndex);
                toShow = [data.srcIndex];
            }

        }

        // FILTERING BY TAG
        if (filter === 'tag' && data.tag && data.value) {
            toHide = (this.tableDataSource.data.filter((item: any) => item.series.tags[data.tag] !== data.value)).map((item: any) => item.srcIndex);
            toShow = (this.tableDataSource.data.filter((item: any) => item.series.tags[data.tag] === data.value)).map((item: any) => item.srcIndex);
        }

        // set last one clicked
        this.lastClickedSrcIndex = data.srcIndex;

        if (toHide.length > 0) {
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: false,
                    batch: toHide,
                    multigraph: this.multigraph
                }
            });
        }

        if (toShow.length > 0) {
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: true,
                    batch: toShow,
                    multigraph: this.multigraph
                }
            });
        }
    }

    tableHighlightTag(key: any, value: any) {
        this.highlightTag = { key, value };
    }

    // check if all timeseries are hidden
    // this is called when a widget/multigraph selection has changed,
    // OR when the island closes
    private checkExitVisbility() {
        // check if all series were hidden
        const notVisible: any[] = this.tableDataSource.data.filter((item: any) => !this.currentWidgetOptions.visibility[item.srcIndex]);
        if (notVisible.length === this.tableDataSource.data.length) {
            this.interCom.responsePut({
                id: this.currentWidgetId,
                action: 'tsLegendToggleSeries',
                payload: {
                    visible: true,
                    batch: <number[]>this.tableDataSource.data.map((item: any) => item.srcIndex),
                    multigraph: this.multigraph
                }
            });
        }
    }

    // data -> CSV

    // initiates CSV download
    saveLegendDataCSV() {

        let csvContent = this.getLegendCSV();
        //console.log('CSV CONTENT', csvContent);

        let filename = 'csvdata_' + this.currentWidgetId + '_' + moment(this.data.timestamp).format('YYYYMMDD_HH:mmA') + '.csv';

        // see: https://stackoverflow.com/a/24922761/1810361
        // for the Blob download snippet
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let navigator = window.navigator;

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    // initiates copying CSV to clipboard
    copyLegendDataCSV() {

        let csvContent = this.getLegendCSV();
        //console.log('CSV CONTENT', csvContent);

        // see: https://stackoverflow.com/a/49121680/1810361
        // for this quick copy to clipboard snippet
        // NOTE: need to upgrade to angular CDK clipboard service once we go to NG9+
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = csvContent;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    // formats legend data into CSV format
    private getLegendCSV(): any {
        let csvContent = '';
        // get headers
        let columns: any[] = [...this.tableColumns];
        columns.shift();
        // add headers to first line
        csvContent += columns.join(',') + '\n';

        // get legend data
        let data = this.getVisibleLegendItems();
        console.log('DATA', data);

        // loop through data and add relevant items to csvContent
        data.forEach((item: any) => {
            // first is always metric
            let rowData = '';
            columns.forEach(col => {
                if ( col === 'metric' ) {
                    rowData += this.formattedMetricLabel(item) + ',';
                } else if ( col === 'value' ) {
                    rowData += (typeof(item.formattedValue) === 'string') ? item.formattedValue.trim() : item.formattedValue;
                } else {
                    rowData += ((item.series.tags[col] === undefined) ? 'n/a' : item.series.tags[col]) + ',';
                }
            });
            csvContent += rowData + '\n';
        });

        this.parseCSVDataToConsole(csvContent);

        return csvContent;
    }

    // gets only the legend items that are checked (visible)
    private getVisibleLegendItems(): any[] {
        let toShow: number[] = [];
        let dataItems: any[];

        // get the indexes of items that are visible
        for (let i = 0; i < this.currentWidgetOptions.visibility.length; i++) {
            const itemVis = this.currentWidgetOptions.visibility[i];
            if (itemVis === true) {
                toShow.push(i);
            }
        }

        // filter table data to only return visible (checked) items
        dataItems = this.tableDataSource.data.filter((item: any) => toShow.includes(item.srcIndex)).map((item: any) => item);

        return dataItems;
    }

    // utility to print out the CSV data to console
    private parseCSVDataToConsole(data){
        let lbreak = data.split('\n');
        let columns = lbreak.shift().split(',');
        if (lbreak[lbreak.length-1].trim().length === 0) {
            lbreak.pop();
        }
        let csvData = [];

        lbreak.forEach(res => {
            let items = res.split(',');
            let resObj = {};
            items.forEach((item, i) => {
                resObj[columns[i]] = item;
            });
            csvData.push(resObj);
        });
        console.table(csvData);
    }

    @HostListener('document:keydown.shift', ['$event'])
    onShiftKeydown(e) {
        this.shiftModifierKey = true;
        if (this.lastClickedSrcIndex >= 0) {
            this.firstClickedSrcIndex = this.lastClickedSrcIndex;
        }
    }

    @HostListener('document:keyup.shift', ['$event'])
    onShiftKeyup(e) {
        this.shiftModifierKey = false;
        this.firstClickedSrcIndex = -1; // reset first clicked
        this.lastClickedSrcIndex = -1;
    }

    /** OnDestory - Always Last */
    ngOnDestroy() {
        this.subscription.unsubscribe();
        this._legendTableObserve.ngOnDestroy();

        // interCom options out that it has closed so graphs won't still be emitting tickdata
        this.options.open = false;
        this.interCom.responsePut({
            action: 'tsLegendOptionsChange',
            payload: this.options
        });
        // should turn any focus off
        this.interCom.responsePut({
            action: 'tsLegendFocusChange'
        });

        // check if all series were hidden
        this.checkExitVisbility();
    }

}
