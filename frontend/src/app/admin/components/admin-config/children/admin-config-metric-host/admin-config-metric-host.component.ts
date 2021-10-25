import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-admin-config-metric-host',
    templateUrl: './admin-config-metric-host.component.html',
    styleUrls: ['./admin-config-metric-host.component.scss']
})
export class AdminConfigMetricHostComponent implements OnInit {

    @HostBinding('class') classAttribute: string = 'app-admin-config-metric-host';
    @HostBinding('class.edit-mode') private tplEdit: boolean = false;

    @Input() host: FormControl;
    @Input() index: number;

    _editMode: boolean = false;

    get editMode() { return this._editMode; }

    @Input() set editMode(mode: boolean) {
        this._editMode = mode;
        this.tplEdit = !this._editMode;
    };

    constructor() { }

    ngOnInit() {
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    removeMetricHost() {
        console.log('REMOVE');
    }

    apply() {
        console.log('APPLY');
        // do something
        this.toggleEditMode();
    }

    cancel() {
        console.log('CANCEL');
        // do something... maybe revert?
        this.toggleEditMode();
    }

}
