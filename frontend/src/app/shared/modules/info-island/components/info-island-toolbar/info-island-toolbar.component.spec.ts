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

import { InfoIslandToolbarComponent } from './info-island-toolbar.component';
import { INFO_ISLAND_TESTING_IMPORTS, INFO_ISLAND_TESTING_PROVIDERS } from '../../info-island-testing.utils';
import { InfoIslandService } from '../../services/info-island.service';

describe('InfoIslandToolbarComponent', () => {
    let component: InfoIslandToolbarComponent;
    let fixture: ComponentFixture<InfoIslandToolbarComponent>;

    let mockInfoIslandService = {
        islandToolbarRef: {
            insert: () => {}
        }
    };

    beforeEach(waitForAsync(() => {


        mockInfoIslandService.islandToolbarRef = jasmine.createSpyObj(['insert']);
        // mockAppConfigService.getConfig.and.returnValue(configValues);

        TestBed.configureTestingModule({
            declarations: [InfoIslandToolbarComponent],
            imports: [
                ...INFO_ISLAND_TESTING_IMPORTS
            ],
            providers: [
                {
                    provide: InfoIslandService,
                    useValue: mockInfoIslandService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoIslandToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
