import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutDataTooltipComponent } from './donut-data-tooltip.component';

describe('DonutDataTooltipComponent', () => {
  let component: DonutDataTooltipComponent;
  let fixture: ComponentFixture<DonutDataTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DonutDataTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonutDataTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
