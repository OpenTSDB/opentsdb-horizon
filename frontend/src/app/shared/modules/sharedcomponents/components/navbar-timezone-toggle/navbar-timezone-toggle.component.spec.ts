import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarTimezoneToggleComponent } from './navbar-timezone-toggle.component';

describe('NavbarTimezoneToggleComponent', () => {
  let component: NavbarTimezoneToggleComponent;
  let fixture: ComponentFixture<NavbarTimezoneToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarTimezoneToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarTimezoneToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
