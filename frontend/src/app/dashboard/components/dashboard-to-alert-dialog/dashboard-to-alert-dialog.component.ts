import { Component, OnInit, Inject, HostBinding, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dashboard-to-alert-dialog',
  templateUrl: './dashboard-to-alert-dialog.component.html',
  styleUrls: []
})
export class DashboardToAlertDialogComponent implements OnInit, AfterViewInit {
  @HostBinding('class.dashboard-to-alert-dialog') private _hostClass = true;


  constructor(private _focusMonitor: FocusMonitor, public dialogRef: MatDialogRef<DashboardToAlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
                if (data.namespaces) {
                  this.namespaces = data.namespaces;
                }
              }

  namespaces: string[] = [];

  ngOnInit() { }

   ngAfterViewInit() { // remove focus from first button
    this._focusMonitor.stopMonitoring(document.getElementById('ns0'));
}

  nsSelected(ns) {
    this.dialogRef.close( {namespace : ns} );
  }

  canceled() {
    this.dialogRef.close( {canceled : true } );
  }

}
