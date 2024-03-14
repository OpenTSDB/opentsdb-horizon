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

import { TemplateVariablePanelComponent } from './template-variable-panel.component';
import { DASHBOARD_TESTING_IMPORTS } from '../../dashboard-testing.utils';
import { DashboardService } from '../../services/dashboard.service';
import { HttpService } from '../../../core/http/http.service';
import { Observable, of } from 'rxjs';

describe('TemplateVariablePanelComponent', () => {
    let component: TemplateVariablePanelComponent;
    let fixture: ComponentFixture<TemplateVariablePanelComponent>;

    let mockHttpService;

    beforeEach(waitForAsync(() => {

        mockHttpService = jasmine.createSpyObj(['getNamespaces']);
        mockHttpService.getNamespaces.and.returnValue(of(['namespace01', 'namespace02', 'namespace03']));

        TestBed.configureTestingModule({
            declarations: [TemplateVariablePanelComponent],
            imports: DASHBOARD_TESTING_IMPORTS,
            providers: [
                {
                    provide: HttpService,
                    useValue: mockHttpService
                },
                DashboardService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TemplateVariablePanelComponent);
        component = fixture.componentInstance;

        // inputs
        component.mode = 'view';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
