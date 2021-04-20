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
import { UtilsService } from '../../../../../core/services/utils.service';




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
    @Output() tagExplicitMatchOutput = new EventEmitter();
    @ViewChild('tagValueSearchInput') tagValueSearchInput: ElementRef;
    @ViewChild('tagSearchInput') tagSearchInput: ElementRef;
    @ViewChild('trigger', { read: MatMenuTrigger }) tagFilterMenuTrigger: MatMenuTrigger;
    @ViewChild('searchInput') searchInput: ElementRef;

    TAGVALUELEN = 100;
    namespace: string;
    filters: any[];
    metrics: any[];
    queryBeforeEdit: any;
    searchType = 'basic';
    tagOptions = [];
    tagFilteredOptions = [];
    filteredTagValues = [];
    searchResults: any = {};
    selectedTag = '';
    loadFirstTagValues = false;
    tagValueTypeControl = new FormControl('literalor');
    searchControl: FormControl;
    tagSearchControl: FormControl;
    tagValueSearchControl: FormControl;
    message: any = { 'searchControl': { message: '' }, 'tagControl': { message: '' }, 'tagValueControl': { message: '' } };
    queryChanges$: BehaviorSubject<boolean>;
    queryChangeSub: Subscription;
    searchSub: Subscription;
    tagKeySub: Subscription;
    tagValueSub: Subscription;
    visible = false;
    regexVars = /^!?\[.*\]$/;
    tagValueSearch = false;
    tagSearch = false;
    basicSearch = false;
    bsTagValSearch = '';
    showDashboardFilters = false;

    tagValueFilterType: string = 'regexp'; // regexp || librange

    constructor(
        private elRef: ElementRef,
        private httpService: HttpService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private interCom: IntercomService,
        private cdRef: ChangeDetectorRef,
        private utils: UtilsService,
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
        this.setSearch();
        this.setTagValueSearch();
        this.initFormControls();
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        });
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
                if (this.loadFirstTagValues && this.tagFilteredOptions.length) {
                    this.handlerTagClick(this.tagFilteredOptions[0].name);
                    this.loadFirstTagValues = false;
                }
                if ( !this.selectedTag && !this.tagFilteredOptions.length ) {
                    this.filteredTagValues = [];
                }
                this.cdRef.detectChanges();
            });

        // this.setTagValueSearch();
    }

    toggleExplictTagMatch(event: any) {
        this.tagExplicitMatchOutput.emit(event);
    }

    deleteFilter(index) {
        this.requestChanges();
    }

    setSearchType(type) {
        this.searchType = type;
        if ( type === 'advanced' ) {
            if ( !this.selectedTag ) {
                this.tagSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
                this.loadFirstTagValues = true;
                // this.handlerTagClick(this.tagOptions[0].name);
            } else {
                this.tagSearchControl.setValue('');
            }
            setTimeout(() => {
                this.tagValueSearchInput.nativeElement.focus();
            });
        } else {
            setTimeout(() => {
                if ( this.searchInput ) {
                    this.searchInput.nativeElement.focus();
                } else {
                    this.tagValueSearchInput.nativeElement.focus();
                }
            });
        }
    }

    setTagFilterType(type: string) {
        this.tagValueFilterType = type;
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
        this.tagSearch = true;
        this.tagKeySub = this.httpService.getNamespaceTagKeys(query, this.options.metaSource)
                                            .subscribe(res => {
                                                    const selectedKeys = this.filters.map(item => item.tagk);
                                                    res = res.filter(item => selectedKeys.indexOf(item.name) === -1);
                                                    const options = selectedKeys.map(item => ({ 'name': item })).concat(res);
                                                    this.tagSearch = false;
                                                    this.tagOptions = options;
                                                    this.setDashboardFilters();
                                                    this.cdRef.detectChanges();
                                                },
                                                err => {
                                                    this.tagSearch = false;
                                                    this.tagOptions = [];
                                                    this.tagFilteredOptions = [];
                                                    const message = err.error.error ? err.error.error.message : err.message;
                                                    this.message['tagControl'] = { 'type': 'error', 'message': message };
                                                    this.cdRef.detectChanges();
                                                }
                                            );
    }

    setSearch() {
        this.searchControl = new FormControl('');
        this.searchControl.valueChanges
            .pipe(
                // startWith(''),
                debounceTime(300)
            )
            .subscribe(value => {
                const query: any = {
                    namespace: this.namespace,
                    // add condition since adding var may not with not existing value so fitler length is zero.
                    tags: this.filters.filter(item => item.tagk !== this.selectedTag && item.filter.length > 0),
                    metrics: []
                };
                query.search = value ? value : '';
                const tagVal = query.search.split(":");
                this.bsTagValSearch = tagVal[1] ? tagVal[1].trim() : tagVal[0].trim();

                // filter by metrics
                if (this.metrics) {
                    for (let i = 0, len = this.metrics.length; i < len; i++) {
                        if (!this.metrics[i].expression) {
                            query.metrics.push(this.metrics[i].name);
                        }
                    }
                    query.metrics = query.metrics.filter((x, i, a) => a.indexOf(x) === i);
                }
                this.message['searchControl'] = {};
                if (this.searchSub) {
                    this.searchSub.unsubscribe();
                }

                this.basicSearch = true;
                this.cdRef.detectChanges();
                this.searchSub = this.httpService.getTagKeysAndTagValuesByNamespace(query, this.options.metaSource)
                    .subscribe(res => {
                        // tslint:disable:max-line-length
                        this.searchResults = { tagKeys: Object.keys(res.tagKeysAndValues).sort(this.utils.sortAlphaNum), tagKeysAndValues: res.tagKeysAndValues };
                        this.basicSearch = false;
                        this.cdRef.detectChanges();
                    },
                        err => {
                            this.searchResults = { tagValueKeys: [], tagKeysAndValues: {}};
                            const message = err.error.error ? err.error.error.message : err.message;
                            this.message['searchControl'] = { 'type': 'error', 'message': message };
                            this.basicSearch = false;
                            this.cdRef.detectChanges();
                    });
            });
    }

    resetSearch() {
        this.searchControl.setValue(null, { emitEvent: false, onlySelf: true });
    }

    resetTagValueSearch() {
        this.tagValueSearchControl.setValue(null, { emitEvent: false, onlySelf: true });
        this.unsetTag();
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
                    this.tagValueSearch = true;
                    this.cdRef.detectChanges();
                    this.tagValueSub = this.httpService.getTagValuesByNamespace(query, this.options.metaSource)
                        .subscribe(res => {
                            this.filteredTagValues = res;
                            this.tagValueSearch = false;
                            this.cdRef.detectChanges();
                        },
                            err => {
                                this.filteredTagValues = [];
                                const message = err.error.error ? err.error.error.message : err.message;
                                this.message['tagValueControl'] = { 'type': 'error', 'message': message };
                                this.tagValueSearch = false;
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

    handlerTagClick(tag, search= null) {
        const index = search ? search.indexOf(':') : -1 ;
        const tagkSearch = index !== -1 ? search.substring(0, index ) : search;
        let tagValSearch = '';

        if ( index === -1 && search && tag.search(new RegExp(tagkSearch, 'i')) !== -1 ) {
            tagValSearch = '';
        } else if ( index !== -1 && tagkSearch && tag.search(new RegExp(tagkSearch, 'i')) !== -1 ) {
            tagValSearch = search.substring(index + 1);
        } else {
            tagValSearch = search;
        }
        this.selectedTag = tag;
        // tslint:disable:max-line-length
        this.tagValueSearchControl.setValue(tagValSearch, {emitEvent: search && this.searchResults.tagKeysAndValues[tag].values.length ? false : true });
        this.tagValueSearch = search && this.searchResults.tagKeysAndValues[tag].values.length ? false : true;
        this.filteredTagValues = search && this.searchResults.tagKeysAndValues[tag].values.length ? this.searchResults.tagKeysAndValues[tag].values : [];
        setTimeout(() => {
            this.tagValueSearchInput.nativeElement.focus();
        });
    }

    setTag(tag, search= null) {
        this.handlerTagClick(tag, search);
    }

    unsetTag() {
        this.selectedTag = '';
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        });
    }

    // to remove tag key and all of its values
    removeTagValues(tag, selected) {
        this.filters.splice(this.getTagIndex(tag), 1);
        this.setTagKeys();
        this.tagValueSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        this.queryChanges$.next(true);
        // because it acts like it is not selected after you remove it, but looks selected
        // simulate the click again
        if ( selected ) {
            this.handlerTagClick(tag);
        }
    }

    setDashboardFilters() {
        let showFilter = false;
        for ( let i = 0; this.tplVariables.tvars && i < this.tplVariables.tvars.length; i++ ) {
            const tvar = this.tplVariables.tvars[i];
            if ( this.canAddDashboardFilter(tvar.tagk, '[' + tvar.alias + ']') ) {
                showFilter = true;
                break;
            }
        }
        this.showDashboardFilters = showFilter;
    }

    canAddDashboardFilter(tag, alias) {
        const index = this.tagOptions.findIndex(d => d.name === tag);
        const tagIndex = this.getTagIndex(tag);
        let aliasIndex = -1;
        if ( tagIndex !== -1 ) {
            aliasIndex = this.filters[tagIndex].customFilter.findIndex(d => { d = d[0] === '!' ? d.substr(1) : d; return d === alias; });
        }
        return index !== -1 && aliasIndex === -1;
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
            const filter: any = { tagk: tag, filter: [], customFilter: [] };
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

        if ( this.selectedTag && tag !== this.selectedTag ) {
            this.tagValueSearchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        } else if ( !this.selectedTag && this.searchType === 'basic') {
            this.searchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
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
        if ( this.searchSub ) {
            this.searchSub.unsubscribe();
        }
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
