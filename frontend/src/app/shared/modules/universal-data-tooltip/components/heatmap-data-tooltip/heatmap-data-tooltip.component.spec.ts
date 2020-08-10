import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapDataTooltipComponent } from './heatmap-data-tooltip.component';

describe('HeatmapDataTooltipComponent', () => {
  let component: HeatmapDataTooltipComponent;
  let fixture: ComponentFixture<HeatmapDataTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatmapDataTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapDataTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
