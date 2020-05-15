import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownJoinTypeComponent } from './dropdown-join-type.component';

describe('DropdownJoinTypeComponent', () => {
  let component: DropdownJoinTypeComponent;
  let fixture: ComponentFixture<DropdownJoinTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownJoinTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownJoinTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
