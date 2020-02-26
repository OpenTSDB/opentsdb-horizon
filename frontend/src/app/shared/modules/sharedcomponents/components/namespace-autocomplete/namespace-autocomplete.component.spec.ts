import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamespaceAutocompleteComponent } from './namespace-autocomplete.component';

describe('NamespaceAutocompleteComponent', () => {
  let component: NamespaceAutocompleteComponent;
  let fixture: ComponentFixture<NamespaceAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamespaceAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamespaceAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
