import {
    Component,
    OnInit,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    Renderer,
    ViewChild,
    OnChanges,
    OnDestroy,
    SimpleChanges, HostListener, AfterViewInit, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { MatAutocomplete, MatMenuTrigger } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { startWith, debounceTime, catchError } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../../core/http/http.service';
import { UtilsService } from '../../../../../core/services/utils.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'metric-autocomplete',
    templateUrl: './metric-autocomplete.component.html',
    styleUrls: ['./metric-autocomplete.component.scss']
})

export class MetricAutocompleteComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class.metric-autocomplete') private _hostClass = true;
    @Input() namespace = '';
    @Input() filters = [];
    // tslint:disable-next-line:no-inferrable-types
    @Input() multiple: boolean = false;
    @Input() metrics = [];
    // tslint:disable-next-line:no-inferrable-types
    @Input() focus: boolean = true;

    @Output() metricOutput = new EventEmitter();
    @Output() blur = new EventEmitter();

    @ViewChild('metricSearchInput') metricSearchInput: ElementRef;
    @ViewChild('metricAutoComplete') metricAutoCompleteCntrl: MatAutocomplete;
    @ViewChild('metricSearchFormField', {read: ElementRef}) metricSearchFormField: ElementRef;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    metricOptions = [];
    metricSearchControl: FormControl;
    message: any = { 'metricSearchControl': { message: '' } };
    Object = Object;

    metricSelectedTabIndex = 0;

    queryChanges$: BehaviorSubject<boolean>;
    queryChangeSub: Subscription;
    visible = false;
    isDestroying = false;
    metricSub: Subscription;

    // tslint:disable-next-line:no-inferrable-types
    firstRun: boolean = true;
    scrollDetect: any;

    autocompleteWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(700);
    autocompleteWidth: number;
    autocompleteDefaultWidth: number;

    constructor(
        private elRef: ElementRef,
        private httpService: HttpService,
        private utils: UtilsService,
        private cdRef: ChangeDetectorRef
    ) { }

    /** ANGULAR INTERFACE METHODS */
    ngOnInit() {
        this.setMetricSearch();
    }

    ngAfterViewInit() {
        if (this.focus === true) {
            setTimeout(() => {
                if (!this.multiple) {
                    this.autocompleteDefaultWidth = this.metricSearchFormField.nativeElement.getBoundingClientRect().width;
                    this.autocompleteWidth = this.autocompleteDefaultWidth;
                }
                this.metricSearchInput.nativeElement.focus();
            }, 100);
        }
    }

    ngOnDestroy() {
        this.isDestroying = true;
        if (  this.metricSub ) {
            this.metricSub.unsubscribe();
        }
    }

    get metricSearchControlValue() {
        return this.metricSearchControl.value;
    }

    /** UTILS  */

    findLongestWordInArray(array) {
        if (array.length === 0) {
            return '';
        }
        const longest = array.reduce(function(a, b) {
            return (a.name.length > b.name.length) ? a : b;
        });
        return longest;
    }

    calculateAutoCompleteWidth(arr: any) {
        const longestOption = this.findLongestWordInArray(arr);
        // 32 is for option left/right padding
        const renderedWidth = this.utils.calculateTextWidth(<string>longestOption.name, '17', 'Ubuntu');

        if (renderedWidth > this.autocompleteDefaultWidth) {
            this.autocompleteWidth = renderedWidth + 32;
        } else {
            this.autocompleteWidth = this.autocompleteDefaultWidth;
        }
        this.autocompleteWidth$.next(this.autocompleteWidth);
    }

    /** METHODS */

    setMetricSearch() {
        this.metricSearchControl = new FormControl(this.multiple ? '' : this.metrics[0]);
        this.metricSearchControl.valueChanges
            .pipe(
                startWith(''),
                debounceTime(200)
            )
            .subscribe(value => {
                //console.log('IT DID SOMETHING **');
                // this.visible = true;
                const query: any = { namespace: this.namespace, tags: this.filters };
                query.search = value ? value : '';
                this.message['metricSearchControl'] = {};
                this.firstRun = true;
                // this.detectChanges();
                if (  this.metricSub ) {
                    this.metricSub.unsubscribe();
                }
                this.metricSub = this.httpService.getMetricsByNamespace(query)
                    .subscribe(res => {
                        this.firstRun = false;
                        this.metricOptions = res;


                        if ( this.metricOptions.length === 0 ) {
                            this.message['metricSearchControl'] = { 'type': 'info', 'message': 'No data found' };
                        }
                        setTimeout(() => {
                            this.calculateAutoCompleteWidth(this.metricOptions);
                            this.detectChanges();
                        });

                    },
                        err => {
                            this.firstRun = false;
                            this.metricOptions = [];
                            const message = err.error.error ? err.error.error.message : err.message;
                            this.message['metricSearchControl'] = { 'type': 'error', 'message': message };
                            this.detectChanges();
                    });

            });
    }

    detectChanges() {
        if ( ! this.isDestroying ) {
            this.cdRef.detectChanges();
        }
    }

    doMetricSearch() {
        this.visible = true;
        if ( this.multiple && !this.trigger.menuOpen ) {
            this.trigger.openMenu();
        }
        this.metricSearchControl.updateValueAndValidity({emitEvent: false});
    }

    requestChanges() {
        if ( this.metrics.length ) {
            this.metricOutput.emit(this.metrics);
        }
    }

    updateMetricSelection(metric, operation) {
        metric = metric.trim();
        const index = this.metrics.indexOf(metric);
        if (index === -1 && operation === 'add') {
            this.metrics.push(metric);
        } else if (index !== -1 && operation === 'remove') {
            this.metrics.splice(index, 1);
        }
    }

    removeMetric(metric) {
        const index = this.metrics.indexOf(metric);
        if (index !== -1) {
            this.metrics.splice(index, 1);
        }
    }

    getMetricIndex(metric) {
        return this.metrics.indexOf(metric);
    }

    calculateEditWidthStyle() {
        const text = this.metricSearchControlValue;
        const fontSize = 14;
        const fontFace = 'Ubuntu';
        const paddingOffset = 32; // 8px padding on left and right + 16px icon ((8*2) + 16)

        // calculate width using service
        const textWidth = this.utils.calculateTextWidth(text, fontSize, fontFace);

        let styles = {
            width: '100%'
        };

        // if the measured text is larger than 175 px, then set width + padding offset
        if (textWidth > 175) {
            styles.width = (textWidth + paddingOffset) + 'px';
        }

        return styles;
    }

    /** EVENTS */

    @HostListener('click', ['$event'])
    hostClickHandler(e) {
        e.stopPropagation();
    }

    @HostListener('document:click', ['$event.target'])
    documentClickHandler(target) {
        if (!this.elRef.nativeElement.contains(target) && this.visible) {
            if (this.multiple) {
                this.requestChanges();
                this.trigger.closeMenu();
            }
            this.blur.emit();
            this.visible = false;
        }
    }

    clickMultipleDone() {
        this.requestChanges();
        this.trigger.closeMenu();
        this.blur.emit();
        this.visible = false;
    }

    metricACKeydown(event: any) {
        /*if (!this.metricAutoCompleteCntrl.isOpen) {
            this.metrics[0] = this.metricSearchControl.value;
            this.requestChanges();
            this.blur.emit();
        }*/

        const textVal = this.metricSearchControl.value;

        // check if value is valid metric option
        const checkIdx = this.metricOptions.findIndex(item => textVal.toLowerCase() === item.name.toLowerCase());

        if (checkIdx >= 0) {
            // set value to the option value (since typed version could be different case)
            this.metrics[0] = this.metricOptions[checkIdx].name;
            // emit change
            this.requestChanges();
            this.blur.emit();
        }
    }

    metricMultipleACKeydown(event: any) {

        const textVal = this.metricSearchControl.value;

        // check if valid option
        const validIdx = this.metricOptions.findIndex(item => textVal.toLowerCase() === item.name.toLowerCase());

        // if valid option, AND it hasn't been selected yet
        if (validIdx >= 0 && this.getMetricIndex(textVal) === -1) {
            // set value to the option value (since typed version could be different case)
            this.updateMetricSelection(this.metricOptions[validIdx].name, 'add');
        }

        if (this.metrics.length > 0) {
            this.clickMultipleDone();
        }
    }

    metricACOptionSelected(event: any) {
        this.metrics[0] = event.option.value;
        this.requestChanges();
        this.blur.emit();
    }

    multipleMenuOpened() {
        this.scrollDetect = this.scrollDetect_event.bind(this);
        window.addEventListener('scroll', this.scrollDetect, true);
    }

    multipleMenuClosed() {
        window.removeEventListener('scroll', this.scrollDetect);
        this.scrollDetect = undefined;
    }

    scrollDetect_event(event) {
        const srcEl = event.srcElement;

        if (!srcEl.closest('.metric-search-result')) {
            // due to how mat-menu/cdk-menu works, we need to close the autocomplete menu on scroll to avoid wierd UI issues
            this.trigger.closeMenu();
        }
    }

    checkMenuOpen(event) {
        // BUT, if the menu is closed, and the user tries to input text, then we OPEN the autocomplete menu
        if (event.code !== 'Enter' && this.trigger.menuClosed) {
            this.trigger.openMenu();
        }
    }



}
