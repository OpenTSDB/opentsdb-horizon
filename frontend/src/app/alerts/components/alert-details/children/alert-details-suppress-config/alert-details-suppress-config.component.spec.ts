import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailsSuppressConfigComponent } from './alert-details-suppress-config.component';

describe('AlertDetailsSuppressConfigComponent', () => {
  let component: AlertDetailsSuppressConfigComponent;
  let fixture: ComponentFixture<AlertDetailsSuppressConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertDetailsSuppressConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDetailsSuppressConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
