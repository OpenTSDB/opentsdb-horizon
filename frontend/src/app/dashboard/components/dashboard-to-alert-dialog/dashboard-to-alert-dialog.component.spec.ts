import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardToAlertDialogComponent } from './dashboard-to-alert-dialog.component';

describe('DashboardToAlertDialogComponent', () => {
  let component: DashboardToAlertDialogComponent;
  let fixture: ComponentFixture<DashboardToAlertDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardToAlertDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardToAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
