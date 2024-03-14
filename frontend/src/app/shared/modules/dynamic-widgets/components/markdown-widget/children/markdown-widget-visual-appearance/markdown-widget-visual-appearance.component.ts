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
import {
    Component,
    OnInit,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
} from '@angular/core';
// import { IntercomService } from '../../../../../../core/services/intercom.service';
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'markdown-widget-visual-appearance',
    templateUrl: './markdown-widget-visual-appearance.component.html',
    styleUrls: ['./markdown-widget-visual-appearance.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownWidgetVisualAppearanceComponent implements OnInit {
    @HostBinding('class.markdown-visual-appearance-widget') private _hostClass =
    true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter();
    @Output() selectionChanged = new EventEmitter();

    constructor() {}

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
        this.widgetChange.emit({
            action: 'SetVisualization',
            payload: { gIndex: 0, data: this.widget.settings.visual },
        });
    }

    textColorChanged(color: any) {
        this.widget.settings.visual['textColor'] = color;
        this.widgetChange.emit({
            action: 'SetVisualization',
            payload: { gIndex: 0, data: this.widget.settings.visual },
        });
    }

    fontFamilyChanged(monospace: boolean) {
        if (monospace) {
            this.widget.settings.visual['font'] = 'monospace';
        } else {
            this.widget.settings.visual['font'] = 'default';
        }
        this.widgetChange.emit({
            action: 'SetVisualization',
            payload: { gIndex: 0, data: this.widget.settings.visual },
        });
    }
}
