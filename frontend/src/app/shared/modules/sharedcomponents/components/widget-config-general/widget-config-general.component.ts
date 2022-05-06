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
import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'widget-config-general',
    templateUrl: './widget-config-general.component.html',
    styleUrls: ['./widget-config-general.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WidgetConfigGeneralComponent implements OnInit, OnDestroy {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.general-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    /** Local variables */
    formGroups: FormGroup;
    formGroupSub: Subscription;

    constructor(private fb: FormBuilder ) { }

    ngOnInit() {
        this.formGroups = this.fb.group({
            title: new FormControl(this.widget.settings.title, [Validators.required]),
            description: new FormControl(this.widget.settings.description)
        });

        this.formGroupSub = this.formGroups.valueChanges.subscribe( data => {
            this.widgetChange.emit( {action: 'SetMetaData', payload: {data: data} } );
        });
    }

    ngOnDestroy() {
        this.formGroupSub.unsubscribe();
    }

}
