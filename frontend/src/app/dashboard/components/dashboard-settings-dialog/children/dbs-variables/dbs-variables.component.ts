import {
    Component,
    OnInit,
    OnDestroy,
    HostBinding,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dbs-variables',
    templateUrl: './dbs-variables.component.html',
    styleUrls: []
})
export class DbsVariablesComponent implements OnInit, OnDestroy {

    @HostBinding('class.dbs-variables-component') private _hostClass = true;
    @HostBinding('class.dbs-settings-tab') private _tabClass = true;

    /** Inputs */
    @Input() dbData: any = {};

    /** Outputs */
    @Output() dataModified: any = new EventEmitter();

    /** Local Variables */
    varForm: FormGroup;
    varFormSub: Subscription;

    selectedKeys: string[] = [];

    constructor(
        private fb: FormBuilder
    ) { }

    ngOnInit() {

        this.varForm = this.fb.group({
            enabled: new FormControl(this.dbData.variables.enabled),
            tplVariables: this.fb.array([])
        });

        this.varFormSub = this.varForm.valueChanges.subscribe(val => {
            // console.log('%cVARIABLES FORM [CHANGES]', 'background-color: skyblue; padding: 2px 4px;', val);
            // need to remove unused variables (ones without keys)
            const pending = val;
            const pendingKeys = [];
            pending.tplVariables = val.tplVariables.filter(item => {
                const keyCheck = item.tagk.trim();
                if (keyCheck.length > 0) {
                    pendingKeys.push(keyCheck);
                    return true;
                } else {
                    return false;
                }
            });

            this.selectedKeys = pendingKeys;

            this.dataModified.emit({
                type: 'variables',
                data: pending
            });
        });

        this.initializeTplVariables(this.dbData.variables.tplVariables);

        //console.log('%cVAR FORM', 'background-color: skyblue; padding: 2px 4px', this.varForm);
    }

    ngOnDestroy() {
        this.varFormSub.unsubscribe();
    }

    // form control accessors (come after form has been setup)
    get enabled() { return this.varForm.get('enabled'); }
    get tplVariables() { return this.varForm.get('tplVariables'); }

    initializeTplVariables(values: any) {

        if (values.length === 0) {
            // add an empty one if there are no values
            this.addTemplateVariable();
        } else {
            this.selectedKeys = [];
            for (const item of values) {
                this.selectedKeys.push(item.tagk);
                this.addTemplateVariable(item);
            }
        }
    }

    addTemplateVariable(data?: any) {

        // TODO: need to detect if filter contains '*' to change type to wildcard

        data = (data) ? data : {};

        const varData = {
            tagk: (data.tagk) ? data.tagk : '',
            alias: (data.alias) ? data.alias : '',
            allowedValues: (data.allowedValues) ? this.fb.array(data.allowedValues) : this.fb.array([]),
            filter: (data.filter) ? this.fb.array(data.filter) : this.fb.array([]),
            enabled: (data.enabled) ? data.enabled : true,
            type: (data.type) ? data.type : 'literalor'
        };

        const control = <FormArray>this.varForm.controls['tplVariables'];
        control.push(this.fb.group(varData));
    }

    removeTemplateVariable(i: number) {
        const control = <FormArray>this.varForm.controls['tplVariables'];
        control.removeAt(i);
    }

    masterToggleChange(event: any) {
        // set value to form and force to notify up
        this.enabled.setValue(event.checked, { emitEvent: true });
    }
}
