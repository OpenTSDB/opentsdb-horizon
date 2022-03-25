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
    Input,
    Output,
    EventEmitter,
    HostBinding,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { DashboardSaveDialogComponent } from '../dashboard-save-dialog/dashboard-save-dialog.component';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'navbar-dashboard-actions-menu',
    templateUrl: './navbar-dashboard-actions-menu.component.html',
    styleUrls: ['./navbar-dashboard-actions-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarDashboardActionsMenuComponent implements OnInit {

    @HostBinding('class.navbar-dashboard-actions-menu') private _hostClass = true;

    @Input() id: string;
    @Input() dbSettingsMeta: any = {};

    // dashboard action menu trigger
    @ViewChild('actionMenuTrigger', { read: MatMenuTrigger, static: false }) actionMenuTrigger: MatMenuTrigger;

    get actionMenuIsOpen(): boolean {
        if (this.actionMenuTrigger) {
            return this.actionMenuTrigger.menuOpen;
        }
        return false;
    }

    @Output() dashboardAction: any = new EventEmitter();

    /** Dialogs */
    dashboardSaveDialog: MatDialogRef<DashboardSaveDialogComponent> | null;

    // NOTE: change this bool back to false
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() needsSaving: boolean = true; // false default, true triggers visibility

    constructor(
        public dialog: MatDialog,
        private interCom: IntercomService
    ) { }

    ngOnInit() {
    }

    // NOTE:: these three click actions should probably intercom the dashboard container instead of emitting
    click_cloneDashboard(event: any) {
        this.dashboardAction.emit({
            action: 'clone'
        });
    }

    /* comment out until we implement them completely
    click_shareDashboard(event: any) {
        this.dashboardAction.emit({
            action: 'share'
        });
    }
    */

    click_deleteDashboard(event: any) {
        this.dashboardAction.emit({
            action: 'delete'
        });
    }

    click_saveDashboard(event: any) {
        // check if first time saving
        // if first time saving, prompt first save dialog
        if ( this.id === '_new_') {
            this.showFirstSaveDialog();
        } else {
            this.triggerSaveAction();
        }
    }

    private showFirstSaveDialog() {

        // do something
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.backdropClass = 'dashboard-save-dialog-backdrop';
        dialogConf.hasBackdrop = true;
        dialogConf.panelClass = 'dashboard-save-dialog-panel';

        dialogConf.autoFocus = true;

        // NOTE: this needs to be wired to the dasboard JSON/Config
        // should be the dashboard.settings piece
        dialogConf.data = this.dbSettingsMeta;

        this.dashboardSaveDialog = this.dialog.open(DashboardSaveDialogComponent, dialogConf);
        // this.dashboardSaveDialog.updatePosition({top: '48px'});

        // getting data passing out from dialog
        this.dashboardSaveDialog.afterClosed().subscribe((dialog_out: any) => {
            // dialog_out will be empty if the dialog is cancelled
            if ( dialog_out ) {
                this.triggerSaveAction(dialog_out);
            }
        });
    }

    private triggerSaveAction(data?: any) {

        const payload: any = { updateFirst: false, name: ''};

        if (data) {
            payload.updateFirst = true;
            payload.name = data.name;

            if (data.parentPath) {
                payload.parentPath = data.parentPath;
            }

            if (data.parentId) {
                payload.parentId = data.parentId;
            }
        }
        // now intercom to save it.
        this.interCom.requestSend(<IMessage> {
            action: 'dashboardSaveRequest',
            payload: payload
        });
    }
}
