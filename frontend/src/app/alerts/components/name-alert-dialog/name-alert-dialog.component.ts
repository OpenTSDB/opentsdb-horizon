import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    HostBinding,
    ViewChild
} from '@angular/core';

import { FormControl, Validators } from '@angular/forms';

import {
    MatDialogRef
} from '@angular/material';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'name-alert-dialog',
    templateUrl: './name-alert-dialog.component.html',
    styleUrls: []
})
export class NameAlertDialogComponent implements OnInit {

    @HostBinding('class.name-alert-dialog-component') private _hostClass = true;

    alertName = new FormControl('', Validators.required);

    constructor(
        public dialogRef: MatDialogRef<NameAlertDialogComponent>
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
    }

    getErrorMessage() {
        if (this.alertName.hasError('required')) {
            return 'You must enter an alert name';
        }
        return '';
    }

    saveAlertName() {
        if (!this.alertName.invalid) {
            this.dialogRef.close({ alertName: this.alertName.value });
        }
    }

}
