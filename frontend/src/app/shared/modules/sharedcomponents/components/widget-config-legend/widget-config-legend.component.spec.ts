import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetConfigLegendComponent } from './widget-config-legend.component';

describe('WidgetConfigLegendComponent', () => {
  let component: WidgetConfigLegendComponent;
  let fixture: ComponentFixture<WidgetConfigLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetConfigLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetConfigLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
