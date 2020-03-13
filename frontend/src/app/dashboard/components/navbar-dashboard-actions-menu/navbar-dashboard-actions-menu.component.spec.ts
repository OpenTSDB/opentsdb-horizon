import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarDashboardActionsMenuComponent } from './navbar-dashboard-actions-menu.component';

describe('NavbarDashboardActionsMenuComponent', () => {
  let component: NavbarDashboardActionsMenuComponent;
  let fixture: ComponentFixture<NavbarDashboardActionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarDashboardActionsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarDashboardActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
