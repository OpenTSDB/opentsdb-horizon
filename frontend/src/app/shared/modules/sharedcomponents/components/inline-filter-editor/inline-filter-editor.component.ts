import {
    Component,
    OnInit,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
    OnDestroy,
    HostListener, ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs';
import { startWith, debounceTime, catchError } from 'rxjs/operators';
import { HttpService } from '../../../../../core/http/http.service';
import { MatMenuTrigger } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IntercomService } from '../../../../../core/services/intercom.service';



@Component({
    // tslint:disable-next-line: component-selector
    selector: 'inline-filter-editor',
    templateUrl: './inline-filter-editor.component.html',
    styleUrls: ['./inline-filter-editor.component.scss']
})
export class InlineFilterEditorComponent implements OnInit, OnDestroy {
    @HostBinding('class.inline-filter-editor') private _hostClass = true;

    @Input() query: any;
    @Input() options: any;
    @Input() tplVariables: any;
    @Output() filterOutput = new EventEmitter();
    @Output() closeModalOutput = new EventEmitter();
    @ViewChild('tagValueSearchInput') tagValueSearchInput: ElementRef;
    @ViewChild('tagSearchInput') tagSearchInput: ElementRef;
    @ViewChild('trigger', { read: MatMenuTrigger }) tagFilterMenuTrigger: MatMenuTrigger;

    namespace: string;
    filters: any[];
    metrics: any[];
    queryBeforeEdit: any;
    tagOptions = [];
    tagFilteredOptions = [];
    filteredTagValues = [];
    selectedTag = '';
    loadFirstTagValues = true;
    tagValueTypeControl = new FormControl('literalor');
    tagSearchControl: FormControl;
    tagValueSearchControl: FormControl;
    message: any = { 'tagControl': { message: '' }, 'tagValueControl': { message: '' } };
    queryChanges$: BehaviorSubject<boolean>;
    queryChangeSub: Subscription;
    tagKeySub: Subscription;
    tagValueSub: Subscription;
    visible = false;
    regexVars = /^!?\[.*\]$/;



    constructor(
        private elRef: ElementRef,
        private httpService: HttpService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private interCom: IntercomService,
        private cdRef: ChangeDetectorRef
    ) {
        matIconRegistry.addSvgIcon('exclamation_point', domSanitizer.bypassSecurityTrustResourceUrl('assets/exclamation-point.svg'));
    }

    ngOnInit() {
        this.tplVariables = this.tplVariables || {};
        this.namespace = this.query.namespace;
        this.metrics = this.query.metrics;
        this.filters = this.query.filters;
        this.queryChanges$ = new BehaviorSubject(false);

        this.queryChangeSub = this.queryChanges$
            .subscribe(trigger => {
                if (trigger) {
                    this.triggerQueryChanges();
                }
            });
        this.setTagKeys();
        this.initFormControls();
    }

    initFormControls() {
        this.tagSearchControl = new FormControl('');
        this.tagSearchControl.valueChanges
            .pipe(
                debounceTime(100)
            )
            .subscribe(search => {
                search = search.trim();
                search = search === '' ? '.*' : search;
                search = search.replace(/\s+/g, '.*').toLowerCase();
                const regex = new RegExp( search );
                for ( let i = 0; i < this.tagOptions.length; i++ ) {
                    this.tagFilteredOptions = this.tagOptions.filter(d => regex.test(d.name.toLowerCase()));
                }
                this.cdRef.detectChanges();
            });

        this.setTagValueSearch();
    }

    deleteFilter(index) {
        this.requestChanges();
    }

    setTagKeys() {
        const query: any = { namespace: this.namespace, tags: this.filters, metrics: [] };
        query.search =  '';
        // remove remove filter is it's empty for tagkey search
        query.tags = query.tags.filter(t => t.filter.length !== 0);
        // filter tags by metrics
        if (this.metrics) {
            for (let i = 0, len = this.metrics.length; i < len; i++) {
                if (!this.metrics[i].expression) {
                    query.metrics.push(this.metrics[i].name);
                }
            }
            query.metrics = query.metrics.filter((x, i, a) => a.indexOf(x) === i);
        }
        this.message['tagControl'] = {};
        if (this.tagKeySub) {
            this.tagKeySub.unsubscribe();
        }
        this.tagKeySub = this.httpService.getNamespaceTagKeys(query, this.options.metaSource)
                                            .subscribe(res => {
                                                    const selectedKeys = this.filters.map(item => item.tagk);
                                                    res = res.filter(item => selectedKeys.indexOf(item.name) === -1);
                                                    const options = selectedKeys.map(item => ({ 'name': item })).concat(res);
                                                    if (this.loadFirstTagValues && options.length) {
                                                        this.handlerTagClick(options[0].name);
                                                    }
                                                    this.loadFirstTagValues = false;
                                                    this.tagOptions = options;
                                                    this.tagSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
                                                },
                                                err => {
                                                    this.tagOptions = [];
                                                    this.tagFilteredOptions = [];
                                                    const message = err.error.error ? err.error.error.message : err.message;
                                                    this.message['tagControl'] = { 'type': 'error', 'message': message };
                                                    this.cdRef.detectChanges();
                                                }
                                            );
    }

