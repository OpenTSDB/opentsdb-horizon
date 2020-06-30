import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricVisualPanelComponent } from './metric-visual-panel.component';

describe('MetricVisualPanelComponent', () => {
  let component: MetricVisualPanelComponent;
  let fixture: ComponentFixture<MetricVisualPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricVisualPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricVisualPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
