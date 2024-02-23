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
    OnDestroy,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface ConditionalFormatterOptionData {
    label: string;
    value: string;
}
@Component({
    selector: 'conditional-formatter',
    templateUrl: './conditional-formatter.component.html',
    styleUrls: ['./conditional-formatter.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConditionalFormatterComponent implements OnInit, OnDestroy {
    @HostBinding('class.conditional-formatter') private _hostClass = true;
    @Input() conditions: any = [];
    @Input() type: any = '';
    @Output() conditionChange = new EventEmitter();

    operators: Array<ConditionalFormatterOptionData> = [
        {
            label: '>',
            value: 'gt',
        },
        {
            label: '>=',
            value: 'ge',
        },
        {
            label: '<',
            value: 'lt',
        },
        {
            label: '<=',
            value: 'le',
        },
    ];

    conditionChanges$: BehaviorSubject<boolean>;
    conditionChangeSub: Subscription;
    constructor() {}

    ngOnInit() {
        if (!this.conditions || !this.conditions.length) {
            this.conditions = [];
            this.addCondition();
        }
        this.conditionChanges$ = new BehaviorSubject(false);

        this.conditionChangeSub = this.conditionChanges$.subscribe(
            (trigger) => {
                if (trigger) {
                    this.conditionChange.emit(this.conditions);
                }
            },
        );
    }

    setOperator(e, index): void {
        this.conditions[index].operator = e.value;
        this.conditionChanges$.next(true);
    }
    selectColor(color, index): void {
        this.conditions[index].color = color;
        this.conditionChanges$.next(true);
    }

    setValue(e, index): void {
        this.conditions[index].value = e.srcElement.value.length
            ? Number(e.srcElement.value)
            : '';
        this.conditionChanges$.next(true);
    }

    addCondition(): void {
        this.conditions.push({ operator: 'gt', value: '', color: '#da001b' });
    }

    removeCondition(index): void {
        this.conditions.splice(index, 1);
        this.conditionChanges$.next(true);
    }
    ngOnDestroy() {
        this.conditionChangeSub.unsubscribe();
    }
}
