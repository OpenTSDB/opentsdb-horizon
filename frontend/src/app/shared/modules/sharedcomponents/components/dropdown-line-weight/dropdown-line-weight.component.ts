import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-line-weight',
  templateUrl: './dropdown-line-weight.component.html',
  styleUrls: []
})

export class DropdownLineWeightComponent {
    @HostBinding('class.dropdown-line-weight') private _hostClass = true;

    @Input() value;

    @Output()
    change = new EventEmitter<string>();

    lineWeightOptions: Array<any> = [
        {
            label: '0.5px',
            value: '0.5px'
        },
        {
            label: '1px',
            value: '1px'
        },
        {
            label: '2px',
            value: '2px'
        },
        {
            label: '3px',
            value: '3px'
        },
        {
            label: '4px',
            value: '4px'
        },
        {
            label: '5px',
            value: '5px'
        },
        {
            label: '6px',
            value: '6px'
        }
    ];

    changeLineWeight(weight) {
        this.change.emit(weight);
    }
}
