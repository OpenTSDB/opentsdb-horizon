import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigatorSidenavComponent } from './navigator-sidenav.component';

describe('NavigatorSidenavComponent', () => {
  let component: NavigatorSidenavComponent;
  let fixture: ComponentFixture<NavigatorSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigatorSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigatorSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
