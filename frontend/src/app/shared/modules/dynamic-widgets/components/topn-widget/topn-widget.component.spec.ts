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
import { MatLegacyDialogModule} from '@angular/material/legacy-dialog';

import { TopnWidgetComponent } from './topn-widget.component';
import { DYNAMIC_WIDGETS_TESTING_IMPORTS } from '../../dynamic-widgets-testing.utils';
import { TooltipDataService } from '../../../universal-data-tooltip/services/tooltip-data.service';
import { TOPN_WIDGET_MOCK_DATA } from '../../../../mockdata/dynamic-widgets/topn-widget';
import { ElementRef } from '@angular/core';
import { TooltipComponentService } from '../../../universal-data-tooltip/services/tooltip-component.service';
class MockResizeSensor {
    constructor(el, rFunc) { }
}

describe('TopnWidgetComponent', () => {
    let component: TopnWidgetComponent;
    let fixture: ComponentFixture<TopnWidgetComponent>;


    const widgetOutputEl: ElementRef = new ElementRef({
        getBoundingClientRect() {},
        closest() {}
    });

    const widgetOutputClosestEl: ElementRef = new ElementRef({
        getBoundingClientRect() {},
        closest() {}
    });

    beforeEach(waitForAsync(() => {

        let spySetSize = jasmine.createSpyObj({
            setSize: () => {}
        });

        spyOn(TopnWidgetComponent.prototype,'setSize').and.callFake(
            spySetSize.setSize
        );

        TestBed.configureTestingModule({
            declarations: [TopnWidgetComponent],
            imports: [
                ...DYNAMIC_WIDGETS_TESTING_IMPORTS
            ],
            providers: [
                TooltipDataService,
                TooltipComponentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

         /*
            Crazy way to get ElementRef.nativeElement functions to work
            see: https://www.jeffryhouser.com/index.cfm/2020/1/28/How-do-I-test-nativeElementfocus-in-Angular
        */

        fixture = TestBed.createComponent(TopnWidgetComponent);

        //component = fixture.componentInstance;
        component = fixture.debugElement.componentInstance;

        // inputs
        component.mode = 'test';
        component.widget = TOPN_WIDGET_MOCK_DATA;
        component.widgetOutputElement = widgetOutputEl;

        // NOTE: overriding setSize for test
        // TODO: figure out a better way to test that function
        // it is a bit complicated due to looking for all sorts
        // of elementRefs then calling on nativeElement functions
        // component.setSize = function (){ /* */ };

        fixture.detectChanges();


        spyOn(widgetOutputClosestEl.nativeElement, 'getBoundingClientRect')
            .and.returnValue({ top: 1, height: 100, left: 2, width: 200, right: 202 });

        spyOn(component.widgetOutputElement.nativeElement,'getBoundingClientRect')
            .and.returnValue({ top: 1, height: 100, left: 2, width: 200, right: 202 });

        spyOn(component.widgetOutputElement.nativeElement,'closest')
            .and.returnValue(widgetOutputClosestEl.nativeElement);

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
