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
import { Component, OnInit, HostBinding, Input } from '@angular/core';

// import { MatDialog, MatDialogConfig, MatDialogRef, DialogPosition } from '@angular/material';

import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';

import { WidgetModel } from '../../../../../dashboard/state/widgets.state';

import {
    WidgetConfigAxesComponent,
    WidgetConfigGeneralComponent,
    WidgetConfigLegendComponent,
    WidgetConfigMetricQueriesComponent,
    WidgetConfigQueryInspectorComponent,
    WidgetConfigTimeComponent,
    WidgetConfigVisualAppearanceComponent
} from '../../../sharedcomponents/components';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'status-widget',
    templateUrl: './status-widget.component.html',
    styleUrls: []
})
export class StatusWidgetComponent implements OnInit {
    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.status-widget') private _componentClass = true;

    /** Inputs */
    @Input() editMode: boolean;
    @Input() widget: WidgetModel;

    /** Outputs */

    /** Local variables */

    constructor(private interCom: IntercomService) { }

    ngOnInit() {
    }

    /**
     * Services
     */

    // None yet

    /**
     * Behaviors
     */

     closeViewEditMode() {
        this.interCom.requestSend(<IMessage>{
            action: 'closeViewEditMode',
            payload: 'dashboard'
        });
    }

}
