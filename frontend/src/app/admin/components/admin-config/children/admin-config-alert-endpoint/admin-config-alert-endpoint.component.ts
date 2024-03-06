import {
    Component,
    HostBinding,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-admin-config-alert-endpoint',
    templateUrl: './admin-config-alert-endpoint.component.html',
    styleUrls: ['./admin-config-alert-endpoint.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminConfigAlertEndpointComponent implements OnInit {
    @HostBinding('class') classAttribute =
    'app-admin-config-alert-endpoint';
    @HostBinding('class.edit-mode') private tplEdit = false;

    @Input() endpoint: UntypedFormGroup;
    @Input() index: number;

    _editMode = false;

    get editMode() {
        return this._editMode;
    }

    @Input() set editMode(mode: boolean) {
        this._editMode = mode;
        this.tplEdit = !this._editMode;
    }

    constructor() {}

    ngOnInit() {
        // console.log('ENDPOINT', this.endpoint.getRawValue());
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
