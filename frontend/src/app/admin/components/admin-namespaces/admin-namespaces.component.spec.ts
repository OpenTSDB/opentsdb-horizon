import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNamespacesComponent } from './admin-namespaces.component';

describe('AdminNamespacesComponent', () => {
  let component: AdminNamespacesComponent;
  let fixture: ComponentFixture<AdminNamespacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminNamespacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminNamespacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
