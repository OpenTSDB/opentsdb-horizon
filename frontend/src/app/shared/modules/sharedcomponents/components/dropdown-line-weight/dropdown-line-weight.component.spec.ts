import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownLineWeightComponent } from './dropdown-line-weight.component';

describe('DropdownLineWeightComponent', () => {
  let component: DropdownLineWeightComponent;
  let fixture: ComponentFixture<DropdownLineWeightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownLineWeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownLineWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
