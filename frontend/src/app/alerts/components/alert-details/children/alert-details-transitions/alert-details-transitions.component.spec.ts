import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailsTransitionsComponent } from './alert-details-transitions.component';

describe('AlertDetailsTransitionsComponent', () => {
  let component: AlertDetailsTransitionsComponent;
  let fixture: ComponentFixture<AlertDetailsTransitionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertDetailsTransitionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDetailsTransitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
