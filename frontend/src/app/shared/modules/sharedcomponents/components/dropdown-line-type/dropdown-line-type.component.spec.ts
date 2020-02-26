import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownLineTypeComponent } from './dropdown-line-type.component';

describe('DropdownLineTypeComponent', () => {
  let component: DropdownLineTypeComponent;
  let fixture: ComponentFixture<DropdownLineTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownLineTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownLineTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
