import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailsCountComponent } from './alert-details-count.component';

describe('AlertDetailsCountComponent', () => {
  let component: AlertDetailsCountComponent;
  let fixture: ComponentFixture<AlertDetailsCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertDetailsCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDetailsCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
