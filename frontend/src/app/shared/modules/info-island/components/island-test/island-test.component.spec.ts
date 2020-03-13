import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IslandTestComponent } from './island-test.component';

describe('IslandTestComponent', () => {
  let component: IslandTestComponent;
  let fixture: ComponentFixture<IslandTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IslandTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IslandTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
