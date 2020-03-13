import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbsJsonComponent } from './dbs-json.component';

describe('DbsJsonComponent', () => {
  let component: DbsJsonComponent;
  let fixture: ComponentFixture<DbsJsonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbsJsonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbsJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
