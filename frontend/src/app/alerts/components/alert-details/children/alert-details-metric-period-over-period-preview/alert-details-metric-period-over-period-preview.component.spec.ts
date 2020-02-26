import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailsMetricPeriodOverPeriodPreviewComponent } from './alert-details-metric-period-over-period-preview.component';

describe('AlertDetailsMetricPeriodOverPeriodPreviewComponent', () => {
  let component: AlertDetailsMetricPeriodOverPeriodPreviewComponent;
  let fixture: ComponentFixture<AlertDetailsMetricPeriodOverPeriodPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertDetailsMetricPeriodOverPeriodPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDetailsMetricPeriodOverPeriodPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
