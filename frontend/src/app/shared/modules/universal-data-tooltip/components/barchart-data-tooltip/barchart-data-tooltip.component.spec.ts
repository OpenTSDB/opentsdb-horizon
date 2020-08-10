import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarchartDataTooltipComponent } from './barchart-data-tooltip.component';

describe('BarchartDataTooltipComponent', () => {
  let component: BarchartDataTooltipComponent;
  let fixture: ComponentFixture<BarchartDataTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarchartDataTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarchartDataTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
