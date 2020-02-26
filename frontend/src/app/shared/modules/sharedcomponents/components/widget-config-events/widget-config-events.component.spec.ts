import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigEventsComponent } from './widget-config-events.component';

describe('WidgetConfigEventsComponent', () => {
  let component: WidgetConfigEventsComponent;
  let fixture: ComponentFixture<WidgetConfigEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
