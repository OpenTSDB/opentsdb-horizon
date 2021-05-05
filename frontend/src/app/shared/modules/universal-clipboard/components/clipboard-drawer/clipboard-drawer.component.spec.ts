import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardDrawerComponent } from './clipboard-drawer.component';

describe('ClipboardDrawerComponent', () => {
  let component: ClipboardDrawerComponent;
  let fixture: ComponentFixture<ClipboardDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipboardDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipboardDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
