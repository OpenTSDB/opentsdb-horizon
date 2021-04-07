import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarClipboardMenuComponent } from './navbar-clipboard-menu.component';

describe('NavbarClipboardMenuComponent', () => {
  let component: NavbarClipboardMenuComponent;
  let fixture: ComponentFixture<NavbarClipboardMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarClipboardMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarClipboardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
