import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricAutocompleteComponent } from './metric-autocomplete.component';

describe('MetricAutocompleteComponent', () => {
  let component: MetricAutocompleteComponent;
  let fixture: ComponentFixture<MetricAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
