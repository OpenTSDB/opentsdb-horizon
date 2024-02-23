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
    Inject,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-widget-delete-dialog',
    templateUrl: './widget-delete-dialog.component.html',
    styleUrls: ['./widget-delete-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WidgetDeleteDialogComponent implements OnInit {
    @HostBinding('class.widget-delete-dialog') private _hostClass = true;

    constructor(
        public dialogRef: MatDialogRef<WidgetDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any,
    ) {}

    ngOnInit() { /* do nothing */ }

    confirm(): void {
        this.dialogRef.close({ delete: true });
    }
}
