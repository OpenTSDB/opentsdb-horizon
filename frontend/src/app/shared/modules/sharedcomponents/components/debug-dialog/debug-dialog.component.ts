import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-debug-dialog',
  templateUrl: './debug-dialog.component.html',
  styleUrls: ['./debug-dialog.component.scss'],
})
export class DebugDialogComponent implements OnInit {
    log: any;

    constructor(
        public dialogRef: MatDialogRef<DebugDialogComponent>,
        private domSanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public dialogData: any
    ) { 
      
      this.log = '<table>';
      var i = 0;
      dialogData.log.forEach(element => {
          if (i++ % 2 == 0) {
            this.log += '<tr bgcolor="#f6f5fa"><td>';
          } else {
            this.log += '<tr><td>';
          }
          this.log += element.replace(/\n/g, '<br>');
          this.log += '</td></tr>';
      });
      this.log += '</table>';
      this.log = domSanitizer.bypassSecurityTrustHtml(this.log);
    }

    ngOnInit() {
    }

}
