import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesLegendComponent } from './timeseries-legend.component';

describe('TimeseriesLegendComponent', () => {
  let component: TimeseriesLegendComponent;
  let fixture: ComponentFixture<TimeseriesLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeseriesLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeseriesLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
