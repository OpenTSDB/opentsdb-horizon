/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component, OnInit, HostBinding, ElementRef, HostListener,
    Input, Output, EventEmitter, ViewChild, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatChipInputEvent, MatMenuTrigger, MatInput } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Mode, RecipientType, Recipient } from './models';
import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
// tslint:disable-next-line:max-line-length
import { RecipientsState, GetRecipients, PostRecipient, DeleteRecipient, UpdateRecipient } from '../../../../state/recipients-management.state';
import { Observable, Subscription } from 'rxjs';
import { UtilsService } from '../../../../../core/services/utils.service';
import { AppConfigService } from '../../../../../core/services/config.service';

@Component({
    // tslint:disable:no-inferrable-types
    // tslint:disable:prefer-const
    // tslint:disable-next-line:component-selector
    selector: 'recipients-manager',
    templateUrl: './recipients-manager.component.html',
    styleUrls: []
})

export class AlertConfigurationContactsComponent implements OnInit, OnChanges, OnDestroy {
    @HostBinding('class.alert-configuration-contacts-component') private _hostClass = true;
    constructor(private eRef: ElementRef, private store: Store, private utils: UtilsService, private appConfig: AppConfigService ) { }

    @ViewChild('recipientMenuTrigger', { read: MatMenuTrigger }) private megaPanelTrigger: MatMenuTrigger;
    @ViewChild('recipientInput', { read: MatInput }) private recipientInput: MatInput;

    @Input() namespace: string;
    @Input() selectedAlertRecipients: any; // ex: {'slack' : [{'name': 'yamas_dev'}]}
    @Input() formHasError: true;
    @Output() updatedAlertRecipients = new EventEmitter<any>(); // ex: {'slack' : [{'name': 'yamas_dev'}]}

    megaPanelVisible: boolean = false;
    viewMode: Mode = Mode.all;
    recipientType: RecipientType;
    recipientsFormData: {}; // map<RecipientType, Recipient>;
    tempRecipient: Recipient; // for canceling
    originalName = ''; // for canceling
    alertRecipients: Array<any>; // [{name, type}]
    namespaceRecipients: any[] = [
        // {
        //   name: 'dev-team',
        //   type: RecipientType.opsgenie,
        //   apiKey: 'abcdefghijklmnopqrstuvwzyzzzzzzzzzzz',
        // },
    ];
    slackWebhookMaxLength = 200;
    opsGenieApiKeyMaxLength = 200;

    _mode = Mode; // for template
    _recipientType = RecipientType; // for template
    _clickedCreateMenu: number = 2; // needed for clicking out of menu (b/c of CDK)
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    // form control
    opsGenieName = new FormControl('');
    opsGenieApiKey = new FormControl('');
    slackName = new FormControl('');
    slackWebhook = new FormControl('');
    ocName = new FormControl('');
    ocDisplayCount = new FormControl('');
    ocContext = new FormControl('');
    ocProperty = new FormControl('');
    httpName = new FormControl('');
    httpEndpoint = new FormControl('');
    emailAddress = new FormControl('');

    // state control
    private nsRecipientSub: Subscription;
    private lastUpdatedRecipientSub: Subscription;
    @Select(RecipientsState.GetRecipients) _namespaceRecipients$: Observable<any>;
    @Select(RecipientsState.GetLastUpdated) _recipientLastUpdated$: Observable<any>;

    /** ACCESSORS */

    get anyErrors(): boolean {
        if (this.recipientType === RecipientType.opsgenie) {
            if (this.opsGenieName.errors || this.opsGenieApiKey.errors) {
                return true;
            }
        } else if (this.recipientType === RecipientType.slack) {
            if (this.slackName.errors || this.slackWebhook.errors) {
                return true;
            }
        } else if (this.recipientType === RecipientType.http) {
            if (this.httpName.errors || this.httpEndpoint.errors) {
                return true;
            }
        } else if (this.recipientType === RecipientType.oc) {
            if (this.ocName.errors || this.ocDisplayCount.errors || this.ocContext.errors || this.ocProperty.errors) {
                return true;
            }
        } else if (this.recipientType === RecipientType.email) {
            if (this.emailAddress.errors) {
                return true;
            }
        }
        return false;
    }

    get viewModePanelDescriptor(): string {
        switch (this.viewMode) {
            case this._mode.edit:
                return 'Edit Recipients';
            case this._mode.editRecipient:
                return 'Edit ' + this.typeToDisplayName(this.recipientType) + ' Recipient';
            case this._mode.createRecipient:
                return 'Create new ' + this.typeToDisplayName(this.recipientType) + ' Recipient';
            default:
                return 'Select Recipients';
        }
    }

