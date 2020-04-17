import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarDashboardDownsampleComponent } from './navbar-dashboard-downsample.component';

describe('NavbarDashboardDownsampleComponent', () => {
  let component: NavbarDashboardDownsampleComponent;
  let fixture: ComponentFixture<NavbarDashboardDownsampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarDashboardDownsampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarDashboardDownsampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
