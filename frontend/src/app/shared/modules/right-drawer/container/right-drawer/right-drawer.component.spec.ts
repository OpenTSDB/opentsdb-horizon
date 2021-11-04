import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightDrawerComponent } from './right-drawer.component';

describe('RightDrawerComponent', () => {
  let component: RightDrawerComponent;
  let fixture: ComponentFixture<RightDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
