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
    Inject,
    OnInit,
    HostBinding,
    ViewEncapsulation,
} from '@angular/core';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

@Component({
    selector: 'dashboard-settings-dialog',
    templateUrl: './dashboard-settings-dialog.component.html',
    styleUrls: ['./dashboard-settings-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DashboardSettingsDialogComponent implements OnInit {
    @HostBinding('class.dashboard-settings-dialog') private _hostClass = true;

    /** local variables */
    selectedSettingPanel: any = 0; // 0-4 are array indexes from array below, 'admin' is special case

    // NOTE: admin is a special case that has to check if user is dashboard owner. So it will not be in the list.

    // navigation panel options, index is used for determining which nav item is opened
    panelSections: Array<any> = [
        {
            label: 'Meta data',
            tab: 'meta',
            idx: 0,
        },
        {
            label: 'Variables',
            tab: 'variables',
            idx: 1,
        },
        {
            label: 'JSON',
            tab: 'json',
            idx: 2,
        },
    ];

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private pendingModifications: boolean = false;

    private pendingData: any = {};

    constructor(
        public dialogRef: MatDialogRef<DashboardSettingsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any,
    ) {}

    ngOnInit() { /* do nothing */ }

    /**
     * Behaviors
     */

    selectSettingPanel(panelId: any) {
        this.selectedSettingPanel = panelId;
    }

    // handle when clicked on cancel
    onClick_Cancel(): void {
        this.dialogRef.close();
    }

    // handle when clicked on apply
    onClick_Apply(): any {
        // NOTE: Not sure emit is needed. Might be ok to just pass data from the close action.
        // this.onDialogApply.emit({
        //    action: 'applyDialog',
        //    data: this.dialog_data
        // });
        this.dialogRef.close(this.pendingData);
    }

    tabChangeEvent(e: any) {
        // NOTE: do we need this still?
    }

    settingsDataModified(e: any) {
        // SETTINGS UPDATED
        if (!this.pendingModifications) {
            this.pendingModifications = true;
        }
        this.pendingData[e.type] = e.data;
    }
}
