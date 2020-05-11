import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamespacePageContentComponent } from './namespace-page-content.component';

describe('NamespacePageContentComponent', () => {
  let component: NamespacePageContentComponent;
  let fixture: ComponentFixture<NamespacePageContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamespacePageContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamespacePageContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
