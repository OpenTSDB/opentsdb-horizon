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

import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, FormsModule, NgForm } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { AppConfigService } from '../../../core/services/config.service';
import { Subscription } from 'rxjs';

const alertRecipientLabelMap: any = {
    email: 'Email',
    http: 'HTTP',
    oc: 'OC',
    slack: 'Slack',
    opsgenie: 'OpsGenie'
};

@Component({
    selector: 'app-admin-config',
    templateUrl: './admin-config.component.html',
    styleUrls: ['./admin-config.component.scss']
})
export class AdminConfigComponent implements OnInit, OnDestroy {

    @HostBinding('class') classAttribute: string = 'app-admin-section app-admin-config';

    // FORM STUFF
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    adminConfigForm: FormGroup;

    private configValues: any;

    private subscription: Subscription = new Subscription();

    constructor(
        private fb: FormBuilder,
        private appConfig: AppConfigService,
        private cdr: ChangeDetectorRef
    ) {
        this.configValues = this.appConfig.getConfig();
        console.log('CONFIG VALUES', this.configValues);
    }

    ngOnInit() {
        this.setupForm();
    }

    private setupForm() {

        this.adminConfigForm = <FormGroup>this.fb.group({});

        let application = this.fb.group({
            name: this.configValues.name || 'OpenTSDB',
            production: this.configValues.production || false,
            readonly: this.configValues.readonly || false,
            queryParams: this.configValues.queryParams || null,
            debugLevel: this.configValues.debugLevel || 'ERROR',
        });

        this.adminConfigForm.addControl('application', application);

        let uiBranding = this.fb.group({
            logo: this.fb.group({
                imageUrl: this.configValues.uiBranding.logo.imageUrl || '',
                homeUrl: this.configValues.uiBranding.logo.homeUrl || ''
            })
        });

        this.adminConfigForm.addControl('uiBranding', uiBranding);

        let endpoints = this.fb.group({
            tsdb_host: this.configValues.tsdb_host || '',
            tsdb_hosts: new FormArray([]),
            configdb: this.configValues.configdb || '',
            metaApi: this.configValues.metaApi || '',
            auraUI: this.configValues.auraUI || ''
        });

        let thostsControl = <FormArray>endpoints.get('tsdb_hosts');
        let thosts = this.configValues.tsdb_hosts || [];

        for (let i = 0; i < thosts.length; i++) {
            thostsControl.push(new FormControl(thosts[i]));
        }

        this.adminConfigForm.addControl('endpoints', endpoints);

        let alert = this.fb.group({
            alert_history_url: this.configValues.alert_history_url || '',
            recipient: this.fb.group({})
        });

        let recipients = Object.keys(this.configValues.alert.recipient);

        recipients = ['http', 'email'].concat(recipients);

        const recipientControl = <FormGroup>alert.get('recipient');

        for (let i = 0; i < recipients.length; i++) {
            let rKey = recipients[i];
            let rObj = this.configValues.alert.recipient[rKey];
            rObj.label = (alertRecipientLabelMap[rKey]) ? alertRecipientLabelMap[rKey] : rKey; // add label
            recipientControl.addControl(rKey, new FormControl(rObj));
        }

        this.adminConfigForm.addControl('alert', alert);

        let helpLinks = new FormArray([]);

        let configHelpLinks = this.configValues.helpLinks;

        for (let i = 0; i < configHelpLinks.length; i++) {
            helpLinks.push(this.fb.group(configHelpLinks[i]));
        }

        this.adminConfigForm.addControl('helpLinks', helpLinks);

        let modules = this.fb.group({});

        let moduleKeys = Object.keys(this.configValues.modules);

        for (let i = 0; i < moduleKeys.length; i++) {
            let mKey = moduleKeys[i];
            let module = this.configValues.modules[mKey];

            let moduleControl = this.fb.group({});

            let submoduleKeys = Object.keys(module);

            for (let j = 0; j < submoduleKeys.length; j++) {
                let smKey = submoduleKeys[j];
                let submodule = module[smKey];
                let submoduleControl = this.fb.group(submodule);
                moduleControl.addControl(smKey, submoduleControl);
            }

            modules.addControl(mKey, moduleControl);
        }

        this.adminConfigForm.addControl('modules', modules);

        let namespace = this.fb.group(this.configValues.namespace);

        this.adminConfigForm.addControl('namespace', namespace);

        let auth = this.fb.group(this.configValues.auth);

        this.adminConfigForm.addControl('auth', auth);

        console.log('%cFORM GROUP', 'color: white; background: purple; padding: 2px;', this.adminConfigForm.getRawValue());

        this.subscription.add(this.adminConfigForm.valueChanges.subscribe((changes: any) => {
            console.log('===>> CHANGES ::: ', changes);

            //this.cdr.detectChanges();
        }));
    }

    // quick form accessors
    get alert(): FormGroup { return <FormGroup>this.adminConfigForm.get('alert'); }
    get endpoints(): FormGroup { return <FormGroup>this.adminConfigForm.get('endpoints'); }
    get helpLinks(): FormArray { return <FormArray>this.adminConfigForm.get('helpLinks'); }
    get modules(): FormGroup { return <FormGroup>this.adminConfigForm.get('modules'); }

    // MODULE HELPERS
    getModuleKeys() {
        let modules = this.modules;
        let keys = Object.keys(modules.controls);
        return keys;
    }

    getModuleSections(moduleKey: string) {
        let modules = this.modules;
        let module = <FormGroup>modules.get(moduleKey);
        let sections = Object.keys(module.controls);
    }

    // TSDB METRIC HOSTS
    addTsdbMetricHost(hostData: any) {
        const control = <FormArray>this.endpoints.get('tsdb_hosts');
        control.push(hostData);
    }

    removeTsdbMetricHost(hostIndex: number) {
        const control = <FormArray>this.endpoints.get('tsdb_hosts');
        control.removeAt(hostIndex);
    }

    // HELP LINKS
    addHelpLink(linkData: any) {
        const control = <FormArray>this.helpLinks;
        control.push(new FormControl(linkData));
    }

    removeHelpLink(linkIndex: number) {
        const control = <FormArray>this.helpLinks;
        control.removeAt(linkIndex);
    }

    editHelpLink(linkIndex: number) {
        const control = <FormArray>this.helpLinks;
        const formGroup = <FormGroup>control.controls[linkIndex];
        console.log('EDIT HELP LINK', linkIndex, formGroup.getRawValue());
    }

    // ALERT RECIPIENT TYPES
    addAlertRecipient(recipientData: any) {
        const control = <FormGroup>this.alert.get('recipient');
        control.addControl(recipientData.label.toLowerCase(), new FormControl(recipientData));
    }

    removeAlertRecipient(recipientLabel: any) {
        const control = <FormGroup>this.alert.get('recipient');
        control.removeControl(recipientLabel);
    }

    get alertRecipientKeys(): any[] {

        let recipientControl: FormGroup = <FormGroup>this.alert.get('recipient');
        let keys = Object.keys(recipientControl['controls']);

        // make sure http and email are first
        let recipientKeys = ['http', 'email'];

        let httpIdx = keys.indexOf('http');
        if (httpIdx >= 0) {
            keys.slice(httpIdx, 1);
        }

        let emailIdx = keys.indexOf('email');
        if (emailIdx >= 0) {
            keys.slice(emailIdx, 1);
        }

        return recipientKeys.concat(keys);

    }


    // LAST
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
