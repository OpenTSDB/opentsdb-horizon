import {
    Component,
    HostBinding,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-admin-config-help-link',
    templateUrl: './admin-config-help-link.component.html',
    styleUrls: ['./admin-config-help-link.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminConfigHelpLinkComponent implements OnInit {
    @HostBinding('class') classAttribute = 'app-admin-config-help-link';
    @HostBinding('class.editing-mode') private get tplEdit() {
        return this.editMode;
    }
    @HostBinding('class.reading-mode') private get tplRead() {
        return !this.editMode;
    }

    @Input() link: UntypedFormGroup;
    @Input() index: number;

    _editMode = false;

    get editMode() {
        return this._editMode;
    }

    @Input() set editMode(mode: boolean) {
        this._editMode = mode;
    }

    constructor() {}

    ngOnInit() { /* do nothing */ }

    get helpLabel(): UntypedFormControl {
        return <UntypedFormControl>this.link.get('label');
    }
    get helpHref(): UntypedFormControl {
        return <UntypedFormControl>this.link.get('href');
    }
    get helpIcon(): UntypedFormControl {
        return <UntypedFormControl>this.link.get('icon');
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
    }

    editHelpLink() {
        const formGroup = <UntypedFormGroup>this.link;
        console.log('EDIT HELP LINK', this.index, formGroup.getRawValue());
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
