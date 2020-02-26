import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugDialogComponent } from './debug-dialog.component';

describe('DebugDialogComponent', () => {
  let component: DebugDialogComponent;
  let fixture: ComponentFixture<DebugDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
