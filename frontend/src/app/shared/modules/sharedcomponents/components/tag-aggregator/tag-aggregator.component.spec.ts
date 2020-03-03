import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagAggregatorComponent } from './tag-aggregator.component';

describe('TagAggregatorComponent', () => {
  let component: TagAggregatorComponent;
  let fixture: ComponentFixture<TagAggregatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagAggregatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagAggregatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
