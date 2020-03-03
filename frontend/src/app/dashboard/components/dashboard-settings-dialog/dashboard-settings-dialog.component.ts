import { Component, Inject, OnInit, HostBinding } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, DialogPosition, MatSort, MatTableDataSource } from '@angular/material';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dashboard-settings-dialog',
    templateUrl: './dashboard-settings-dialog.component.html',
    styleUrls: []
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
            idx: 0
        },
        {
            label: 'Variables',
            tab: 'variables',
            idx: 1
        },
        {
            label: 'JSON',
            tab: 'json',
            idx: 2
        }
    ];

    // tslint:disable-next-line:no-inferrable-types
    private pendingModifications: boolean = false;

    private pendingData: any = {};

    constructor(
        private interCom: IntercomService,
        public dialogRef: MatDialogRef<DashboardSettingsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any
    ) {}

    ngOnInit() {
    }

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
        //console.log('%cSETTINGS APPLY [EVENT]', 'color: white; background-color: blue; padding: 2px 4px;', this.pendingData);
        this.dialogRef.close(this.pendingData);
    }

    tabChangeEvent(e: any) {
        //console.log('%cSETTINGS TAB CHANGE [EVENT]', 'color: #ffffff; background-color: blue; padding: 2px 4px;', e);
    }

    settingsDataModified(e: any) {
        // SETTINGS UPDATED
        //console.log('%cSETTINGS UPDATED [EVENT]', 'color: #ffffff; background-color: blue; padding: 2px 4px;', e);
        if (!this.pendingModifications) {
            this.pendingModifications = true;
        }
        this.pendingData[e.type] = e.data;
    }

}
