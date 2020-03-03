import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutchartLegendComponent } from './donutchart-legend.component';

describe('DonutchartLegendComponent', () => {
  let component: DonutchartLegendComponent;
  let fixture: ComponentFixture<DonutchartLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DonutchartLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonutchartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
