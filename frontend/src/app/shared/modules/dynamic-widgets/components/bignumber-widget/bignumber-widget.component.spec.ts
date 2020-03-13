import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BignumberWidgetComponent } from './bignumber-widget.component';

describe('BignumberWidgetComponent', () => {
  let component: BignumberWidgetComponent;
  let fixture: ComponentFixture<BignumberWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BignumberWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BignumberWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
