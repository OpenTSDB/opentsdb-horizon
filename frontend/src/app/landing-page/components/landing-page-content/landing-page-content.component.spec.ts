import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageContentComponent } from './landing-page-content.component';

describe('LandingPageContentComponent', () => {
  let component: LandingPageContentComponent;
  let fixture: ComponentFixture<LandingPageContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPageContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
