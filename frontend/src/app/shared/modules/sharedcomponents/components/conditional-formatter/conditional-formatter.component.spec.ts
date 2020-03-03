import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalFormatterComponent } from './conditional-formatter.component';

describe('ConditionalFormatterComponent', () => {
  let component: ConditionalFormatterComponent;
  let fixture: ComponentFixture<ConditionalFormatterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConditionalFormatterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionalFormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
