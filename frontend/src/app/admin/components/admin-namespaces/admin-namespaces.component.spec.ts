import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ADMIN_TESTING_IMPORTS
} from '../../admin-testing.utils';

import { AdminNamespacesComponent } from './admin-namespaces.component';

describe('AdminNamespacesComponent', () => {
    let component: AdminNamespacesComponent;
    let fixture: ComponentFixture<AdminNamespacesComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: ADMIN_TESTING_IMPORTS,
            declarations: [AdminNamespacesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminNamespacesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
