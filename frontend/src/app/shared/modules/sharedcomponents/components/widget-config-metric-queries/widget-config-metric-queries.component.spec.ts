import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigMetricQueriesComponent } from './widget-config-metric-queries.component';

describe('WidgetConfigMetricQueriesComponent', () => {
  let component: WidgetConfigMetricQueriesComponent;
  let fixture: ComponentFixture<WidgetConfigMetricQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigMetricQueriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigMetricQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
