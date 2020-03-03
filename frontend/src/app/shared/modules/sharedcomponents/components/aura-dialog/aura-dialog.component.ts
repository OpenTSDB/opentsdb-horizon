import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-aura-dialog',
  templateUrl: './aura-dialog.component.html'
})
export class AuraDialogComponent implements OnInit {
  @HostBinding('class.aura-dialog-component') private _hostclass = true;

  urlSafe: SafeResourceUrl;
  constructor(
    private domSanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<AuraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
  }

  ngOnInit() {
    this.urlSafe = this.domSanitizer.bypassSecurityTrustResourceUrl(this.dialogData.src);
  }

}
