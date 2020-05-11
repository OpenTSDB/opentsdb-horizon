import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPageContentComponent } from './user-page-content.component';

describe('UserPageContentComponent', () => {
  let component: UserPageContentComponent;
  let fixture: ComponentFixture<UserPageContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPageContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPageContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
