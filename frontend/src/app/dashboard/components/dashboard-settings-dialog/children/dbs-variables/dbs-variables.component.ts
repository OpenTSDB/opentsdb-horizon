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
    OnInit,
    OnDestroy,
    HostBinding,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dbs-variables',
    templateUrl: './dbs-variables.component.html',
    styleUrls: ['./dbs-variables.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DbsVariablesComponent implements OnInit, OnDestroy {

    @HostBinding('class.dbs-variables-component') private _hostClass = true;
    @HostBinding('class.dbs-settings-tab') private _tabClass = true;

    /** Inputs */
    @Input() dbData: any = {};

    /** Outputs */
    @Output() dataModified: any = new EventEmitter();

    /** Local Variables */
    varForm: FormGroup;
    varFormSub: Subscription;

    selectedKeys: string[] = [];

    constructor(
        private fb: FormBuilder
    ) { }

    ngOnInit() {

        this.varForm = this.fb.group({
            enabled: new FormControl(this.dbData.variables.enabled),
            tplVariables: this.fb.array([])
        });

        this.varFormSub = this.varForm.valueChanges.subscribe(val => {
            // need to remove unused variables (ones without keys)
            const pending = val;
            const pendingKeys = [];
            pending.tplVariables = val.tplVariables.filter(item => {
                const keyCheck = item.tagk.trim();
                if (keyCheck.length > 0) {
                    pendingKeys.push(keyCheck);
                    return true;
                } else {
                    return false;
                }
            });

            this.selectedKeys = pendingKeys;

            this.dataModified.emit({
                type: 'variables',
                data: pending
            });
        });

        this.initializeTplVariables(this.dbData.variables.tplVariables);
    }

    ngOnDestroy() {
        this.varFormSub.unsubscribe();
    }

    // form control accessors (come after form has been setup)
    get enabled() { return this.varForm.get('enabled'); }
    get tplVariables() { return this.varForm.get('tplVariables'); }

    initializeTplVariables(values: any) {

        if (values.length === 0) {
            // add an empty one if there are no values
            this.addTemplateVariable();
        } else {
            this.selectedKeys = [];
            for (const item of values) {
                this.selectedKeys.push(item.tagk);
                this.addTemplateVariable(item);
            }
        }
    }

    addTemplateVariable(data?: any) {

        // TODO: need to detect if filter contains '*' to change type to wildcard

        data = (data) ? data : {};

        const varData = {
            tagk: (data.tagk) ? data.tagk : '',
            alias: (data.alias) ? data.alias : '',
            allowedValues: (data.allowedValues) ? this.fb.array(data.allowedValues) : this.fb.array([]),
            filter: (data.filter) ? this.fb.array(data.filter) : this.fb.array([]),
            enabled: (data.enabled) ? data.enabled : true,
            type: (data.type) ? data.type : 'literalor'
        };

        const control = <FormArray>this.varForm.controls['tplVariables'];
        control.push(this.fb.group(varData));
    }

    removeTemplateVariable(i: number) {
        const control = <FormArray>this.varForm.controls['tplVariables'];
        control.removeAt(i);
    }

    masterToggleChange(event: any) {
        // set value to form and force to notify up
        this.enabled.setValue(event.checked, { emitEvent: true });
    }
}
