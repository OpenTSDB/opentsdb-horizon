import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownVisualTypeComponent } from './dropdown-visual-type.component';

describe('DropdownVisualTypeComponent', () => {
  let component: DropdownVisualTypeComponent;
  let fixture: ComponentFixture<DropdownVisualTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownVisualTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownVisualTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
