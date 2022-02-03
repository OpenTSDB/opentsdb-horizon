/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component, OnInit, Output, EventEmitter, Input, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'graph-type',
  templateUrl: './graph-type.component.html',
  styleUrls: ['./graph-type.component.scss'],
  encapsulation: ViewEncapsulation.None
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
