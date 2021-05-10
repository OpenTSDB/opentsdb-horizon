import { COMMA, ENTER } from '@angular/cdk/keycodes';

import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    HostBinding,
    ViewChild,
    ElementRef
} from '@angular/core';

import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';

import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dbs-variable-item',
    templateUrl: './dbs-variable-item.component.html',
    styleUrls: []
})
export class DbsVariableItemComponent implements OnInit, OnDestroy {

    @HostBinding('class.template-variable-item') private _hostClass = true;
    @HostBinding('class.is-disabled') private _itemDisabled = false;

    @Input() formGroup: FormGroup;
    @Input() formGroupName: number;
    @Input() dbTagKeys: string[] = []; // all available tags from dashboard
    @Input() selectedKeys: string[] = []; // keys that have already been added. Comes from parent

    @Output() remove: any = new EventEmitter();

    /** Subscriptions */
    private enabledSub: Subscription; // value change subscription for enabled
    private listenSub: Subscription; // intercom subscription
    private allowedValuesInputSub: Subscription; // Allowed values input change subscription

    /** Local Variables */
    // tslint:disable-next-line:no-inferrable-types
    private expectingIntercomData: boolean = false;

    /** Autocomplete variables */
    filteredKeyOptions: Observable<string[]>; // options for key autosuggest
    filteredValueOptions: Observable<string[]>; // options for value autosuggest

    /** form variables */
    separatorKeysCodes: number[] = [ENTER, COMMA];

    allowedValuesInput: FormControl = new FormControl(); // form control for adding allowed value item

    @ViewChild('filterValueInput', {read: MatAutocompleteTrigger}) valueTrigger: MatAutocompleteTrigger; // value autocomplete trigger
    @ViewChild('filterValueInput') valueInput: ElementRef<HTMLInputElement>; // html element for allowedValuesInput.
    @ViewChild('filterValueAuto') valueAutocomplete: MatAutocomplete; // autocomplete component for allowed values

    constructor(
        private fb: FormBuilder,
        private interCom: IntercomService
    ) { }

    ngOnInit() {
        const keys = Object.keys(this.formGroup['controls']);

        // preset whether the item is disabled or not
        this._itemDisabled = !(this.formGroup.get('enabled').value);

        // listen for changes for enabled, and modify flag
        this.enabledSub = this.formGroup.get('enabled').valueChanges.subscribe(val => {
            this._itemDisabled = !val;
        });

        this.filteredKeyOptions = this.tagk.valueChanges
            .pipe(
                startWith(''),
                debounceTime(300),
                map(val => this.filterTagKeyOptions(val)) // filter autosuggest values for key options
            );

        /*this.filteredValueOptions = this.allowedValuesInput.valueChanges
            .pipe(
                startWith(''),
                debounceTime(300),
                map(val => this.filterTagValueOptions(val)) // autosuggest options shuld come from somewhere else. Currently fake data
            );*/

        // NOTE: come back to this and implement rxJS switchmap
        this.allowedValuesInputSub = this.allowedValuesInput.valueChanges
            .pipe(debounceTime(300))
            .subscribe(val => {
                this.expectingIntercomData = true;
                let inputVal = '.*';
                if (val.trim().length > 0) {
                    inputVal += val + '.*';
                }
                this.interCom.requestSend(<IMessage>{
                    action: 'getTagValues',
                    id: 'dbs-variable-item-' + this.formGroupName,
                    payload: {
                        tag : {
                            key: this.tagk.value.trim(),
                            value: inputVal
                        }
                    }
                });
            });

        // listen to intercom
        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {
            if (message.action === 'TagValueQueryResults' && this.expectingIntercomData) {
                this.expectingIntercomData = false;
                this.filteredValueOptions = message.payload.filter(val => {
                    return !this.allowedValues.value.includes(val.toLowerCase());
                });
            }
        });

    }

    /** Form Accessors */
    get tagk() { return this.formGroup.get('tagk'); }
    get alias() { return this.formGroup.get('alias'); }
    get enabled() { return this.formGroup.get('enabled'); }
    get allowedValues() { return this.formGroup.get('allowedValues'); }
    get filter() { return this.formGroup.get('filter'); }
    get type() { return this.formGroup.get('type'); }

    /** form helpers */
    get chipValues() { return this.allowedValues['controls']; }

    ngOnDestroy() {
        this.enabledSub.unsubscribe();
        this.listenSub.unsubscribe();
        this.allowedValuesInputSub.unsubscribe();
    }

    // removes the entire form group
    // needs to emit this up, in order to remove from master array
    removeItem() {
        this.remove.emit(this.formGroupName);
    }

    // remove a filter value option
    removeValue(i: number) {
        const control = <FormArray>this.allowedValues;
        control.removeAt(i);
    }

    // add a filter value option
    addValue(event: any) {
        if (!this.valueAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            // Add our value
            if ((value || '').trim()) {
              this.createAllowedValue(value.trim());
            }

            // Reset the input value
            if (input) {
              input.value = '';
            }

            // clear formControl input value
            this.allowedValuesInput.setValue('');
        }
    }

    /** Auto Complete Functions */

    // select suggested tag key
    selectFilterKeyOption(event: any) {
        this.tagk.setValue(event.option.value);
    }

    // select suggested tag value
    selectFilterValueOption(event: any) {
        this.createAllowedValue(event.option.value);
        this.allowedValuesInput.setValue('');

        // force autocomplete open
        const self = this;
        setTimeout(function () {
            self.onValueInputFocus();
        }, 1);

    }

    // open autocomplete on input focus
    onValueInputFocus() {
        this.valueTrigger._onChange('');
        this.valueTrigger.openPanel();
    }

    /** private functions */

    private createAllowedValue(val: string) {
        const control = <FormArray>this.allowedValues;
        control.push(new FormControl(val));
    }

    private filterTagKeyOptions(val: string) {
        // return available tag keys
        // filter out the ones already selected
        return this.dbTagKeys.filter(option => {
            option = option.toLowerCase();
            return option.includes(val.toLowerCase()) && !this.selectedKeys.includes(option);
        });
    }

}
