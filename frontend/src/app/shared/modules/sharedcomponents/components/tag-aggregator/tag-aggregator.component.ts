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
            icon: 'avg',
            help: {
                label: 'Avg Aggregator',
                description: `<p>Calculates the average of all values across the downsampling bucket or across multiple time series.
                This function will perform linear interpolation across time series. It’s useful for looking at gauge metrics.</p>

                <p><strong>Note:</strong> Even though the calculation will usually result in a floating point value, if the data
                points are recorded as integers, an integer will be returned losing some precision.</p>`
            }
        },
        {
            value: 'min',
            icon: 'min',
            help: {
                label: 'Min  Aggregator',
                description: `<p>Returns only the smallest data point from all of the time series or within the time span.
                This function will perform linear interpolation across time series. It’s useful for looking at the lower bounds of gauge metrics.</p>`
            }
        },
        {
            value: 'max',
            icon: 'max',
            help: {
                label: 'Max Aggregator',
                description: `<p>The inverse of <code>min</code>, it returns the largest data point from all of the time series or within a time span.
                This function will perform linear interpolation across time series. It’s useful for looking at the upper bounds of gauge metrics.</p>`
            }
        },
        {
            value: 'sum',
            icon: 'sum',
            help: {
                label: 'Sum Aggregator',
                description: `<p>Calculates the sum of all data points from all of the time series or within the time span if down sampling.
                This is the default aggregation function for the GUI as it’s often the most useful when combining multiple time series such
                as gauges or counters. It performs linear interpolation when data points fail to line up.</p>`
            }
        },
        {
            value: 'count',
            icon: 'count',
            help: {
                label: 'Count Aggregator',
                description: `<p>Returns the number of data points stored in the series or range. When used to aggregate multiple series,
                zeros will be substituted. When used with downsampling, it will reflect the number of data points in each downsample bucket.
                When used in a group-by aggregation, reflects the number of time series with values at a given time.</p>`
            }
        }
    ];

    aggregatorControl: FormControl;
    defaultAggregator = 'sum';
    selectedIndex = -1;

    selectedAggregatorHelpIndex = -1;

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

    setSelectedAggregatorHelpIndex(idx: number) {
        this.selectedAggregatorHelpIndex = idx;
    }
}
