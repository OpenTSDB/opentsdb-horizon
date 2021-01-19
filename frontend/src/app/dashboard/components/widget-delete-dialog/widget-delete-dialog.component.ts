import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-widget-delete-dialog',
  templateUrl: './widget-delete-dialog.component.html',
  styleUrls: ['./widget-delete-dialog.component.scss']
})
export class WidgetDeleteDialogComponent implements OnInit {

    @HostBinding('class.widget-delete-dialog') private _hostClass = true;

    constructor(
        public dialogRef: MatDialogRef<WidgetDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dbData: any
    ) { }

    ngOnInit() {
        console.log('****** DELETE DIALOG ******', this.dbData);
    }

    confirm() {
        this.dialogRef.close( {delete : true } );
    }

}
