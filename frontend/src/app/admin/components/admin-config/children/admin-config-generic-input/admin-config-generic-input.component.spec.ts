import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { forwardRef, Provider } from '@angular/core';

import {
    ADMIN_TESTING_IMPORTS
} from '../../../../admin-testing.utils';

import {
    NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { FormGroup, FormControl } from '@angular/forms';

import { AdminConfigGenericInputComponent } from './admin-config-generic-input.component';

const GENERIC_INPUT_CONTROL_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AdminConfigGenericInputComponent),
    multi: true,
};

describe('AdminConfigGenericInputComponent', () => {
    let component: AdminConfigGenericInputComponent;
    let fixture: ComponentFixture<AdminConfigGenericInputComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: ADMIN_TESTING_IMPORTS,
            declarations: [AdminConfigGenericInputComponent],
            providers: [GENERIC_INPUT_CONTROL_VALUE_ACCESSOR]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminConfigGenericInputComponent);
        component = fixture.componentInstance;

        // inputs

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
