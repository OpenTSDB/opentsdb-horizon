import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigQueryInspectorComponent } from './widget-config-query-inspector.component';

describe('WidgetConfigQueryInspectorComponent', () => {
  let component: WidgetConfigQueryInspectorComponent;
  let fixture: ComponentFixture<WidgetConfigQueryInspectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigQueryInspectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigQueryInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
