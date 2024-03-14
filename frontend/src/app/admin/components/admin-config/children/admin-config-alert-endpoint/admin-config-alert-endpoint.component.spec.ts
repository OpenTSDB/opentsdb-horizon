import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ADMIN_TESTING_IMPORTS
} from '../../../../admin-testing.utils';

import { FormGroup, FormControl } from '@angular/forms';

import { AdminConfigAlertEndpointComponent } from './admin-config-alert-endpoint.component';
import { AdminConfigGenericInputComponent } from '../admin-config-generic-input/admin-config-generic-input.component';

describe('AdminConfigAlertEndpointComponent', () => {
    let component: AdminConfigAlertEndpointComponent;
    let fixture: ComponentFixture<AdminConfigAlertEndpointComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: ADMIN_TESTING_IMPORTS,
            declarations: [
                AdminConfigGenericInputComponent,
                AdminConfigAlertEndpointComponent
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminConfigAlertEndpointComponent);
        component = fixture.componentInstance;

        // inputs

        const fg = new FormGroup({
            enable: new FormControl(true),
            label: new FormControl('test endpoint'),
            onboardUrl: new FormControl('onboard'),
            guideUrl: new FormControl('guide')
        });

        component.endpoint = fg;
        component.index = 0;
        component.editMode = true;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
