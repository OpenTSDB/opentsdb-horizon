import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutWidgetComponent } from './donut-widget.component';

describe('DonutWidgetComponent', () => {
  let component: DonutWidgetComponent;
  let fixture: ComponentFixture<DonutWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DonutWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonutWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
