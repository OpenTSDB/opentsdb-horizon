import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatDialog } from '@angular/material';
import { environment } from '../../../../../../environments/environment';
import { AuraDialogComponent } from '../../../../../shared/modules/sharedcomponents/components/aura-dialog/aura-dialog.component';

@Component({
  selector: 'alert-details-count',
  templateUrl: './alert-details-count.component.html',
  styleUrls: []
})
export class AlertDetailsCountComponent implements OnInit {

  constructor(private dialog: MatDialog) { }
  @HostBinding('class.alert-details-count') private _hostClass = true;

  @Input() counts;
  @Input() namespace;
  @Input() alertId;

  displayedColumns: string[] = ['bad', 'warn', 'good', 'unknown', 'missing'];
  auraUrl = environment.auraUI + '/#/aura/newquery';
  auraDialog: MatDialogRef<AuraDialogComponent> | null;

  ngOnInit() {
  }

  showAuraDialog(filters) {
    const dialogConf: MatDialogConfig = new MatDialogConfig();
    // dialogConf.width = '50%';
    dialogConf.minWidth = '1200px';
    dialogConf.height = '500px';
    dialogConf.backdropClass = 'aura-dialog-backdrop';
    dialogConf.panelClass = 'aura-dialog-panel';
    let url = this.auraUrl + '?namespace=' + this.namespace + '&tags=_alert_id:' + this.alertId + '&type=1';
    if ( filters.status !== undefined ) {
        url += '&status=' + filters.status;
    }
    if ( filters.snoozed !== undefined ) {
        url += '&snoozed=1';
    }
    dialogConf.data = { src: url};
    if ( !this.auraDialog ) {
        this.auraDialog = this.dialog.open(AuraDialogComponent, dialogConf);
        this.auraDialog.afterClosed().subscribe(() => {
            this.auraDialog = undefined;
        } );
    }
}
}
