import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsContentComponent } from './search-results-content.component';

describe('SearchResultsContentComponent', () => {
  let component: SearchResultsContentComponent;
  let fixture: ComponentFixture<SearchResultsContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultsContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
