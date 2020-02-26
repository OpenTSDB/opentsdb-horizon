import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbsVariablesComponent } from './dbs-variables.component';

describe('DbsVariablesComponent', () => {
  let component: DbsVariablesComponent;
  let fixture: ComponentFixture<DbsVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbsVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbsVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
