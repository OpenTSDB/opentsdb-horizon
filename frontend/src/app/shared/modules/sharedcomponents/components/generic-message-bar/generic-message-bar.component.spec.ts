import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericMessageBarComponent } from './generic-message-bar.component';

describe('GenericMessageBarComponent', () => {
  let component: GenericMessageBarComponent;
  let fixture: ComponentFixture<GenericMessageBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericMessageBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericMessageBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
