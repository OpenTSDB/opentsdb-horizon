import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryEditorProtoComponent } from './query-editor-proto.component';

describe('QueryEditorProtoComponent', () => {
  let component: QueryEditorProtoComponent;
  let fixture: ComponentFixture<QueryEditorProtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryEditorProtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryEditorProtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