    types = [];
    config: any = {};

    /** ANGULAR INTERFACE METHODS */

    ngOnInit() {
        this.config = this.appConfig.getConfig();
        this.types = Object.keys(RecipientType)
            .filter(t => this.config.alert.recipient[t])
            .filter(t => this.config.alert.recipient[t].enable);
        
        this.populateEmptyRecipients();
        if (!this.alertRecipients) {
            this.alertRecipients = [];
        }
        if (!this.namespace) {
            this.namespace = '';
        }

        this.nsRecipientSub = this._namespaceRecipients$.subscribe(data => {
            this.namespaceRecipients = [];
            const _data = JSON.parse(JSON.stringify(data));
            // tslint:disable-next-line:forin
            for (let type in _data.recipients) {
                let recipients = _data.recipients[type];
                if (recipients) {
                    // sort by name
                    recipients.sort((a: any, b: any) => {
                        return this.utils.sortAlphaNum(a.name, b.name);
                    });
                    for (let _recipient of recipients) {
                        _recipient.type = type.toLowerCase();
                        this.namespaceRecipients.push(_recipient);
                        if (_recipient.type === 'oc' && _recipient.context && _recipient.context !== 'live') {
                            _recipient.context = 'analysis';
                        }
                    }
                }
            }
            this.updateValidators();
        });

        this.lastUpdatedRecipientSub = this._recipientLastUpdated$.subscribe(data => {
            if (data && data.action) {
                if (data.action.toLowerCase() === 'delete') {
                    this.removeRecipientFromAlertRecipients(data.recipient.id);
                } else if (data.action.toLowerCase() === 'update' || data.action.toLowerCase() === 'add') {
                    this.modifyRecipientNameInAlertRecipients(data.recipient);
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.namespace && changes.namespace.currentValue) {
            this.store.dispatch(new GetRecipients(this.namespace));
        }

        if (changes['selectedAlertRecipients']) {
            this.alertRecipients = [];
            // tslint:disable-next-line:forin
            for (let type in this.selectedAlertRecipients) {
                let alertRecipients = this.selectedAlertRecipients[type];
                for (let recipient of alertRecipients) {
                    const o: any = { name: recipient.name, type: type };
                    if ( recipient.id !== undefined ) {
                        o.id = recipient.id;
                    }
                    if ( type === RecipientType.email ) {
                        o.email = recipient.name;
                    }
                    this.alertRecipients.push(o);
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.nsRecipientSub.unsubscribe();
        this.lastUpdatedRecipientSub.unsubscribe();
    }

    /** METHODS */

    showMegaPanel() {
        // this.megaPanelVisible = true;
        this.megaPanelTrigger.openMenu();
        this.recipientInput.focus();
    }

    collapseMegaPanel() {
        // this.megaPanelVisible = false;
        this.megaPanelTrigger.closeMenu();
    }

    /** EVENTS */
    changeRecipientTypeForCreating($event, type) {
        if (this._clickedCreateMenu > 0) {
            this._clickedCreateMenu--;
        }
        this.recipientType = type;
        this.setViewMode($event, Mode.createRecipient);
    }

    clickedCreate() {
        this._clickedCreateMenu = 2;
    }

    setViewMode($event: Event, mode: Mode) {
        if ($event) {
            $event.stopPropagation();
        }

        if (mode === Mode.createRecipient) {
            this.populateEmptyRecipients();
            // this.recipientType = RecipientType.opsgenie;
        }

        if (mode === Mode.editRecipient) {
            this.tempRecipient = { ...this.recipientsFormData[this.recipientType] };
        }
        this.updateValidators();

        // for hiding/showing of backdrop dimmer when in edit mode
        let backdropEl: any;
        if (mode !== Mode.all) {
            backdropEl = document.querySelector('.mega-panel-cdk-backdrop');
            if (backdropEl && !backdropEl.classList.contains('is-dim')) {
                backdropEl.classList.add('is-dim');
            }
        } else {
            backdropEl = document.querySelector('.mega-panel-cdk-backdrop');
            if (backdropEl && backdropEl.classList.contains('is-dim')) {
                backdropEl.classList.remove('is-dim');
            }
        }

        this.viewMode = mode;
    }

    editRecipientMode($event, recipient: any) {
        // tslint:disable-next-line:prefer-const
        this.recipientType = recipient.type;
        this.recipientsFormData[this.recipientType] = {...recipient};
        this.originalName = recipient.name;

        if (this.recipientType !== RecipientType.email) {
            this.setViewMode($event, Mode.editRecipient);
        }

        // manually update validators values
        this.opsGenieName.setValue(this.recipientsFormData[RecipientType.opsgenie].name);
        this.opsGenieApiKey.setValue(this.recipientsFormData[RecipientType.opsgenie].apikey);
        this.slackName.setValue(this.recipientsFormData[RecipientType.slack].name);
        this.slackWebhook.setValue(this.recipientsFormData[RecipientType.slack].webhook);
        this.ocName.setValue(this.recipientsFormData[RecipientType.oc].name);
        this.ocDisplayCount.setValue(this.recipientsFormData[RecipientType.oc].displaycount);
        this.ocContext.setValue(this.recipientsFormData[RecipientType.oc].context);
        this.ocProperty.setValue(this.recipientsFormData[RecipientType.oc].opsdbproperty);
        this.httpName.setValue(this.recipientsFormData[RecipientType.http].name);
        this.httpEndpoint.setValue(this.recipientsFormData[RecipientType.http].endpoint);
        this.emailAddress.setValue(this.recipientsFormData[RecipientType.email].name);
    }

    addUserInputToAlertRecipients($event: MatChipInputEvent) {
        const input = $event.input;
        const value = $event.value;

        if ((value || '').trim()) {
            this.addRecipientFromName(value);
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    saveCreatedRecipient($event) {
        let newRecipient = { ... this.recipientsFormData[this.recipientType] };
        newRecipient.namespace = this.namespace;
        if (this.recipientType === RecipientType.email) {
            newRecipient.email = newRecipient.name;
        }
        this.store.dispatch(new PostRecipient(newRecipient));
        this.setViewMode($event, Mode.all);
    }

    saveEditedRecipient($event) {
        // check if name has changed
        let updatedRecipient: any = {};
        updatedRecipient = { ... this.recipientsFormData[this.recipientType] };
        updatedRecipient.namespace = this.namespace;

        this.store.dispatch(new UpdateRecipient(updatedRecipient));
        this.setViewMode($event, Mode.all);
        this.emitAlertRecipients();
    }

    testRecipient($event) {
        // todo: send to server
    }

    deleteRecipient($event: Event, recipient: Recipient) {
        this.removeRecipient(recipient.id, recipient.type);
        this.setViewMode($event, Mode.edit);
    }

    cancelEdit($event: Event) {
        // reset to old contact
        for (let i = 0; i < this.alertRecipients.length; i++) {
            if (this.alertRecipients[i].id === this.recipientsFormData[this.recipientType].id) {
                this.alertRecipients[i] = { id: this.tempRecipient.id, name: this.tempRecipient.name, type: this.tempRecipient.type };
                break;
            }
        }
        this.updateValidators();
        this.setViewMode($event, Mode.edit);
    }

    // when contact menu is closed, need to reset some things
    contactMenuClosed($event: any) {
        if (this.viewMode !== Mode.all) {
            this.viewMode = Mode.all;
            if (this._clickedCreateMenu > 0) { // needed to exit out of menu
                this._clickedCreateMenu--;
            }
        }
    }

    /** METHODS */

    emitAlertRecipients() {
        let recipients: any = {};
        for (let alertRecipient of this.alertRecipients) {
            // [{name: blah, type: http}]
            let simplifiedAlertRecipient = {...alertRecipient};
            delete simplifiedAlertRecipient['type'];
            if (recipients[alertRecipient.type]) {
                recipients[alertRecipient.type].push(simplifiedAlertRecipient);
            } else {
                recipients[alertRecipient.type] = [simplifiedAlertRecipient];
            }
        }
        this.updatedAlertRecipients.emit(recipients);
    }

    addToNamespaceRecipients(recipient: Recipient) {
        this.namespaceRecipients.push(recipient);
    }

    addRecipientFromName(recipientName: string) {
        let recipient = this.getRecipientIfUniqueName(recipientName);

        if (recipient) {
          this.addRecipientToAlertRecipients(null, recipient.id, recipient.name, recipient.type);
        } else {
          if (this.isEmailValid(recipientName)) {
            this.recipientType = RecipientType.email;
            this.recipientsFormData[this.recipientType].name = recipientName;
            this.saveCreatedRecipient(null);
            // tslint:disable-next-line:max-line-length
            this.addRecipientToAlertRecipients(null, this.recipientsFormData[this.recipientType].id, this.recipientsFormData[this.recipientType].name, this.recipientType);
          }
        }
    }

    addRecipientToAlertRecipients($event: Event, id: number, name: string, type: RecipientType) {
        if ($event) {
            $event.stopPropagation();
        }
        if (!this.isAlertRecipient(name, type)) {
            const o: any = { name: name, type: type };
            if ( id ) {
                o.id = id;
            }
            if ( type === RecipientType.email ) {
                o.email = name;
            }
            this.alertRecipients.push(o);
            this.emitAlertRecipients();
        }
    }

    modifyRecipientNameInAlertRecipients(recipient) {
        for (let index = 0; index < this.alertRecipients.length; index++) {
          if (this.alertRecipients[index].id === recipient.id ) {
            this.alertRecipients[index].id = recipient.id;
            this.alertRecipients[index].name = recipient.name;
            this.emitAlertRecipients();
            break;
          }
        }
      }

    // OPERATIONS to get Recipient
    isAlertRecipient(name: string, type: RecipientType): boolean {
        for (let i = 0; i < this.alertRecipients.length; i++) {
            if (this.alertRecipients[i].name === name && this.alertRecipients[i].type === type) {
                return true;
            }
        }
        return false;
    }

    getRecipient(name: string, type: RecipientType): Recipient {
        for (let i = 0; i < this.namespaceRecipients.length; i++) {
            if (this.namespaceRecipients[i].name === name && this.namespaceRecipients[i].type === type) {
                return this.namespaceRecipients[i];
            }
        }
    }

    removeRecipient(id: number, type: RecipientType) {
        this.store.dispatch(new DeleteRecipient({ namespace: this.namespace, id: id, type: type }));
    }

    removeRecipientFromAlertRecipients(id: number) {
        for (let index = 0; index < this.alertRecipients.length; index++) {
            if (this.alertRecipients[index].id === id) {
                this.alertRecipients.splice(index, 1);
                this.emitAlertRecipients();
                break;
            }
        }
    }

    updateRecipient(recipient: Recipient, field: string, updatedValue: string) {
        this.recipientsFormData[this.recipientType][field] = updatedValue;
    }

    // Helpers
    typeToDisplayName(type: string) {
        if (type === RecipientType.opsgenie) {
            return 'OpsGenie';
        } else if (type === RecipientType.slack) {
            return 'Slack';
        } else if (type === RecipientType.http) {
            return 'Webhook';
        } else if (type === RecipientType.oc) {
            return 'OC';
        } else if (type === RecipientType.email) {
            return 'Email';
        }
        return '';
    }

    populateEmptyRecipients() {
        let emptyRecipients = {};
        let emptyOpsGenieRecipient = this.createDefaultRecipient(RecipientType.opsgenie);
        let emptySlackRecipient = this.createDefaultRecipient(RecipientType.slack);
        let emptyHTTPRecipient = this.createDefaultRecipient(RecipientType.http);
        let emptyOCRecipient = this.createDefaultRecipient(RecipientType.oc);
        let emptyEmailRecipient = this.createDefaultRecipient(RecipientType.email);

        // Set Defaults
        emptyOpsGenieRecipient.apikey = '';
        emptySlackRecipient.webhook = '';
        emptyHTTPRecipient.endpoint = '';
        emptyOCRecipient.displaycount = '1';
        emptyOCRecipient.context = 'analysis';
        emptyOCRecipient.opsdbproperty = '';
        emptyEmailRecipient.name = '';

        emptyRecipients[RecipientType.opsgenie] = emptyOpsGenieRecipient;
        emptyRecipients[RecipientType.slack] = emptySlackRecipient;
        emptyRecipients[RecipientType.http] = emptyHTTPRecipient;
        emptyRecipients[RecipientType.oc] = emptyOCRecipient;
        emptyRecipients[RecipientType.email] = emptyEmailRecipient;
        this.recipientsFormData = emptyRecipients;
    }

    createDefaultRecipient(type: RecipientType): Recipient {
        // tslint:disable-next-line:prefer-const
        let newRecipient: Recipient = {
            name: '',
            type: type,
        };
        return newRecipient;
    }

    createEmailRecipient(email: string): any {
        let recipient: any = {};
        recipient.name = email;
        recipient.type = RecipientType.email;

        this.addToNamespaceRecipients(recipient);
        return recipient;
    }

    isEmailValid(email: string): boolean {
        // tslint:disable-next-line:max-line-length
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    isSlackWebhookCorrectLength(webhook: string): boolean {
        return webhook && webhook.length > 0 && webhook.length <= this.slackWebhookMaxLength;
    }

    isOpsGenieApiKeyCorrectLength(apiKey: string): boolean {
        return apiKey && apiKey.length > 0 && apiKey.length <= this.opsGenieApiKeyMaxLength;
    }

    getRecipientItemsByType(type) {
        if (this.viewMode === Mode.all) {
            // all mode (show only unselected)
            return this.getAllRecipientsForType(type);
        } else {
            // edit mode (show all)
            return this.getAllRecipientsForType(type);
        }
    }

    getAllRecipientsForType(type: RecipientType) {
        return this.getRecipients(type, false);
    }

    getUnselectedRecipientsForType(type: RecipientType) {
        return this.getRecipients(type, true);
    }

    getRecipients(type: RecipientType, filterOutAlertRecipients): Recipient[] {
        // tslint:disable:prefer-const
        let recipients = [];
        for (let recipient of this.namespaceRecipients) {
            if (filterOutAlertRecipients && recipient.type === type && !this.isAlertRecipient(recipient.name, recipient.type)) {
                recipients.push(recipient);
            } else if (!filterOutAlertRecipients && recipient.type === type) {
                recipients.push(recipient);
            }
        }
        return recipients;
    }

    getRecipientIfUniqueName(recipientName: string) {
        let _recipient;
        let count = 0;

        for (let recipient of this.namespaceRecipients) {
            if (recipient.name === recipientName) {
                _recipient = recipient;
                count++;
            }
        }
        if (count === 1) {
            return _recipient;
        } else {
            return null;
        }
    }

    forbiddenNameValidator(recipients: Array<Recipient>, currentRecipient): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = false;
            // tslint:disable-next-line:prefer-const
            for (let recipient of recipients) {
                if (control.value.toLowerCase() === recipient.name.toLowerCase() && recipient.name !== currentRecipient.name) {
                    forbidden = true;
                }
            }
            if (control.value.toLowerCase().trim().length < 2) {
                forbidden = true;
            }
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    emailValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = !this.isEmailValid(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    slackWebookValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = !this.isSlackWebhookCorrectLength(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    opsGenieApiKeyValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = !this.isOpsGenieApiKeyCorrectLength(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    urlValidator() : ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let forbidden = !/^https:\/\/(www\.)?(([-a-zA-Z0-9@:%._[\]]{1,256}\.[a-zA-Z0-9()]{0,6}\b)|(\[?[a-fA-F0-9]*:[a-fA-F0-9:]+\]))([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    updateValidators() {
        // tslint:disable:max-line-length
        this.opsGenieName = new FormControl('', [this.forbiddenNameValidator(this.getAllRecipientsForType(RecipientType.opsgenie), this.recipientsFormData[this.recipientType])]);
        this.opsGenieApiKey = new FormControl('', [this.opsGenieApiKeyValidator()]);
        this.httpEndpoint = new FormControl('', [this.urlValidator()]);
        this.slackName = new FormControl('', [this.forbiddenNameValidator(this.getAllRecipientsForType(RecipientType.slack), this.recipientsFormData[this.recipientType])]);
        this.slackWebhook = new FormControl('', [this.slackWebookValidator()]);
        this.ocName = new FormControl('', [this.forbiddenNameValidator(this.getAllRecipientsForType(RecipientType.oc), this.recipientsFormData[this.recipientType])]);
        this.httpName = new FormControl('', [this.forbiddenNameValidator(this.getAllRecipientsForType(RecipientType.http), this.recipientsFormData[this.recipientType])]);
        this.emailAddress = new FormControl('', [this.forbiddenNameValidator(this.getAllRecipientsForType(RecipientType.email), this.recipientsFormData[this.recipientType]), this.emailValidator()]);
    }

    trimRecipientName(name) {
        return name.replace(/^\#/, '');
    }

    // NOTE: Not sure we need this any more
    // Listen if we should close panel
    @HostListener('document:click', ['$event'])
    clickOutsideComponent(event) {
        if (!this.eRef.nativeElement.contains(event.target) && !this._clickedCreateMenu) {
            this.collapseMegaPanel();
        }
        if (this._clickedCreateMenu > 0) { // needed to exit out of menu
            this._clickedCreateMenu--;
        }
    }
}
