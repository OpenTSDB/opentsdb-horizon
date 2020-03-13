import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIslandComponent } from './info-island.component';

describe('InfoIslandComponent', () => {
  let component: InfoIslandComponent;
  let fixture: ComponentFixture<InfoIslandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoIslandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoIslandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
