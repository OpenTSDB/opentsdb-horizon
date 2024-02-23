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
    ViewChild,
    ElementRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormControl,
    FormArray
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dbs-meta',
    templateUrl: './dbs-meta.component.html',
    styleUrls: ['./dbs-meta.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DbsMetaComponent implements OnInit, OnDestroy {
    @HostBinding('class.dbs-meta-component') private _hostClass = true;
    @HostBinding('class.dbs-settings-tab') private _tabClass = true;

    /** Inputs */
    @Input() dbData: any = {};

    /** Outputs */
    @Output() dataModified: any = new EventEmitter();

    /** Local Variables */
    metaForm: FormGroup;
    metaFormSub: Subscription;

    @ViewChild('newLabelInput', { static: true }) newLabelInput: ElementRef;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.metaForm = this.fb.group({
            title: new FormControl(this.dbData.meta.title),
            namespace: new FormControl(this.dbData.meta.namespace),
            isPersonal: new FormControl(this.dbData.meta.isPersonal),
            description: new FormControl(this.dbData.meta.description),
            labels: this.fb.array([]),
        });

        this.metaFormSub = this.metaForm.valueChanges.subscribe((val) => {
            this.dataModified.emit({
                type: 'meta',
                data: val,
            });
        });

        this.intializeLabels(this.dbData.meta.labels);
    }

    get title() {
        return this.metaForm.get('title');
    }
    get namespace() {
        return this.metaForm.get('namespace');
    }
    get isPersonal() {
        return this.metaForm.get('isPersonal');
    }
    get description() {
        return this.metaForm.get('description');
    }
    get labels() {
        return this.metaForm.get('labels');
    }

    ngOnDestroy() {
        this.metaFormSub.unsubscribe();
    }

    intializeLabels(values: any) {
        const control = <FormArray>this.metaForm.controls['labels'];

        for (const item of values) {
            control.push(this.fb.group(item));
        }
    }

    /**
     * Click event for the 'plus' sign in the label input
     */
    addNewLabel(e: any) {
        const labelValue = this.newLabelInput.nativeElement.value;
        this.addDbLabel(labelValue);
        this.newLabelInput.nativeElement.value = '';
    }

    /**
     * Method to push an item in the form labels array
     */
    addDbLabel(label: any) {
        const control = <FormArray>this.metaForm.controls['labels'];
        control.push(this.fb.group({ label: label }));
    }

    /**
     * method to remove item from form labels array
     */
    removeDbLabel(i: number) {
        // remove address from the list
        const control = <FormArray>this.metaForm.controls['labels'];
        control.removeAt(i);
    }
}
