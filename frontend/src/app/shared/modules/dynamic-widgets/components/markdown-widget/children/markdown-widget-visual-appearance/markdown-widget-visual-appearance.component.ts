import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
// import { IntercomService } from '../../../../../../core/services/intercom.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-widget-visual-appearance',
  templateUrl: './markdown-widget-visual-appearance.component.html',
  styleUrls: []
})
export class MarkdownWidgetVisualAppearanceComponent implements OnInit {
  @HostBinding('class.markdown-visual-appearance-widget') private _hostClass = true;

  /** Inputs */
  @Input() widget: any;

  /** Outputs */
  @Output() widgetChange = new EventEmitter;
  @Output() selectionChanged = new EventEmitter;

  constructor() { }

  colorType: string;

  ngOnInit() {
    this.colorType = 'text'; // default color tab
  }

    // Color Picker
    selectedColorType(value: string) {
      this.colorType = value;
  }

  backgroundColorChanged(color: any) {
    this.widget.settings.visual['backgroundColor'] = color;
    this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
  }

  textColorChanged(color: any) {
    this.widget.settings.visual['textColor'] = color;
    this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
  }

  fontFamilyChanged(monospace: boolean) {

    if (monospace) {
      this.widget.settings.visual['font'] = 'monospace';
    } else {
      this.widget.settings.visual['font'] = 'default';
    }
    this.widgetChange.emit( {'action': 'SetVisualization', payload: { gIndex: 0, data: this.widget.settings.visual }});
  }
}
