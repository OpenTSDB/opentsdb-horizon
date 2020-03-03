import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownMetricTagsComponent } from './dropdown-metric-tags.component';

describe('DropdownTagsComponent', () => {
  let component: DropdownMetricTagsComponent;
  let fixture: ComponentFixture<DropdownMetricTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownMetricTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownMetricTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
