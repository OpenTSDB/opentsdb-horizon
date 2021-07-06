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
    Inject,
    HostBinding,
    ViewChild
} from '@angular/core';

import { FormControl, Validators } from '@angular/forms';

import {
    MatDialogRef
} from '@angular/material';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'name-alert-dialog',
    templateUrl: './name-alert-dialog.component.html',
    styleUrls: []
})
export class NameAlertDialogComponent implements OnInit {

    @HostBinding('class.name-alert-dialog-component') private _hostClass = true;

    alertName = new FormControl('', Validators.required);

    constructor(
        public dialogRef: MatDialogRef<NameAlertDialogComponent>
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
    }

    getErrorMessage() {
        if (this.alertName.hasError('required')) {
            return 'You must enter an alert name';
        }
        return '';
    }

    saveAlertName() {
        if (!this.alertName.invalid) {
            this.dialogRef.close({ alertName: this.alertName.value });
        }
    }

}
