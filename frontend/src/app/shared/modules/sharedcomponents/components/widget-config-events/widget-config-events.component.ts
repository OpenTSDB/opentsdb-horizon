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
import { UtilsService } from '../../../../../core/services/utils.service';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'widget-config-events',
    templateUrl: './widget-config-events.component.html',
    styleUrls: ['./widget-config-events.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WidgetConfigEventsComponent implements OnInit {
    @HostBinding('class.widget-config-events') private _hostClass = true;

    constructor(private util: UtilsService) {}

    /** Inputs */
    @Input() widget: any;
    @Input() allowEventToggling: boolean;

    /** Outputs */
    @Output() widgetChange = new EventEmitter();

    seachControl: FormControl = new FormControl('');

    ngOnInit() {
        if (this.allowEventToggling === undefined) {
            this.allowEventToggling = true;
        }

        this.widget = this.util.setDefaultEventsConfig(this.widget, false);

        if (
            !this.widget.eventQueries[0].namespace &&
            this.widget.queries &&
            this.widget.queries[0] &&
            this.widget.queries[0].namespace
        ) {
            this.widget.eventQueries[0].namespace =
                this.widget.queries[0].namespace;
        }

        if (this.widget.settings.visual.showEvents === undefined) {
            this.widget.settings.visual.showEvents = false;
        }

        this.seachControl = new FormControl(this.widget.eventQueries[0].search);
        this.seachControl.valueChanges
            .pipe(debounceTime(300))
            .subscribe((search) => {
                search = search.trim();
                if (search !== this.widget.eventQueries[0].search) {
                    this.widgetChange.emit({
                        action: 'SetEventQuerySearch',
                        payload: { search: search },
                    });
                }
            });
    }

    showEventsChanged(events: boolean) {
        this.widgetChange.emit({
            action: 'SetShowEvents',
            payload: { showEvents: events },
        });
    }

    saveNamespace(namespace: string) {
        if (namespace) {
            this.widgetChange.emit({
                action: 'SetEventQueryNamespace',
                payload: { namespace: namespace },
            });
        }
    }

    cancelSaveNamespace(event) {
        // do something?
    }
}
