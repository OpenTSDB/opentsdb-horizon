import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownUnitTypeComponent } from './dropdown-unit-type.component';

describe('DropdownUnitTypeComponent', () => {
  let component: DropdownUnitTypeComponent;
  let fixture: ComponentFixture<DropdownUnitTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownUnitTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownUnitTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
