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

import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    FormControl,
    Validators,
    FormsModule,
    NgForm,
} from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AppConfigService } from '../../../core/services/config.service';
import { Subscription } from 'rxjs';

const alertRecipientLabelMap: any = {
    email: 'Email',
    http: 'HTTP',
    oc: 'OC',
    slack: 'Slack',
    opsgenie: 'OpsGenie',
    pagerduty: 'PagerDuty',
};

@Component({
    selector: 'app-admin-config',
    templateUrl: './admin-config.component.html',
    styleUrls: ['./admin-config.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminConfigComponent implements OnInit, OnDestroy {
    @HostBinding('class') classAttribute =
    'app-admin-section app-admin-config';

    // FORM STUFF
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    adminConfigForm: FormGroup;

    private configValues: any;

    private subscription: Subscription = new Subscription();

    constructor(
        private fb: FormBuilder,
        private appConfig: AppConfigService,
        private cdr: ChangeDetectorRef,
    ) {
        this.configValues = this.appConfig.getConfig();
        // console.log('CONFIG VALUES', this.configValues);
    }

    ngOnInit() {
        this.setupForm();
    }

    private setupForm() {
        this.adminConfigForm = <FormGroup>this.fb.group({});

        const application = this.fb.group({
            name: this.configValues.name || 'OpenTSDB',
            production: this.configValues.production || false,
            readonly: this.configValues.readonly || false,
            queryParams: this.configValues.queryParams || null,
            debugLevel: this.configValues.debugLevel || 'ERROR',
        });

        this.adminConfigForm.addControl('application', application);

        const uiBranding = this.fb.group({
            logo: this.fb.group({
                imageUrl: this.configValues.uiBranding.logo.imageUrl || '',
                homeUrl: this.configValues.uiBranding.logo.homeUrl || '',
            }),
        });

        this.adminConfigForm.addControl('uiBranding', uiBranding);

        const endpoints = this.fb.group({
            tsdb_host: this.configValues.tsdb_host || '',
            tsdb_hosts: new FormArray([]),
            webUI: this.configValues.webUI || '',
            configdb: this.configValues.configdb || '',
            metaApi: this.configValues.metaApi || '',
            auraUI: this.configValues.auraUI || '',
        });

        const thostsControl = <FormArray>endpoints.get('tsdb_hosts');
        const thosts = this.configValues.tsdb_hosts || [];

        for (let i = 0; i < thosts.length; i++) {
            thostsControl.push(new FormControl(thosts[i]));
        }

        this.adminConfigForm.addControl('endpoints', endpoints);

        const alert = this.fb.group({
            alert_history_url: this.configValues.alert_history_url || '',
            recipient: this.fb.group({}),
        });

        let recipients = Object.keys(this.configValues.alert.recipient);

        recipients = ['http', 'email'].concat(recipients);

        const recipientControl = <FormGroup>alert.get('recipient');

        for (let i = 0; i < recipients.length; i++) {
            const rKey = recipients[i];
            const rObj = this.configValues.alert.recipient[rKey];
            rObj.label = alertRecipientLabelMap[rKey]
                ? alertRecipientLabelMap[rKey]
                : rKey; // add label
            recipientControl.addControl(rKey, this.fb.group(rObj));
        }

        this.adminConfigForm.addControl('alert', alert);

        const helpLinks = new FormArray([]);

        const configHelpLinks = this.configValues.helpLinks;

        for (let i = 0; i < configHelpLinks.length; i++) {
            helpLinks.push(this.fb.group(configHelpLinks[i]));
        }

        this.adminConfigForm.addControl('helpLinks', helpLinks);

        const modules = this.fb.group({});

        const moduleKeys = Object.keys(this.configValues.modules);

        for (let i = 0; i < moduleKeys.length; i++) {
            const mKey = moduleKeys[i];
            const module = this.configValues.modules[mKey];

            const moduleControl = this.fb.group({});

            const submoduleKeys = Object.keys(module);

            for (let j = 0; j < submoduleKeys.length; j++) {
                const smKey = submoduleKeys[j];
                const submodule = module[smKey];
                const submoduleControl = this.fb.group(submodule);
                moduleControl.addControl(smKey, submoduleControl);
            }

            modules.addControl(mKey, moduleControl);
        }

        this.adminConfigForm.addControl('modules', modules);

        const namespace = this.fb.group(this.configValues.namespace);

        this.adminConfigForm.addControl('namespace', namespace);

        const auth = this.fb.group(this.configValues.auth);

        this.adminConfigForm.addControl('auth', auth);

        // console.log('%cFORM GROUP', 'color: white; background: purple; padding: 2px;', this.adminConfigForm.getRawValue());

        // this.subscription.add(this.adminConfigForm.valueChanges.subscribe((changes: any) => {
        // console.log('===>> CHANGES ::: ', changes);
        // this.cdr.detectChanges();
        // }));
    }

    // quick form accessors
    get uiBranding(): FormGroup {
        return <FormGroup>this.adminConfigForm.get('uiBranding');
    }
    get auth(): FormGroup {
        return <FormGroup>this.adminConfigForm.get('auth');
    }
    get alert(): FormGroup {
        return <FormGroup>this.adminConfigForm.get('alert');
    }
    get endpoints(): FormGroup {
        return <FormGroup>this.adminConfigForm.get('endpoints');
    }
    get helpLinks(): FormArray {
        return <FormArray>this.adminConfigForm.get('helpLinks');
    }
    get modules(): FormGroup {
        return <FormGroup>this.adminConfigForm.get('modules');
    }

    // MODULE HELPERS
    getModuleKeys() {
        const modules = this.modules;
        const keys = Object.keys(modules.controls);
        return keys;
    }

    getModuleSections(moduleKey: string) {
        const modules = this.modules;
        const module = <FormGroup>modules.get(moduleKey);
        const sections = Object.keys(module.controls);
    }

    // TSDB METRIC HOSTS
    addTsdbMetricHost(hostData: any) {
        const control = <FormArray>this.endpoints.get('tsdb_hosts');
        control.push(new FormControl(hostData));
    }

    removeTsdbMetricHost(hostIndex: number) {
        const control = <FormArray>this.endpoints.get('tsdb_hosts');
        control.removeAt(hostIndex);
    }

    tsdbMetricHostListener(data: any) {
        switch (data.action) {
            case 'remove':
                this.removeTsdbMetricHost(data.index);
                break;
            default:
                break;
        }
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
        control.addControl(
            recipientData.label.toLowerCase(),
            new FormControl(recipientData),
        );
    }

    removeAlertRecipient(recipientLabel: any) {
        const control = <FormGroup>this.alert.get('recipient');
        control.removeControl(recipientLabel);
    }

    get alertRecipientKeys(): any[] {
        const recipientControl: FormGroup = <FormGroup>(
            this.alert.get('recipient')
        );
        const keys = Object.keys(recipientControl['controls']);

        // make sure http and email are first
        const recipientKeys = ['http', 'email'];

        const httpIdx = keys.indexOf('http');
        if (httpIdx >= 0) {
            keys.splice(httpIdx, 1);
        }

        const emailIdx = keys.indexOf('email');
        if (emailIdx >= 0) {
            keys.splice(emailIdx, 1);
        }

        return recipientKeys.concat(keys);
    }

    getAlertRecipientGroup(key: string): FormGroup {
        const recipientControl: FormGroup = <FormGroup>(
            this.alert.get('recipient')
        );
        const recipientGroup = <FormGroup>recipientControl['controls'][key];
        return recipientGroup;
    }

    // LAST
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
