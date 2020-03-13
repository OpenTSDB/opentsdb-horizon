import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DboardContentComponent } from './dboard-content.component';

describe('DboardContentComponent', () => {
  let component: DboardContentComponent;
  let fixture: ComponentFixture<DboardContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DboardContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DboardContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
