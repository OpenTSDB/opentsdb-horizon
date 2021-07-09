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
import { Component, OnInit, HostListener, HostBinding, ElementRef, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'metric-visual-panel',
  templateUrl: './metric-visual-panel.component.html'
})
export class MetricVisualPanelComponent implements OnInit {

  @HostBinding('class.metric-visual-panel') private _hostClass = true;

  @Input() query: any;
  @Input() data: any;
  @Input() type;
  @Output() visualOutput = new EventEmitter();

  visible = false;
  colorToggleVal = 'color';

  axis;
  mode;
  color;
  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.mode = this.data.visual.type || 'line';
    this.axis = this.data.visual.axis || 'y1';
  }

  setQueryVisual(id, key, value) {
    const visual = {};
    visual[key] = value;
    if ( key === 'color' || key === 'scheme') {
      // unset other option
      const key2 = key === 'color' ? 'scheme' : 'color';
      visual[key2] = '';
    }
    this.visualOutput.emit( { action: 'UpdateQueryVisual', payload: { qid : this.query.id, mid: id, visual: visual } });
  }

  setMetricVisual(id, key, value) {
      const visual = {};
      visual[key] = value;
      if ( key === 'color' || key === 'scheme' ) {
        const key2 = key === 'color' ? 'scheme' : 'color';
        visual[key2] = '';
      }
      this.visualOutput.emit( { action: 'UpdateQueryMetricVisual', payload: { qid: this.query.id, mid : id, visual: visual } });
  }

  setVisualType(id, type) {
    this.mode = type;
    this.setMetricVisual(id, 'type', type);
  }

  setLineType(id, type) {
      this.setMetricVisual(id, 'lineType', type);
  }

  setLineWeight(id, weight) {
      this.setMetricVisual(id, 'lineWeight', weight);
  }

  setColor(id, color, key = 'color') {
    this.color = key === 'scheme' ? color.scheme : color;
    this.setMetricVisual(id, key, key === 'scheme' ? color.scheme : color);
  }

  setAxis(id, axis) {
    this.axis = axis;
    this.setMetricVisual(id, 'axis', axis);
  }

  setStacking(id, stacked: boolean) {
    this.setMetricVisual(id, 'stacked', stacked);
  }

  setMissingData(id, isConnected) {
    this.setMetricVisual(id, 'connectMissingData', isConnected);
  }

  setStackOrderBy(id, orderBy) {
    this.setMetricVisual(id, 'stackOrderBy', orderBy);
  }

  setStackOrder(id, order) {
    this.setMetricVisual(id, 'stackOrder', order);
  }

  setUnit(id, unit) {
    this.setMetricVisual(id, 'unit', unit);
  }

  setVisualConditions(id, condition) {
    this.setMetricVisual(id, 'conditions', condition);
  }

  setQueryVisualType(qid, e) {
    this.setQueryVisual(qid, 'type', this.mode ? this.mode : this.data.visual.type);
  }

  setQueryVisualColor(qid, e) {
    const key = this.data.visual.color ? 'color' : 'scheme';
    this.setQueryVisual(qid, key, this.color ? this.color : this.data.visual[key]);
  }

  setQueryVisualAxis(qid, e) {
    this.setQueryVisual(qid, 'axis', this.axis ? this.axis : this.data.visual.axis);
  }

  closePanel() {
    this.visualOutput.emit( { action: 'ClosePanel' });
  }

  @HostListener('click', ['$event'])
  hostClickHandler(e) {
    console.log("metric visual panel");
      // e.stopPropagation();
  }

  @HostListener('document:click', ['$event.target'])
  documentClickHandler(target) {
      if (!this.elRef.nativeElement.contains(target) && this.visible) {
          this.visible = false;
      } else if (!this.visible) {
          this.visible = true;
      }
  }

}
