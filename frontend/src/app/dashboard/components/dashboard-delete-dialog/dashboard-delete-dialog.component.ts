import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


@Component({
  selector: 'app-dashboard-delete-dialog',
  templateUrl: './dashboard-delete-dialog.component.html',
  styleUrls: ['./dashboard-delete-dialog.component.scss']
})
export class DashboardDeleteDialogComponent implements OnInit {
    @HostBinding('class.dashboard-delete-dialog') private _hostClass = true;

    constructor(
        public dialogRef: MatDialogRef<DashboardDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any ) { }

    ngOnInit() {
    }

    confirm() {
        this.dialogRef.close( {delete : true } );
    }

}
