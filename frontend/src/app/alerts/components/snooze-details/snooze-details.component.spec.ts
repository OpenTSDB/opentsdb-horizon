import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnoozeDetailsComponent } from './snooze-details.component';

describe('SnoozeDetailsComponent', () => {
  let component: SnoozeDetailsComponent;
  let fixture: ComponentFixture<SnoozeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnoozeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnoozeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
