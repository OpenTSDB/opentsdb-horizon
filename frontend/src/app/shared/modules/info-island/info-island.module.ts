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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { InfoIslandService } from './services/info-island.service';
import { InfoIslandComponent } from './containers/info-island.component';

/** possible island components */
import { IslandTestComponent } from './components/island-test/island-test.component';
import { EventStreamComponent } from './components/event-stream/event-stream.component';

import { TimeseriesLegendComponent } from './components/timeseries-legend/timeseries-legend.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { InfoIslandToolbarComponent } from './components/info-island-toolbar/info-island-toolbar.component';
import { HeatmapBucketDetailComponent } from './components/heatmap-bucket-detail/heatmap-bucket-detail.component';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';

import { D3Module } from '../d3/d3.module';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        OverlayModule,
        MaterialModule,
        MatTableModule,
        MatSortModule,
        D3Module,
        TableVirtualScrollModule,
    ],
    declarations: [
        InfoIslandComponent,
        IslandTestComponent,
        EventStreamComponent,
        TimeseriesLegendComponent,
        InfoIslandToolbarComponent,
        HeatmapBucketDetailComponent,
    ],
    providers: [InfoIslandService],
    entryComponents: [
        InfoIslandComponent,
        IslandTestComponent,
        EventStreamComponent,
        TimeseriesLegendComponent,
        HeatmapBucketDetailComponent,
    ],
})
export class InfoIslandModule {}
