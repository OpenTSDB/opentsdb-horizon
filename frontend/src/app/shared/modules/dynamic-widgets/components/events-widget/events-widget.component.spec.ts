import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsWidgetComponent } from './events-widget.component';

describe('EventsWidgetComponent', () => {
  let component: EventsWidgetComponent;
  let fixture: ComponentFixture<EventsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
