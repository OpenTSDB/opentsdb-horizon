import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailsMetricPeriodOverPeriodComponent } from './alert-details-metric-period-over-period.component';

describe('AlertDetailsMetricPeriodOverPeriodComponent', () => {
  let component: AlertDetailsMetricPeriodOverPeriodComponent;
  let fixture: ComponentFixture<AlertDetailsMetricPeriodOverPeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertDetailsMetricPeriodOverPeriodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDetailsMetricPeriodOverPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
