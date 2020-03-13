import { Component, OnInit, Inject, HostBinding, Output, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from '@angular/material';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dashboard-to-alert-dialog',
  templateUrl: './dashboard-to-alert-dialog.component.html',
  styleUrls: []
})
export class DashboardToAlertDialogComponent implements OnInit {
  @HostBinding('class.dashboard-to-alert-dialog') private _hostClass = true;
  @ViewChild('nsList') nsList: MatSelectionList;

  constructor(public dialogRef: MatDialogRef<DashboardToAlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
                if (data.namespaces) {
                  this.namespaces = data.namespaces;
                }
              }

  namespaces: string[] = [];

  ngOnInit() {
    this.nsList.deselectAll();
   }

  nsSelected(ns) {
    this.dialogRef.close( {namespace : ns} );
  }

  canceled() {
    this.dialogRef.close( {canceled : true } );
  }

}
