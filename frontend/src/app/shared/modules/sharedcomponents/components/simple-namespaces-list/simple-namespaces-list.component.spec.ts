import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNamespacesListComponent } from './simple-namespaces-list.component';

describe('SimpleNamespacesListComponent', () => {
  let component: SimpleNamespacesListComponent;
  let fixture: ComponentFixture<SimpleNamespacesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleNamespacesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleNamespacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
