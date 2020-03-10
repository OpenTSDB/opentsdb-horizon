import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dashboard-to-alert-dialog',
  templateUrl: './dashboard-to-alert-dialog.component.html',
  styleUrls: []
})
export class DashboardToAlertDialogComponent implements OnInit {
  @HostBinding('class.dashboard-to-alert-dialog') private _hostClass = true;

  constructor(public dialogRef: MatDialogRef<DashboardToAlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
                console.log(data);
              }

  ngOnInit() { }

}
