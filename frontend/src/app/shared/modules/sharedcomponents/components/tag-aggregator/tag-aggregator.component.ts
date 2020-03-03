import { Component, OnInit, Input, Output, EventEmitter, forwardRef, HostBinding } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'tag-aggregator',
    templateUrl: './tag-aggregator.component.html',
    styleUrls: [],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TagAggregatorComponent),
        multi: true,
    }]
})
export class TagAggregatorComponent implements OnInit {

    @HostBinding('class.tag-aggregator-component') private _hostClass = true;

    @Input() value;
    @Input() exclude = [];

    @Output()
    change = new EventEmitter<string>();

    aggregatorOptions: Array<any> = [
        {
            value: 'avg',
            icon: 'avg'
        },
        {
            value: 'min',
            icon: 'min'
        },
        {
            value: 'max',
            icon: 'max'
        },
        {
            value: 'sum',
            icon: 'sum'
        },
        {
            value: 'count',
            icon: 'count'
        }
    ];

    aggregatorControl: FormControl;
    defaultAggregator = 'sum';
    selectedIndex = -1;

    subscription: Subscription;

    constructor() { }

    ngOnInit() {
        if (!this.value) {
            this.value = this.defaultAggregator;
        }
        if (this.exclude.length) {
            this.aggregatorOptions = this.aggregatorOptions.filter(item => this.exclude.indexOf(item.value) === -1);
        }
        this.setSelectedIndex();
    }

    selectOption(value) {
        this.value = value;
        this.setSelectedIndex();
        this.change.emit(this.value);
    }

    setSelectedIndex() {
        this.selectedIndex = this.aggregatorOptions.findIndex(item => item.value === this.value);
    }
}
