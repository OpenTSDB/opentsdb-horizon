import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ADMIN_TESTING_IMPORTS
} from '../../../../admin-testing.utils';

import { FormGroup, FormControl } from '@angular/forms';

import { AdminConfigHelpLinkComponent } from './admin-config-help-link.component';

describe('AdminConfigHelpLinkComponent', () => {
    let component: AdminConfigHelpLinkComponent;
    let fixture: ComponentFixture<AdminConfigHelpLinkComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AdminConfigHelpLinkComponent],
            imports: ADMIN_TESTING_IMPORTS
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminConfigHelpLinkComponent);
        component = fixture.componentInstance;

        // inputs
        const fg = new FormGroup({
            icon: new FormControl('icon'),
            label: new FormControl('help link'),
            href: new FormControl('helpUrl')
        });

        component.link = fg;
        component.index = 0;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
