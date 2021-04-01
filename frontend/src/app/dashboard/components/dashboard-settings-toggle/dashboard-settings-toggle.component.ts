import {
    Component, OnInit, HostBinding, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';

import {
    MatDialog, MatDialogConfig, MatDialogRef, DialogPosition
} from '@angular/material';

import { DashboardSettingsDialogComponent } from '../dashboard-settings-dialog/dashboard-settings-dialog.component';

import { Subscription } from 'rxjs';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dashboard-settings-toggle',
    templateUrl: './dashboard-settings-toggle.component.html',
    styleUrls: []
})
export class DashboardSettingsToggleComponent implements OnInit, OnDestroy {

    @HostBinding('class.dashboard-settings-toggle') private _hostClass = true;

    /** Dialogs */
    dashboardSettingsDialog: MatDialogRef<DashboardSettingsDialogComponent> | null;
    listenSub: Subscription;

    constructor(
        private interCom: IntercomService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            if (message.action === 'dashboardSettingsToggleResponse' && message.id === 'settingsToggle') {

                this.displaySettingsDialog(message.payload);
            }

            switch( message.action ) {
                case 'updateDashboardTags':
                    if (this.dashboardSettingsDialog && this.dashboardSettingsDialog.componentInstance) {
                        this.dashboardSettingsDialog.componentInstance.dbData.dbTags = message.payload;
                    }
                    break;
            }
        });
    }

    ngOnDestroy() {
        this.listenSub.unsubscribe();
    }

    showDashboardSettingsDialog() {
        // request settings data from dashboard
        this.interCom.requestSend(<IMessage> {
            id: 'settingsToggle',
            action: 'dashboardSettingsToggleRequest',
            payload: {}
        });
    }

    private displaySettingsDialog(data: any) {
        // do something
        const dialogConf: MatDialogConfig = new MatDialogConfig();
        dialogConf.width = '100%';
        dialogConf.maxWidth = '100%';
        dialogConf.height = 'calc(100% - 48px)';
        dialogConf.backdropClass = 'dashboad-settings-dialog-backdrop';
        dialogConf.panelClass = 'dashboard-settings-dialog-panel';
        dialogConf.position = <DialogPosition>{
            top: '48px',
            bottom: '0px',
            left: '0px',
            right: '0px'
        };
        dialogConf.autoFocus = false;
        dialogConf.data = data;

        this.dashboardSettingsDialog = this.dialog.open(DashboardSettingsDialogComponent, dialogConf);
        this.dashboardSettingsDialog.updatePosition({top: '48px'});

        // getting data passing out from dialog
        this.dashboardSettingsDialog.afterClosed().subscribe((dialog_out: any) => {
            if (dialog_out) {
                this.interCom.requestSend(<IMessage> {
                    id: 'settingsToggle',
                    action: 'updateDashboardSettings',
                    payload: dialog_out
                });
            }
        });
    }
}
