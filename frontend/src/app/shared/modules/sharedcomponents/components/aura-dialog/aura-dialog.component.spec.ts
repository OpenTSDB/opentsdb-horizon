import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuraDialogComponent } from './aura-dialog.component';

describe('AuraDialogComponent', () => {
  let component: AuraDialogComponent;
  let fixture: ComponentFixture<AuraDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuraDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
