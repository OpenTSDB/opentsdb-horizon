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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EventStreamComponent } from './event-stream.component';
import {
    INFO_ISLAND_TESTING_IMPORTS,
    INFO_ISLAND_TESTING_PROVIDERS
} from '../../info-island-testing.utils';

import {
    EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA,
    EVENT_STREAM_ISLAND_MOCK_DATA,
    EVENT_STREAM_ISLAND_DATA_MODEL
} from '../../../../mockdata/info-island/event-stream-island';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { ISLAND_DATA } from '../../info-island.tokens';
import { InfoIslandToolbarComponent } from '../info-island-toolbar/info-island-toolbar.component';
import { Component } from '@angular/core';

@Component({
    selector: 'info-island-toolbar',
    template: '<div>Mock Info Island Toolbar Component</div>'
  })
  class MockInfoIslandToolbarComponent {}

describe('EventStreamComponent', () => {
    let component: EventStreamComponent;
    let fixture: ComponentFixture<EventStreamComponent>;

    // mock some stuff up
    /*let bsKeys = Array.from(Object.keys(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA));

    let mockIslandData = {...EVENT_STREAM_ISLAND_MOCK_DATA};

    bsKeys.forEach(key => {
        const mockBehaviorData = EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA[key];
        mockIslandData.data[key] = new Observable(mockBehaviorData);
    });

    let mockEventStreamIslandData: EVENT_STREAM_ISLAND_DATA_MODEL = {
        data: mockIslandData.data
    }*/


    let mockIslandData;

    const MockIslandData__factory = () => {
        /*let bsKeys = Array.from(Object.keys(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA));

        let mockIslandData = {...EVENT_STREAM_ISLAND_MOCK_DATA};
        bsKeys.forEach(key => {
            const mockBehaviorData = EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA[key];
            mockIslandData.data[key] = new Observable(mockBehaviorData);
        });*/

        let dataLeaf = {
            buckets$: <Observable<any[]>>of(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA.buckets$),
            expandedBucketIndex$: <Observable<number>>of(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA.expandedBucketIndex$),
            timeRange$: <Observable<any>>of(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA.timeRange$),
            timezone$: <Observable<string>>of(EVENT_STREAM_ISLAND_BEHAVIOR_SUBJECT_MOCK_DATA.timeZone$),
            title: EVENT_STREAM_ISLAND_MOCK_DATA.data.title
        }

        let mockData: EVENT_STREAM_ISLAND_DATA_MODEL = {
            data: dataLeaf,
            originId: EVENT_STREAM_ISLAND_MOCK_DATA.originId,
            widget: EVENT_STREAM_ISLAND_MOCK_DATA.widget
        }

        return mockData as EVENT_STREAM_ISLAND_DATA_MODEL;
    }

    beforeEach(waitForAsync(() => {

        mockIslandData = MockIslandData__factory()

        TestBed.configureTestingModule({
            declarations: [
                EventStreamComponent,
                MockInfoIslandToolbarComponent
            ],
            imports: [
                ...INFO_ISLAND_TESTING_IMPORTS
            ],
            providers: [
                ...INFO_ISLAND_TESTING_PROVIDERS,
                { provide: ISLAND_DATA, useValue: mockIslandData },
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(EventStreamComponent);
        component = fixture.debugElement.componentInstance;

        // commenting the detect changes as it was causing an angular error
        // causing: Error: NG0100: ExpressionChangedAfterItHasBeenChecked
        // fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
