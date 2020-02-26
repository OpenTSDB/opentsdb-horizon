import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSettingsDialogComponent } from './dashboard-settings-dialog.component';

describe('DashboardSettingsDialogComponent', () => {
  let component: DashboardSettingsDialogComponent;
  let fixture: ComponentFixture<DashboardSettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
