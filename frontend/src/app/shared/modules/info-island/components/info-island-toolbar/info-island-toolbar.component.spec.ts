import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIslandToolbarComponent } from './info-island-toolbar.component';

describe('InfoIslandToolbarComponent', () => {
  let component: InfoIslandToolbarComponent;
  let fixture: ComponentFixture<InfoIslandToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoIslandToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoIslandToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
