import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MaterialModule } from '../../../../../shared/modules/material/material.module';

import { FormControl } from '@angular/forms';

import { AdminConfigMetricHostComponent } from './admin-config-metric-host.component';

describe('AdminConfigMetricHostComponent', () => {
    let component: AdminConfigMetricHostComponent;
    let fixture: ComponentFixture<AdminConfigMetricHostComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule
            ],
            declarations: [AdminConfigMetricHostComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminConfigMetricHostComponent);
        component = fixture.componentInstance;

        // component inputs
        component.host = new FormControl<string>('');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
