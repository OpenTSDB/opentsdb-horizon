import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
    ADMIN_TESTING_IMPORTS
} from '../../admin-testing.utils';

import { AdminUsersComponent } from './admin-users.component';

describe('AdminUsersComponent', () => {
    let component: AdminUsersComponent;
    let fixture: ComponentFixture<AdminUsersComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AdminUsersComponent],
            imports: ADMIN_TESTING_IMPORTS
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminUsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
