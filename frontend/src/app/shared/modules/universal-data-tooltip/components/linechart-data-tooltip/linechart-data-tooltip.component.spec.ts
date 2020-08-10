import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinechartDataTooltipComponent } from './linechart-data-tooltip.component';

describe('LinechartDataTooltipComponent', () => {
  let component: LinechartDataTooltipComponent;
  let fixture: ComponentFixture<LinechartDataTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinechartDataTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinechartDataTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
