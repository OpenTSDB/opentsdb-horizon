import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbfsComponent } from './dbfs.component';

describe('DbfsComponent', () => {
  let component: DbfsComponent;
  let fixture: ComponentFixture<DbfsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbfsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
