import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListContentComponent } from './users-list-content.component';

describe('UsersListContentComponent', () => {
  let component: UsersListContentComponent;
  let fixture: ComponentFixture<UsersListContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersListContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
