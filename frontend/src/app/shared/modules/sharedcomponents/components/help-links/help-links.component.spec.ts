import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpLinksComponent } from './help-links.component';

describe('HelpLinksComponent', () => {
  let component: HelpLinksComponent;
  let fixture: ComponentFixture<HelpLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
