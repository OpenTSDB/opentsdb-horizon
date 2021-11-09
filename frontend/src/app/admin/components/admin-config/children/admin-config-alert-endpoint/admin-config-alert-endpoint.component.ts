import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-admin-config-alert-endpoint',
    templateUrl: './admin-config-alert-endpoint.component.html',
    styleUrls: ['./admin-config-alert-endpoint.component.scss']
})
export class AdminConfigAlertEndpointComponent implements OnInit {

    @HostBinding('class') classAttribute: string = 'app-admin-config-alert-endpoint';
    @HostBinding('class.edit-mode') private tplEdit: boolean = false;

    @Input() endpoint: FormGroup;
    @Input() index: number;

    _editMode: boolean = false;

    get editMode() { return this._editMode; }

    @Input() set editMode(mode: boolean) {
        this._editMode = mode;
        this.tplEdit = !this._editMode;
    };

    constructor() { }

    ngOnInit() {
        //console.log('ENDPOINT', this.endpoint.getRawValue());
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    apply() {
        // do something
        this.toggleEditMode();
    }

    cancel() {
        // do something... maybe revert?
        this.toggleEditMode();
    }

}
