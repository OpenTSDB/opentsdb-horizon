import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigMetricHostComponent } from './admin-config-metric-host.component';

describe('AdminConfigMetricHostComponent', () => {
  let component: AdminConfigMetricHostComponent;
  let fixture: ComponentFixture<AdminConfigMetricHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminConfigMetricHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigMetricHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
