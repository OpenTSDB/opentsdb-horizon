import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopnDataTooltipComponent } from './topn-data-tooltip.component';

describe('TopnDataTooltipComponent', () => {
  let component: TopnDataTooltipComponent;
  let fixture: ComponentFixture<TopnDataTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopnDataTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopnDataTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
