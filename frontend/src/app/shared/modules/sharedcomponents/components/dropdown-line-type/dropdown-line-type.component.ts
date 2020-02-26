import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-line-type',
  templateUrl: './dropdown-line-type.component.html',
  styleUrls: []
})
export class DropdownLineTypeComponent {
    @HostBinding('class.dropdown-line-type') private _hostClass = true;

    @Input() value = 'solid';

    @Output()
    change = new EventEmitter<string>();

    lineTypeOptions: Array<object> = [
        {
            label: 'Solid',
            value: 'solid'
        },
        {
            label: 'Dotted',
            value: 'dotted'
        },
        {
            label: 'Dashed',
            value: 'dashed'
        },
        {
            label: 'Dot-Dashed',
            value: 'dot-dashed'
        }
    ];

    defaultLineType = 'solid';

    constructor() { }

    changeLineType(type) {
        this.change.emit(type);
    }
}