    setTagValueSearch() {
        this.tagValueSearchControl = new FormControl('');

        // need to include switchMap to cancel the previous call
        this.tagValueSearchControl.valueChanges
            .pipe(
                startWith(''),
                debounceTime(200)
            )
            .subscribe(value => {
                const query: any = {
                    namespace: this.namespace,
                    // add condition since adding var may not with not existing value so fitler length is zero.
                    tags: this.filters.filter(item => item.tagk !== this.selectedTag && item.filter.length > 0),
                    metrics: []
                };
                query.search = value ? value : '';

                // filter by metrics
                if (this.metrics) {
                    for (let i = 0, len = this.metrics.length; i < len; i++) {
                        if (!this.metrics[i].expression) {
                            query.metrics.push(this.metrics[i].name);
                        }
                    }
                    query.metrics = query.metrics.filter((x, i, a) => a.indexOf(x) === i);
                }
                if (this.selectedTag && this.tagValueTypeControl.value === 'literalor') {
                    query.tagkey = this.selectedTag;
                    this.message['tagValueControl'] = {};
                    if (this.tagValueSub) {
                        this.tagValueSub.unsubscribe();
                    }
                    // any var template match with selected tag
                    let tplVars: any = [];
                    if (this.tplVariables.tvars) {
                        tplVars = this.tplVariables.tvars.filter(v => v.tagk === this.selectedTag);
                    }
                    this.tagValueSub = this.httpService.getTagValuesByNamespace(query, this.options.metaSource)
                        .subscribe(res => {
                            // append tpl vars to the top of the list of value
                            if (Array.isArray(tplVars) && tplVars.length > 0) {
                                for (let i = 0; i < tplVars.length; i++) {
                                    res.unshift({name: '[' + tplVars[i].alias + ']'});
                                }
                            }
                            this.filteredTagValues = res;
                            this.cdRef.detectChanges();
                        },
                            err => {
                                this.filteredTagValues = [];
                                const message = err.error.error ? err.error.error.message : err.message;
                                this.message['tagValueControl'] = { 'type': 'error', 'message': message };
                                this.cdRef.detectChanges();
                            });
                }
            });
    }

    requestChanges() {
        this.filterOutput.emit(this.filters);
    }

    closeTagFilterModal() {
        //this.requestChanges();
        this.closeModalOutput.emit(true);
    }

    triggerQueryChanges() {
        this.requestChanges();
    }

    handlerTagClick(tag) {
        this.selectedTag = tag;
        this.tagValueTypeControl.setValue('literalor');
        this.tagValueSearchControl.setValue(null);
        this.filteredTagValues = [];
    }

    // to remove tag key and all of its values
    removeTagValues(tag) {
        this.filters.splice(this.getTagIndex(tag), 1);
        this.setTagKeys();
        this.tagValueSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        this.queryChanges$.next(true);
        // because it acts like it is not selected after you remove it, but looks selected
        // simulate the click again
        this.handlerTagClick(tag);
    }

    getTagIndex(tag) {
        const tagIndex = this.filters.findIndex(item => item.tagk === tag);
        return tagIndex;
    }
    lastAddedKey(tag) {
        return (this.filters && this.filters.length) ? this.filters[this.filters.length - 1].tagk === tag : false;
    }
    getTagValueIndex(tag, v) {
        const tagIndex = this.getTagIndex(tag);
        let tagValueIndex = -1;
        let varValueIndex = -1;
        if (tagIndex !== -1) {
            tagValueIndex = this.filters[tagIndex].filter.findIndex(d => { d = d[0] === '!' ? d.substr(1) : d; return d === v; });
            if (this.filters[tagIndex].customFilter) {
                varValueIndex = this.filters[tagIndex].customFilter.findIndex(d => { d = d[0] === '!' ? d.substr(1) : d; return d === v; });
            }
        }
        if (tagValueIndex === -1 && varValueIndex === -1) {
            return -1;
        } else {
            return 0;
        }
    }

