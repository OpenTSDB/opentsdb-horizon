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
    this.color = key === 'scheme' ? color.scheme : color.hex;
    this.setMetricVisual(id, key, key === 'scheme' ? color.scheme : color.hex);
  }

  setAxis(id, axis) {
    this.axis = axis;
    this.setMetricVisual(id, 'axis', axis);
  }

  setStacking(id, stacked: boolean) {
    this.setMetricVisual(id, 'stacked', stacked);
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
    this.setQueryVisual(qid, 'color', this.color ? this.color : this.data.visual.color);
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
