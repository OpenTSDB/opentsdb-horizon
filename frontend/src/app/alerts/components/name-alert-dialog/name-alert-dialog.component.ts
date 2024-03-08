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
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';

import { UntypedFormControl, Validators } from '@angular/forms';

import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'name-alert-dialog',
    templateUrl: './name-alert-dialog.component.html',
    styleUrls: ['./name-alert-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NameAlertDialogComponent implements OnInit {
    @HostBinding('class.name-alert-dialog-component') private _hostClass = true;

    alertName = new UntypedFormControl('', Validators.required);

    constructor(public dialogRef: MatDialogRef<NameAlertDialogComponent>) {
        dialogRef.disableClose = true;
    }

    ngOnInit() { /* do nothing */ }

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
