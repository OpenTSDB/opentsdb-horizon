import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSettingsToggleComponent } from './dashboard-settings-toggle.component';

describe('DashboardSettingsToggleComponent', () => {
  let component: DashboardSettingsToggleComponent;
  let fixture: ComponentFixture<DashboardSettingsToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSettingsToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSettingsToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
