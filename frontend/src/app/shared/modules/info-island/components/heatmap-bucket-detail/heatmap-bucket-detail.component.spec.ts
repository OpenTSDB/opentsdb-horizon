import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapBucketDetailComponent } from './heatmap-bucket-detail.component';

describe('HeatmapBucketDetailComponent', () => {
  let component: HeatmapBucketDetailComponent;
  let fixture: ComponentFixture<HeatmapBucketDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatmapBucketDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapBucketDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
