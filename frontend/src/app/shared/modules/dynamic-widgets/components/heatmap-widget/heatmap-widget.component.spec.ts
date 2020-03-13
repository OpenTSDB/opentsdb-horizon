import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapWidgetComponent } from './heatmap-widget.component';

describe('HeatmapWidgetComponent', () => {
  let component: HeatmapWidgetComponent;
  let fixture: ComponentFixture<HeatmapWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatmapWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
