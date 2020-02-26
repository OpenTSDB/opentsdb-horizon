import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricFunctionComponent } from './metric-function.component';

describe('MetricFunctionComponent', () => {
  let component: MetricFunctionComponent;
  let fixture: ComponentFixture<MetricFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricFunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
