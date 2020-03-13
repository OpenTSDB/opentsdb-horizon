import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphTypeComponent } from './graph-type.component';

describe('GraphTypeComponent', () => {
  let component: GraphTypeComponent;
  let fixture: ComponentFixture<GraphTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
