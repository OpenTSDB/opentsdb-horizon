import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleRecentsListComponent } from './simple-recents-list.component';

describe('SimpleRecentsListComponent', () => {
  let component: SimpleRecentsListComponent;
  let fixture: ComponentFixture<SimpleRecentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleRecentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleRecentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
