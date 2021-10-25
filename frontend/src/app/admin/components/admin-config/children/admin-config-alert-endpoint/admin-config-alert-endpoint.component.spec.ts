import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigAlertEndpointComponent } from './admin-config-alert-endpoint.component';

describe('AdminConfigAlertEndpointComponent', () => {
  let component: AdminConfigAlertEndpointComponent;
  let fixture: ComponentFixture<AdminConfigAlertEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminConfigAlertEndpointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigAlertEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