    addTagValueRegexp() {
        let v = this.tagValueSearchControl.value.trim();
        if (this.tagValueTypeControl.value === 'regexp' && v) {
            v = 'regexp(' + v + ')';
            this.updateTagValueSelection(this.selectedTag, v, 'add');
            this.tagValueSearchControl.setValue(null);
        }
    }

    updateTagValueSelection(tag, v, operation) {
        let tagIndex = this.getTagIndex(tag);
        v = v.trim();
        if (tagIndex === -1 && operation === 'add') {
            tagIndex = this.filters.length;
            const filter: any = { tagk: this.selectedTag, filter: [], customFilter: [] };
            filter.groupBy = false;
            this.filters[tagIndex] = filter;
        }

        if (operation === 'add') {
            const checkVar = this.regexVars.test(v);
            if (checkVar) {
                // when user manually adds a db filter
                this.filters[tagIndex].customFilter ?
                this.filters[tagIndex].customFilter.push(v) :
                this.filters[tagIndex].customFilter = [v];
                this.interCom.requestSend({
                    action: 'UpdateCustomFiltersAppliedCount',
                    payload: {
                        operator: 'add',
                        alias: v
                    }
                });
            } else {
                this.filters[tagIndex].filter.push(v);
            }
        } else if (tagIndex !== -1 && operation === 'remove') {
            if (this.regexVars.test(v)) {
                // when user maually removes a db filter
                const varIndex = this.filters[tagIndex].customFilter.indexOf(v);
                this.filters[tagIndex].customFilter.splice(varIndex, 1);
                // we need to update db fitler state for applied count for this custom tag filter
                this.interCom.requestSend({
                    action: 'UpdateCustomFiltersAppliedCount',
                    payload: {
                        operator: 'remove',
                        alias: v
                    }
                });
            } else {
                const index = this.filters[tagIndex].filter.indexOf(v);
                this.filters[tagIndex].filter.splice(index, 1);
            }

            if ( (this.filters[tagIndex].filter.length === 0 && !this.filters[tagIndex].customFilter) ||
                (this.filters[tagIndex].filter.length === 0 &&
                    this.filters[tagIndex].customFilter.length === 0)) {
                this.filters.splice(tagIndex, 1);
            }

        }

        if ( tag !== this.selectedTag ) {
            this.tagValueSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
        this.setTagKeys();
        this.queryChanges$.next(true);
    }

    toggleExclude(tag, v, isExclude) {
        const stripV = v[0] === '!' ? v.substr(1) : v;
        const tagIndex = this.getTagIndex(tag);
        if (this.regexVars.test(v)) {
            const index = this.filters[tagIndex].customFilter.indexOf(v);
            this.filters[tagIndex].customFilter[index] = isExclude ? '!' + stripV : stripV ;
        } else {
            const index = this.filters[tagIndex].filter.indexOf(v);
            this.filters[tagIndex].filter[index] = isExclude ? '!' + stripV : stripV ;
        }
        if ( tag !== this.selectedTag ) {
            this.tagValueSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }
        this.setTagKeys();
        this.queryChanges$.next(true);
    }

    closeMenu(e) {
        this.tagFilterMenuTrigger.closeMenu();
        e.stopPropagation();
    }

    isInfilteredKeys(key) {
        const keys = [];
        for (let i = 0, len = this.filters.length; i < len; i++) {
            keys.push(this.filters[i].tagk);
        }
        return keys.indexOf(key);
    }

    getAutoManualClass(alias: string) {
        // take out !not if there for checking
        alias = alias.replace('!', '');
        const idx = this.tplVariables.tvars.findIndex(item => item.mode === 'auto' && '[' + item.alias + ']' === alias);

        if (idx > -1) {
            return true;
        } else {
            return false;
        }
    }


    ngOnDestroy() {
        this.queryChangeSub.unsubscribe();
        if (this.tagKeySub) {
            this.tagKeySub.unsubscribe();
        }
        if (this.tagValueSub) {
            this.tagValueSub.unsubscribe();
        }
    }

    @HostListener('click', ['$event'])
    hostClickHandler(e) {
        e.stopPropagation();
    }

    @HostListener('document:click', ['$event.target'])
    documentClickHandler(target) {
        if (!this.elRef.nativeElement.contains(target) && this.visible) {
            this.visible = false;

        } else if (!this.visible) {
            this.visible = true;
        }
    }
}
