import {
    Component,
    OnInit,
    OnChanges,
    SimpleChanges,
    Input,
    Output,
    EventEmitter,
    HostBinding,
    ViewChild,
    ElementRef
} from '@angular/core';
import { HttpService } from '../../../../../core/http/http.service';
import { MatMenuTrigger, MatMenu } from '@angular/material';
import { UtilsService } from '../../../../../core/services/utils.service';
import { FormControl } from '@angular/forms';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dropdown-metric-tags',
    templateUrl: './dropdown-metric-tags.component.html',
    styleUrls: []
})
export class DropdownMetricTagsComponent implements OnInit, OnChanges {

    @HostBinding('class.dropdown-metric-tags') private _hostClass = true;

    @ViewChild(MatMenuTrigger) private trigger: MatMenuTrigger;
    @ViewChild(MatMenu, {read: ElementRef}) private optionsMenu: ElementRef;

    @Input() namespace: string;
    @Input() metric: any;
    @Input() selected: any[] = ['all'];
    @Input() tags: any = null;
    @Input() excludeTags: any = [];
    @Input() all = true;
    @Input() multiple = true;
    @Input() enableGroupBy: boolean;
    @Output() change: EventEmitter<any> = new EventEmitter();

    tagOptions: any[] = [];

    filteredTagOptions: any[] = [];
    filterTagInputFC: FormControl = new FormControl('');

    get filterTagInput(): string {
      return this.filterTagInputFC.value;
    }

    constructor(
        private httpService: HttpService,
        private utils: UtilsService
    ) { }

    ngOnInit() {
        // tslint:disable-next-line:arrow-return-shorthand
        this.tagOptions = this.selected ? this.selected.map(d => { return { name: d }; }) : [];

        if (this.enableGroupBy === null || this.enableGroupBy === undefined) {
            this.enableGroupBy = true;
        }

        this.filterTagInputFC.valueChanges.subscribe((value: any) => {
            // this.filteredTagOptions = this.tagOptions.filter((item: any) => item.name.toLowerCase().includes(value.toLowerCase()));
            this.filteredTagOptions = this.tagOptions.map((item: any) => {
                item.filtered = !item.name.toLowerCase().includes(value.toLowerCase());
                return item;
            });
        });
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.selected && change.selected.currentValue) {
            this.selected = [...change.selected.currentValue]; // dropdown selection reflects when new reference is created
        }
    }

    loadTags(load) {
        const query: any = { namespace: this.namespace, metrics: Array.isArray(this.metric) ? this.metric : [this.metric] , filters: [] };
        query.search = '';
        if ( this.tags ) {
            this.tagOptions = this.tags.length ? this.tags.map(d=>  { return { name: d } } ) : [];
            this.filteredTagOptions = this.tagOptions;
            this.triggerMenu();
        } else if (load ) {
            if ( !this.namespace || !this.metric ) {
                this.tagOptions = [];
                this.filteredTagOptions = this.tagOptions;
                this.triggerMenu();
                return;
            }
            this.httpService.getNamespaceTagKeys(query).subscribe(res => {
                res = res.filter( ( d ) => !this.excludeTags.includes( d.name ) );
                this.tagOptions = res;
                this.filteredTagOptions = this.tagOptions;
                this.triggerMenu();
            },
            err => {
                this.tagOptions = [];
                this.filteredTagOptions = this.tagOptions;
                this.triggerMenu();
            });
        }
    }

    triggerMenu() {
        const self = this;
        setTimeout(function() {
            if ( self.multiple ) {
                self.trigger.openMenu();
            }
        }, 100);
    }

    // maybe get rid of this now?
    setTags(e) {
        let values = e.value;
        if ( ! values.length ) {
            values = [];
        // } else if ( this.selected && this.selected.indexOf('all') !== -1 && values.length > 1 ) {
        } else if (values.length > 1 && values.indexOf('all')) {
            const allIndex = values.findIndex(d => d === 'all');
            if (allIndex !== -1) {
                values.splice(allIndex, 1);
            }
        }
        this.change.emit(values);
    }

    onTagSelection(event, selected) {
        let value;
        if ( !this.multiple ) {
            value = event.value ? [event.value] : [];
        } else if (event.option.value === 'all' && event.option.selected) {
            value = [];
        } else if (this.filterTagInput) { // been searching
            value = this.selected ? [...this.selected] : [];
            for (const s of selected.map(d => d.value)) {
                if (s !== 'all' && !value.includes(s)) {
                    value.push(s);
                }
            }
        } else {
            value = selected.map(d => d.value);

            // remove 'all' tag if in array
            if (value.length > 1) {
                const allIndex = value.findIndex(d => d === 'all');
                if (allIndex !== -1) {
                    value.splice(allIndex, 1);
                }
            }
        }
        this.change.emit(value);
    }

    tagSelectionPanelClosed(event) {
        this.clearFilterTagInput();
    }

    optionIsSelected(val: string) {
        if (this.selected && this.selected.length) {
            if (val !== 'all' && this.selected.indexOf(val) >= 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return val === 'all';
        }
    }

    clearFilterTagInput() {
      this.filterTagInputFC.setValue('');
    }

    /* Events from MatMenuTrigger */

    private findLongestTagOptionInArray(array: any[]) {
        if (array.length === 0) {
            return '';
        }
        const longest = array.reduce(function(a, b) {
            return (a.name.length > b.name.length) ? a : b;
        });
        return longest;
    }

    private calculateOptionsMenuWidth() {
        const longestOption = this.findLongestTagOptionInArray(this.tagOptions);
        let renderedWidth: number = this.utils.calculateTextWidth(<string>longestOption.name, '20', 'Ubuntu');
        return (renderedWidth > 280) ? renderedWidth : 280;
    }

    optionsMenuOpened(e: any) {
        const menuWidth: any = this.calculateOptionsMenuWidth();
        const matPanel: HTMLElement = document.querySelector('.tag-options-cdk-menu');
        matPanel.style.maxWidth = (parseInt(menuWidth)) + 'px';
    }
}
