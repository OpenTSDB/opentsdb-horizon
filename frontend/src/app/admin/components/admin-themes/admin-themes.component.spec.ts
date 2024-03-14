import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ADMIN_TESTING_IMPORTS
} from '../../admin-testing.utils';

import { AdminThemesComponent } from './admin-themes.component';

describe('AdminThemesComponent', () => {
    let component: AdminThemesComponent;
    let fixture: ComponentFixture<AdminThemesComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AdminThemesComponent],
            imports: ADMIN_TESTING_IMPORTS
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminThemesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
