import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'graph-type',
  templateUrl: './graph-type.component.html'
})
export class GraphTypeComponent implements OnInit {
  @HostBinding('class.graph-type') private _hostClass = true;

  @Input() selected = 'LinechartWidgetComponent';
  @Output() change = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  changeWidgetType(value) {
    this.change.emit(value);
  }

}
