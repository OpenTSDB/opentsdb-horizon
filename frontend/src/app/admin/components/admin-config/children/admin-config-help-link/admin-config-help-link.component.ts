import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-admin-config-help-link',
    templateUrl: './admin-config-help-link.component.html',
    styleUrls: ['./admin-config-help-link.component.scss']
})
export class AdminConfigHelpLinkComponent implements OnInit {
    @HostBinding('class') classAttribute: string = 'app-admin-config-help-link';
    @HostBinding('class.edit-mode') private tplEdit: boolean = false;

    @Input() link: FormGroup;
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

    get helpLabel(): FormControl { return <FormControl>this.link.get('label'); }
    get helpHref(): FormControl { return <FormControl>this.link.get('href'); }
    get helpIcon(): FormControl { return <FormControl>this.link.get('icon'); }

    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    editHelpLink() {
        const formGroup = <FormGroup>this.link;
        console.log('EDIT HELP LINK', this.index, formGroup.getRawValue());
    }

}
