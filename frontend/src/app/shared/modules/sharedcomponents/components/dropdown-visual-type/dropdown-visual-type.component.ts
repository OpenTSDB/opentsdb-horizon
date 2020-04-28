import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dropdown-visual-type',
  templateUrl: './dropdown-visual-type.component.html',
  styleUrls: []
})
export class DropdownVisualTypeComponent {
    @HostBinding('class.dropdown-visual-type') private _hostClass = true;

    @Input() value = 'line';

    @Output()
    valueChange = new EventEmitter<string>();

    visualTypeOptions: Array<any> = [
        {
            label: 'Line',
            value: 'line',
            icon: 'd-chart-line'
        },
        {
            label: 'Bar',
            value: 'bar',
            icon: 'd-chart-bar-vertical'
        },
        {
            label: 'Area',
            value: 'area',
            icon: 'd-chart-area-solid'
        }
    ];

    changeVisualType(type) {
        this.valueChange.emit(type);
    }
}
