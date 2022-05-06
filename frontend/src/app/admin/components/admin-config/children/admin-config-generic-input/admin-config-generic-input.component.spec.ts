import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigGenericInputComponent } from './admin-config-generic-input.component';

describe('AdminConfigGenericInputComponent', () => {
  let component: AdminConfigGenericInputComponent;
  let fixture: ComponentFixture<AdminConfigGenericInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminConfigGenericInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConfigGenericInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
