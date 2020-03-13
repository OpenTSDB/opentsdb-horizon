import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinPanelComponent } from './pin-panel.component';

describe('PinPanelComponent', () => {
  let component: PinPanelComponent;
  let fixture: ComponentFixture<PinPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
