import {
    Component,
    OnInit,
    HostBinding,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
    ElementRef, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, takeLast } from 'rxjs/operators';
import { IntercomService } from '../../../core/services/intercom.service';
import { UtilsService } from '../../../core/services/utils.service';
import { DashboardService } from '../../services/dashboard.service';
import { HttpService } from '../../../core/http/http.service';
import { moveItemInArray, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'template-variable-panel',
    templateUrl: './template-variable-panel.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateVariablePanelComponent implements OnInit, OnChanges, OnDestroy {

    @HostBinding('class.template-variable-panel-component') private _hostClass = true;

    @Input() tplVariables: any;
    @Input() mode: any;
    @Input() widgets: any[];
    @Input() tagKeysByNamespaces: string[];
    @Output() modeChange: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('focusEl') focusEl: ElementRef;

    editForm: FormGroup;
    listForm: FormGroup;
    listenSub: Subscription;
    filteredKeyOptions: Observable<string[]>; // options for key autosuggest
    filteredValueOptions: string[][];
    filterValLoading = true;
    filterValLoadingErr = false;
    prevSelectedTagk = '';
    disableDone = false;
    trackingSub: any = {};
    selectedNamespaces: any[] = [];
    dbNamespaces: string[] = [];
    originAlias: string[] = [];
    tagBlurTimeout: any;
    valChangeSub: Subscription;
    isSecondBlur = false; // when we manually call focus to some element, the blur happened to auto-complete.

    // style object for drag placeholder
    placeholderStyles: any = { width: '100%', height: '49px', transform: 'translate3d(0px,0px,0px)'};

    tagValueBlurTimeout: any;
    tagValueFocusTimeout: any;
    tagValueViewBlurTimeout: any;
    tagValueViewFocusTimeout: any;

    tagValueScopeSub: Subscription;
    tagValueSearchInputControl: FormControl = new FormControl('');
    scopeIndex = -1;
    tagValueSearch: string[] = [];
    tagScope: string[] = [];
    useDBFScope = false;
    doSearch = false;
    scopeCache: string[][] = [];
    scopeModify = false;

    constructor(
        private fb: FormBuilder,
        private interCom: IntercomService,
        private dbService: DashboardService,
        private utils: UtilsService,
        private cdRef: ChangeDetectorRef,
        private httpService: HttpService
    ) {
        // predefine there
         this.listForm = this.fb.group({
            listVariables: this.fb.array([])
        });
        this.editForm = this.fb.group({
            formTplVariables: this.fb.array([])
        });
    }

    ngOnInit() {
        // this is for getting tag value for scope
        this.tagValueScopeSub = this.tagValueSearchInputControl.valueChanges
        .pipe(
            debounceTime(200)
        ).subscribe(val => {
            this.filterValLoading = true;
            const regexStr = val === '' ? 'regexp(.*)' : 'regexp('+val.replace(/\s/g, ".*")+')';
            this.tagValueSearch = [];
            this.tagValueSearch[0] = regexStr;
            this.cdRef.markForCheck();
            if (this.scopeIndex > -1) {
                if (this.trackingSub[this.scopeIndex]) {
                    this.trackingSub[this.scopeIndex].unsubscribe();
                }
                const tpl = this.mode.view ? this.tplVariables.viewTplVariables : this.tplVariables.editTplVariables;
                const query: any = {
                    tag: { key: tpl.tvars[this.scopeIndex].tagk, value: val },
                    tagsFilter: []
                };
                query.namespaces = tpl.namespaces;
                this.trackingSub[this.scopeIndex] = this.httpService.getTagValues(query).subscribe(results => {
                    this.filterValLoading = false;
                    this.tagValueSearch = this.tagValueSearch.concat(results);
                    this.cdRef.markForCheck();
                });
            }
        });
    }

    // to set reset these variable, will be call from dashboard component.
    reset() {
        this.dbNamespaces = [];
        this.selectedNamespaces = [];
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.widgets) {
            // call to get dashboard namespaces
            this.dbNamespaces = this.dbService.getNamespacesFromWidgets(this.widgets);
            // update editTplVariables
            for (let i = 0; i < this.dbNamespaces.length; i++) {
                if (!this.tplVariables.editTplVariables.namespaces.includes(this.dbNamespaces[i])) {
                    this.tplVariables.editTplVariables.namespaces.push(this.dbNamespaces[i]);
                }
            }
            this.selectedNamespaces = this.tplVariables.editTplVariables.namespaces;
        }
        if (changes.tplVariables) {
            if (this.mode.view) {
                // this.selectedNamespaces = changes.tplVariables.currentValue.viewTplVariables.namespaces;
                this.initListFormGroup();
            } else {
                this.selectedNamespaces = changes.tplVariables.currentValue.editTplVariables.namespaces;
                this.initEditFormGroup();
            }
        } else if (changes.mode && !changes.mode.firstChange) {
            // else if (changes.mode && !changes.mode.firstChange && changes.mode.currentValue.view) {
            // copy edit -> view list
            // this.tplVariables.viewTplVariables = this.utils.deepClone(this.tplVariables.editTplVariables);
            // this.initListFormGroup();
            if (changes.mode.currentValue.view) {
                this.initListFormGroup(true);
            } else {
                this.initEditFormGroup(true);
            }
        }
    }
    doEdit() {
        this.modeChange.emit({ view: false });
    }

    // for filteredValueOptions, we can use both in view or edit mode, since
    // they have same index and all
    // @mode: from input, view or edit
    manageFilterControl(index: number) {
        const arrayControl = this.mode.view ? this.listForm.get('listVariables') as FormArray
            : this.editForm.get('formTplVariables') as FormArray;
        const name = this.mode.view ? 'view' : 'edit';
        const selControl = arrayControl.at(index);
        if (selControl.invalid) { return; } // no go futher if no tagkey and alias defined.
        const val = selControl.get('display').value;
        const initVal = this.checkRegexp(selControl.get('filter').value) ? val : '';
        // only when it not there
        if (!this.filteredValueOptions[index]) {
            this.filteredValueOptions[index] = [];
        }
        if (!this.scopeCache[index]) {
            this.scopeCache[index] = [];
        }
        this.trackingSub[name + index] = selControl.get('display').valueChanges
            .pipe(
                startWith(initVal),
                distinctUntilChanged(),
                debounceTime(200)
            ).subscribe(val => {
                val = val ? val.trim() : '';
                const regexStr = val === '' || val === 'regexp()' ? 'regexp(.*)' : /^regexp\(.*\)$/.test(val) ? val : 'regexp('+val.replace(/\s/g, ".*")+')';
                // const regexStr = val === '' ? 'regexp(.*)' : 'regexp(' + val.replace(/\s/g, ".*") + ')';
                const alias = '[' + selControl.get('alias').value + ']';
                const tagk = selControl.get('tagk').value;
                const metrics = [];
                // get tag values that matches metrics or namespace if metrics is empty
                for (let i = 0; i < this.widgets.length; i++) {
                    const queries = this.widgets[i].queries;
                    for (let j = 0; j < queries.length; j++) {
                        const filters = queries[j].filters;
                        let aliasFound = false;
                        for (let k = 0; k < filters.length; k++) {
                            if (filters[k].tagk === tagk && filters[k].customFilter && filters[k].customFilter.includes(alias)) {
                                aliasFound = true;
                            }
                        }
                        if (aliasFound) {
                            for (let k = 0; k < queries[j].metrics.length; k++) {
                                if (!queries[j].metrics[k].expression) {
                                    metrics.push(queries[j].namespace + '.' + queries[j].metrics[k].name);
                                }
                            }
                        }
                    }
                }
                const query: any = {
                    tag: { key: tagk, value: val }
                };
                if (metrics.length) {
                    query.metrics = metrics;
                } else {
                    // tslint:disable-next-line: max-line-length
                    query.namespaces = this.mode.view ? this.tplVariables.viewTplVariables.namespaces : this.tplVariables.editTplVariables.namespaces;
                }
                const qid = 'v-' + name + index;
                if (this.trackingSub[qid]) {
                    this.trackingSub[qid].unsubscribe();
                }
                this.filterValLoading = true;
                this.filterValLoadingErr = false;
                // if they have scope defined then we use scope instead
                if (selControl.get('scope').value && selControl.get('scope').value.length > 0) {    
                    this.useDBFScope = true;
                    if (!this.scopeCache[index].length) {
                        for (let i = 0; i < selControl.get('scope').value.length; i++) {
                            let v = selControl.get('scope').value[i];
                            if (v[0] === '!' || v.match(/regexp\((.*)\)/)) {
                                this.doSearch = true;
                                query.tagsFilter = [{
                                    tagk: tagk,
                                    filter: selControl.get('scope').value
                                }];
                                break;
                            }
                        }
                    }
                    if (!this.doSearch) {      
                        // once the scope is populate or using just absolute values               
                        if (!this.scopeCache[index].length) {
                            this.scopeCache[index] = selControl.get('scope').value;
                        }
                        if (this.filteredValueOptions[index].length > 0) {
                            this.filteredValueOptions[index].splice(1, this.filteredValueOptions[index].length - 1);
                        }
                        this.filteredValueOptions[index][0] = regexStr;
                        // if we have scopeCache then just filter thru it.
                        if (val !== '') {
                            this.filteredValueOptions[index]  = this.filteredValueOptions[index].concat(this.scopeCache[index].filter(v => v.indexOf(val) !== -1));
                        } else {
                            this.filteredValueOptions[index] = this.filteredValueOptions[index].concat(this.scopeCache[index]);
                        }         
                        this.filterValLoading = false;        
                        this.cdRef.markForCheck();
                    }
                } else {
                    this.useDBFScope = false;
                    this.doSearch = true;
                    query.tagsFilter = [];
                }
                if (this.doSearch) {
                    // assign regexpStr to first element right away
                    if (this.filteredValueOptions[index]) {
                        if (this.filteredValueOptions[index].length > 1) {
                            this.filteredValueOptions[index].splice(1, this.filteredValueOptions[index].length - 1);
                        }
                        this.filteredValueOptions[index][0] = regexStr;
                        this.cdRef.markForCheck();
                    }
                    this.trackingSub[qid] = this.httpService.getTagValues(query).subscribe(
                        results => {
                            this.filterValLoading = false;
                            if (results && results.length > 0 && this.filteredValueOptions[index]) {
                                if (this.useDBFScope) {
                                    this.scopeCache[index] = results;
                                }
                                this.filteredValueOptions[index] = this.filteredValueOptions[index].concat(results);
                            }
                            this.doSearch = false;
                            this.cdRef.markForCheck();
                        },
                        err => {
                            this.filterValLoading = false;
                            this.filterValLoadingErr = true;
                            this.doSearch = false;
                            this.cdRef.markForCheck();
                        });
                }
            });
    }
    initListFormGroup(checkRun: boolean = false) {
        this.editForm.reset({ emitEvent: false});
        // when switching to edit mode, we use the edit form and value and requery of needed
        if (checkRun) {
            if (JSON.stringify(this.tplVariables.editTplVariables.tvars) !== JSON.stringify(this.tplVariables.viewTplVariables.tvars)) {
                this.interCom.requestSend({
                    action: 'ApplyTplVarValue',
                    payload: this.tplVariables.viewTplVariables.tvars
                });
            }
        }
        this.filteredValueOptions = [];
        this.listForm.controls['listVariables'] = this.fb.array([]);
        if (this.tplVariables.viewTplVariables.tvars) {
            this.tplVariables.viewTplVariables.tvars.forEach((data, index) => {
                const res = data.filter.match(/^regexp\((.*)\)$/);
                const vardata = {
                    tagk: new FormControl((data.tagk) ? data.tagk : '', []),
                    alias: new FormControl((data.alias) ? data.alias : '', []),
                    filter: new FormControl((data.filter) ? data.filter : '', []),
                    mode: new FormControl((data.mode) ? data.mode : 'auto'),
                    display: new FormControl(res ? res[1] : data.filter ? data.filter : '', []),
                    scope: new FormControl(data.scope ? data.scope : []),
                    applied: data.applied,
                    isNew: data.isNew
                };
                const control = <FormArray>this.listForm.controls['listVariables'];
                control.push(this.fb.group(vardata));
            });
        }
    }

    initEditFormGroup(checkRun: boolean = false) {
        this.listForm.reset({ emitEvent: false});
        this.filteredValueOptions = [];
        this.editForm.controls['formTplVariables'] = this.fb.array([]);
        this.initializeTplVariables(this.tplVariables.editTplVariables.tvars);

        // when switching to edit mode, we use the edit form and value and requery of needed
        if (checkRun) {
            if (JSON.stringify(this.tplVariables.editTplVariables.tvars) !== JSON.stringify(this.tplVariables.viewTplVariables.tvars)) {
                this.interCom.requestSend({
                    action: 'ApplyTplVarValue',
                    payload: this.tplVariables.editTplVariables.tvars
                });
            }
        }
    }

    initializeTplVariables(values: any[]) {
        if (values.length === 0) {
            // add an empty one if there are no values
            this.addVariableTemplate();
        } else {
            for (const item of values) {
                this.addVariableTemplate(item);
            }
        }
    }

    checkRegexp(val: string): boolean {
        const res = val.match(/^regexp\((.*)\)$/);
        return res ? true : false;
    }

    getDisplay(val: string): string {
        const res = val.match(/^regexp\((.*)\)$/);
        return res ? res[1] : val;
    }
    // to resturn the last filter mode to use for new one.
    getLastFilterMode(): string {
        let retString = 'auto';
        if (this.formTplVariables.controls && this.formTplVariables.controls.length > 0) {
            const lastFilter = this.formTplVariables.controls[this.formTplVariables.controls.length -1];
            retString = lastFilter.get('mode').value;
        }
        return retString;
    }

    // dirty flag to determine if the tag is insert or replace in auto mode
    // dirty = 1 means to do insert
    addVariableTemplate(data?: any) {
        data = (data) ? data : { mode: this.getLastFilterMode(), applied: 0, isNew: 1 };
        let res = null;
        if (data.filter) {
            res = data.filter.match(/^regexp\((.*)\)$/);
        }
        const varData = {
            tagk: new FormControl((data.tagk) ? data.tagk : '', [Validators.required]),
            alias: new FormControl((data.alias) ? data.alias : '', [Validators.required]),
            filter: new FormControl((data.filter) ? data.filter : '', []),
            mode: new FormControl((data.mode) ? data.mode : 'auto'),
            display: new FormControl(res ? res[1] : data.filter ? data.filter : '', []),
            scope: new FormControl(data.scope ? data.scope : []),
            applied: data.applied,
            isNew: data.isNew
        };

        const control = <FormArray>this.editForm.controls['formTplVariables'];
        control.push(this.fb.group(varData));
    }

    onVariableFocus(index: number) {
        this.filterValLoading =  true;
        this.tagValueViewFocusTimeout = setTimeout(() => {
            this.manageFilterControl(index);
        }, 300);
    }

    onVariableBlur(event: any, index: number) {
        if (this.isSecondBlur) {
            this.isSecondBlur = false;
            return;
        }
        const control = <FormArray>this.listForm.controls['listVariables'];
        const selControl = control.at(index);
        // if it's a different value from viewlist
        this.tagValueViewBlurTimeout = setTimeout(()=> {
            const val = selControl.get('display').value;
            // no check and let user enter whatever
            let idx = -1;
            if (val === '') {
                selControl.get('filter').setValue('', { emitEvent: true });
                selControl.get('display').setValue('');
            } else {
                // val will not have regexp wrapper yet here
                // see of the original filer val has regexp
                const res = this.tplVariables.viewTplVariables.tvars[index].filter.match(/^regexp\((.*)\)$/);
                if ((res && res[1] === val) || (!res && this.tplVariables.viewTplVariables.tvars[index].filter === val)) {
                    // no value change
                    selControl.get('filter').setValue(this.tplVariables.viewTplVariables.tvars[index].filter, { emitEvent: false });
                } else {
                    // there is changes
                    if (this.filteredValueOptions[index]) {
                        idx = this.filteredValueOptions[index].findIndex(item => item && item === val);
                    }
                    if (idx === -1) {
                        selControl.get('filter').setValue('regexp(' + val ? val.replace(/\s/g, ".*") : ".*" + ')', { emitEvent: true });
                        selControl.get('display').setValue(val);

                    } else {
                        selControl.get('filter').setValue(this.filteredValueOptions[index][idx], { emitEvent: true });
                    }
                }
            }
            if (this.tplVariables.viewTplVariables.tvars[index].filter !== selControl.get('filter').value) {
                this.tplVariables.viewTplVariables.tvars[index].filter = selControl.get('filter').value;
                this.interCom.requestSend({
                    action: 'ApplyTplVarValue',
                    payload: [selControl.value]
                });
            }
            this.filteredValueOptions[index] = [];
        }, 300);
    }

    onInputFocus(cname: string, index: number) {
        const selControl = this.getSelectedControl(index);
        switch (cname) {
            case 'tagk':
                this.filteredKeyOptions = selControl['controls'][cname].valueChanges
                    .pipe(
                        startWith(''),
                        debounceTime(300),
                        map(val => {
                            // turn off lowercase
                            // const filterVal = val.toString().toLowerCase();
                            // return this.tagKeysByNamespaces.filter(key => key.toLowerCase().includes(filterVal));
                            const filterVal = val.toString();
                            return this.tagKeysByNamespaces.filter(key => key.includes(filterVal));
                        })
                    );
                break;
            case 'alias':
                if (this.valChangeSub) {
                    this.valChangeSub.unsubscribe();
                }
                this.originAlias[index] = selControl['controls'][cname].value;
                // if the tag_key is invalid, we should not move on here
                if (selControl.get('tagk').value !== '') {
                    this.valChangeSub = selControl['controls'][cname].valueChanges.pipe(
                        debounceTime(100)
                    ).subscribe(val => {
                        this.justValidateForm(val.toString(), index);
                    });
                }
                break;
            case 'display':
                this.filterValLoading = true;
                this.tagValueFocusTimeout = setTimeout(() => {
                    this.manageFilterControl(index);
                }, 300);
                break;
        }
    }

    private getSelectedControl(index: number, formArrayName = 'formTplVariables') {
        let control = null;
        if (formArrayName === 'listVariables') {
            control = <FormArray>this.listForm.controls[formArrayName];
        } else {
            control = <FormArray>this.editForm.controls[formArrayName];
        }
        return control.at(index);
    }

    private justValidateForm (val: string, index: number) {
        if (val.trim() !== '') {
            const tplFormGroups = this.editForm.controls['formTplVariables']['controls'];
            // first let do the validation of the form to make sure we have unique alias
            for (let i = 0; i < tplFormGroups.length; i++) {
                const rowControl = tplFormGroups[i];
                // we need to reset error from prev round if any
                rowControl.controls['alias'].setErrors(null);
                this.cdRef.markForCheck();
                if ( i === index ) { continue; }
                if (val.trim() === rowControl.get('alias').value) {
                    tplFormGroups[index].controls['alias'].setErrors({ 'unique': true, emitEvent: true, });
                    tplFormGroups[index].controls['alias'].markAsTouched({ self: true});
                    tplFormGroups[i].controls['alias'].setErrors({ 'unique': true, emitEvent: true });
                    tplFormGroups[i].controls['alias'].markAsTouched({self: true});
                    this.cdRef.markForCheck();
                    return;
                }
            }
        }
    }
    // since alias/name has to be unique with db filters
    private validateAlias(val: string, index: number, selControl: any, originAlias: string[]) {
        if (val.trim() !== '') {
            const tplFormGroups = this.editForm.controls['formTplVariables']['controls'];
            // first let do the validation of the form to make sure we have unique alias
            for (let i = 0; i < tplFormGroups.length; i++) {
                const rowControl = tplFormGroups[i];
                // we need to reset error from prev round if any
                rowControl.controls['alias'].setErrors(null);
                this.cdRef.markForCheck();
                if ( i === index ) { continue; }
                if (val.trim() === rowControl.get('alias').value) {
                    tplFormGroups[index].controls['alias'].setErrors({ 'unique': true, emitEvent: true, });
                    tplFormGroups[index].controls['alias'].markAsTouched({ self: true});
                    tplFormGroups[i].controls['alias'].setErrors({ 'unique': true, emitEvent: true });
                    tplFormGroups[i].controls['alias'].markAsTouched({self: true});
                    this.cdRef.markForCheck();
                    return;
                }
            }
            // form is valid, move on
            // first update state of this form, call one fill will update all the list
            // const selControl = this.getSelectedControl(index);
            this.updateState(selControl, false);
            let aliasInfo: any = {};
            // newly add db filter
            if (selControl.get('isNew').value === 1 && selControl.get('mode').value === 'auto') {
                setTimeout(() => {
                    this.interCom.requestSend({
                        action: 'UpdateTplAlias',
                        payload: {
                            vartag: selControl.getRawValue(),
                            aliasInfo: null,
                            insert: 1
                        }
                    });
                });
            } else {
                for (let i = 0; i < this.originAlias.length; i++) {
                    const rowControl = tplFormGroups[i];
                    if (this.originAlias[i] !== undefined && this.originAlias[i] !== rowControl.get('alias').value) {
                        let tmpObj = {
                            oAlias: this.originAlias[i],
                            nAlias: rowControl.get('alias').value
                        };
                        const tagk = rowControl.get('tagk').value;
                        if (!aliasInfo[tagk]) {
                            aliasInfo[tagk] = [];
                        }
                        aliasInfo[tagk].push(tmpObj);
                    }
                }
                if (Object.keys(aliasInfo).length > 0) {
                    setTimeout(() => {
                        this.interCom.requestSend({
                            action: 'UpdateTplAlias',
                            payload: {
                                vartag: null,
                                aliasInfo: aliasInfo,
                                insert: 0
                            }
                        });
                    });
                }
            }
            this.originAlias = [];
        }
    }

    onInputBlur(cname: string, index: number) {
        const selControl = this.getSelectedControl(index);
        const val = selControl['controls'][cname].value;
        // set delay to avoid blur excute before onSelect
        if (cname === 'tagk' && val !== '') {
            this.tagBlurTimeout = setTimeout(() => {
                    this.removeCustomTagFiler(index, val);
                    this.autoSetAlias(selControl, index);
            }, 300);
        }
        if (cname === 'display') {
            if (selControl.invalid) { return; }
            // to check filter again return list
            this.tagValueBlurTimeout = setTimeout(() => {
                let idx = -1;
                if (val === '') {
                    selControl.get('filter').setValue('', { eventEmit: true});
                    selControl.get('display').setValue('');
                } else {
                    const res = this.tplVariables.editTplVariables.tvars[index].filter.match(/^regexp\((.*)\)$/);
                    if ((res && res[1] === val) || (!res && this.tplVariables.editTplVariables.tvars[index].filter === val)) {
                        // no changes
                        selControl.get('filter').setValue(this.tplVariables.editTplVariables.tvars[index].filter, { emitEvent: false});
                    } else {
                        if (this.filteredValueOptions[index]) {
                            idx = this.filteredValueOptions[index].findIndex(item => item && item === val);
                        }
                        if (idx === -1) {
                            selControl.get('filter').setValue('regexp(' + val.replace(/\s/g, ".*") + ')', { emitEvent: true });
                            selControl.get('display').setValue(val);
                        } else {
                            selControl.get('filter').setValue(this.filteredValueOptions[index][idx], { emitEvent: true });
                        }
                    }
                }
                if (this.tplVariables.editTplVariables.tvars[index].filter !== selControl.get('filter').value) {
                    this.updateState(selControl);
                }
                this.filteredValueOptions[index] = [];
            }, 300);
        }
        if (cname === 'alias') {
            this.handleAliasChanges(selControl, index);
        }
    }

    handleAliasChanges(selControl: AbstractControl, index: number) {
        if (selControl.get('tagk').value !== '') {
            if (this.originAlias[index] && this.originAlias[index] !== selControl.get('alias').value) {
                this.validateAlias(selControl.get('alias').value, index, selControl, this.originAlias);
            }
        }
    }

    removeCustomTagFiler(index: number, currentTagk: string) {
        const selControl = this.getSelectedControl(index);
        const prevFilter = this.tplVariables.editTplVariables.tvars[index];
        // if control is valid and the key is different
        if (selControl.valid && prevFilter && currentTagk !== prevFilter.tagk) {
            selControl.get('filter').setValue('', { emitEvent: false });
            selControl.get('applied').setValue(0);
            selControl.get('isNew').setValue(1);
            // remove this tag out of widget if any
            this.interCom.requestSend({
                action: 'RemoveCustomTagFilter',
                payload: prevFilter
            });
            this.updateState(selControl, false);
        }
    }

    // update state if it's is valid
    selectTagKeyOption(event: any, index: number) {
        if (this.tagBlurTimeout) {
            clearTimeout(this.tagBlurTimeout);
        }
        const selControl = this.getSelectedControl(index);
        this.removeCustomTagFiler(index, event.option.value);
        this.autoSetAlias(selControl, index);
    }
    // helper funtion to auto set alias name
    autoSetAlias(selControl: AbstractControl, index: number) {
        const tagk = selControl.get('tagk').value;
        let possibleAlias = [];
        for (let i = 1; i < 10; i++) {
            possibleAlias.push(tagk + i);
        }
        let aliases = [];
        for (let i = 0; i < this.tplVariables.editTplVariables.tvars.length; i++) {
            const tvar = this.tplVariables.editTplVariables.tvars[i];
            aliases.push(tvar.alias);
        }
        const matchKeys = aliases.filter(a => a.substring(0, tagk.length) === tagk);
        if (matchKeys.length === 0) {
            if (selControl.get('alias').value === '') {
                selControl.get('alias').setValue(tagk);
            }
        } else {
            if (selControl.get('alias').value === '') {
                for (let i = 0; i < possibleAlias.length; i++) {
                    if (!matchKeys.includes(possibleAlias[i])) {
                        selControl.get('alias').setValue(possibleAlias[i]);
                        break;
                    }
                }
            }
        }
        this.validateAlias(selControl.get('alias').value, index, selControl, this.originAlias);
    }
    // update state if it's is valid
    selectFilterValueOption(event: any, index: number) {
        // unsubscribe if exists to keep list as new
        const name = this.mode.view ? 'view' : 'edit';
        if (this.trackingSub.hasOwnProperty(name + index)) {
            this.trackingSub[name + index].unsubscribe();
        }
        this.filteredValueOptions[index] = [];
        if ( this.tagValueBlurTimeout ) {
            clearTimeout(this.tagValueBlurTimeout);
        }
        if ( this.tagValueFocusTimeout ) {
            clearTimeout(this.tagValueFocusTimeout);
        }
        const display = this.getDisplay(event.option.value);
        this.tplVariables.editTplVariables.tvars[index].display = display;
        const selControl = this.getSelectedControl(index);
        selControl.get('display').setValue(display, { eventEmit: false });
        selControl.get('filter').setValue(event.option.value, { eventEmit: false });
        if (this.tplVariables.editTplVariables.tvars[index].filter !== event.option.value) {
            this.updateState(selControl);
        }
    }

    selectVarValueOption(event: any, index: number) {
        // unsubscribe if exists to keep list as new
        const name = this.mode.view ? 'view' : 'edit';
        if (this.trackingSub.hasOwnProperty(name + index)) {
            this.trackingSub[name + index].unsubscribe();
        }
        this.filteredValueOptions[index] = [];
        if ( this.tagValueViewBlurTimeout ) {
            clearTimeout(this.tagValueViewBlurTimeout);
        }
        if ( this.tagValueViewFocusTimeout ) {
            clearTimeout(this.tagValueViewFocusTimeout);
        }
        this.isSecondBlur = true;
        this.focusEl.nativeElement.focus();
        // handle the display for view form
        // while select this, we need to update the display
        const display = this.getDisplay(event.option.value);
        this.tplVariables.viewTplVariables.tvars[index].display = display;
        const selControl = this.getSelectedControl(index, 'listVariables');
        selControl.get('display').setValue(display, { eventEmit: false });
        selControl.get('filter').setValue(event.option.value, { eventEmit: false });
        // the event is matAutocomplete event, we deal later to clear focus
        if (this.tplVariables.viewTplVariables.tvars[index].filter !== event.option.value) {
            this.tplVariables.viewTplVariables.tvars[index].filter = event.option.value;
            setTimeout(() => {
                this.interCom.requestSend({
                    action: 'ApplyTplVarValue',
                    payload: [this.tplVariables.viewTplVariables.tvars[index]]
                });
            });
        }
    }

    deleteTemplateVariable(index: number) {
        const control = <FormArray>this.editForm.controls['formTplVariables'];
        const selControl = control.at(index);
        control.removeAt(index);
        // check in case they delete the one that not in state yet
        // then nothing need to do, just remove from form.
        if (this.tplVariables.editTplVariables.tvars[index]) {
            const removedItem = this.tplVariables.editTplVariables.tvars[index];
            // removing an item, then we should check the current editTplVariable
            // to find item to remove and it's the index.
            // let it runs in next tick to unlock UI
            setTimeout(() => {
                this.interCom.requestSend({
                    action: 'RemoveCustomTagFilter',
                    payload: removedItem
                });
            });
            // we already trigger all widget update to requery from RemoveCustomTagFilter
            this.updateState(selControl, false);
        }
    }

    done() {
        setTimeout(() => {
            this.modeChange.emit({ view: true });
        });
    }

    updateState(selControl: AbstractControl, reQuery: boolean = true) {
        if (selControl.valid) {
            const sublist = [];
            for (let i = 0; i < this.formTplVariables.controls.length; i++) {
                if (this.formTplVariables.controls[i].valid) {
                    sublist.push(this.formTplVariables.controls[i].value);
                }
            }
            // update db filters state.
            this.updateTplVariableState(this.utils.deepClone(this.selectedNamespaces), sublist);
            // we might need to run widgets which are affected by this tag
            if (reQuery) {
                setTimeout(() => {
                    this.interCom.requestSend({
                        action: 'ApplyTplVarValue',
                        payload: [selControl.value]
                    });
                });
            }
        }
    }

    // quickly update the namespace with add/remove namespace with valid one
    updateNamespaceState() {
        const sublist = [];
        for (let i = 0; i < this.formTplVariables.controls.length; i++) {
            if (this.formTplVariables.controls[i].valid) {
                sublist.push(this.formTplVariables.controls[i].value);
            }
        }
        // update db filters state.
        this.updateTplVariableState(this.utils.deepClone(this.selectedNamespaces), sublist);
    }

    calculateVariableDisplayWidth(item: FormGroup, options: any) {
        let minSize = (options && options.minSize) ? options.minSize : '50px';
        const filter = item.get('display').value;
        const alias = item.get('alias').value;
        const fontFace = 'Ubuntu';
        const fontSize = 14;

        let inputWidth, prefixWidth, suffixWidth;

        // input only (value)
        if (options && options.inputOnly && options.inputOnly === true) {
            // tslint:disable-next-line: max-line-length
            inputWidth = (!filter || filter.length === 0) ? minSize : (this.utils.calculateTextWidth(filter, fontSize, fontFace) + 40) + 'px';
            return inputWidth;
            // prefix only (alias)
        } else if (options && options.prefixOnly && options.prefixOnly === true) {
            // tslint:disable-next-line: max-line-length
            prefixWidth = (!alias || alias.length === 0) ? minSize : (this.utils.calculateTextWidth(alias, fontSize, fontFace) + 40) + 'px';
            return prefixWidth;
            // else, calculate both
        } else {
            // tslint:disable-next-line: radix
            minSize = parseInt(minSize);
            inputWidth = (!filter || filter.length === 0) ? minSize : this.utils.calculateTextWidth(filter, fontSize, fontFace);
            prefixWidth = this.utils.calculateTextWidth(alias, fontSize, fontFace);
            // suffix is the reset icon
            suffixWidth = (filter.length > 0) ? 32 : 0;
            // 40 is padding and such
            return (prefixWidth + inputWidth + suffixWidth + 40) + 'px';
        }
    }

    addFilterToAll(index: number) {
        // add filter to all
        this.switchFilterMode('auto', index, false);
    }

    removeFilterFromAll(index: number) {
        // remove filter from all
        const control = <FormArray>this.editForm.controls['formTplVariables'];
        const removeTvar = control.at(index);
        if (removeTvar.valid) {
            // remove this tag out of widget if there
            setTimeout(() => {
                this.interCom.requestSend({
                    action: 'RemoveCustomTagFilter',
                    payload: removeTvar.value
                });
            });
            // we already trigger all widget update to requery from RemoveCustomTagFilter
            removeTvar.get('applied').setValue(0);
            this.updateState(removeTvar, false);
        }
    }

    switchFilterMode(mode: string, index: number, updateMode: boolean = true) {
        const selControl = this.getSelectedControl(index);
        if (updateMode) {
            selControl.get('mode').setValue(mode);
        }
        // quickly to update the mode.
        this.updateState(selControl, false);
        if (mode === 'auto') {
            if (selControl.valid) {
                // when mode is from manual to auto, we will reapply all of them
                this.interCom.requestSend({
                    action: 'UpdateTplAlias',
                    payload: {
                        vartag: selControl.value,
                        originAlias: [],
                        index: index,
                        insert: 1
                    }
                });
            } else {
                selControl.get('isNew').setValue(1);
            }
        } else { // set to manual mode
            selControl.get('isNew').setValue(0);
        }
        // this.cdRef.detectChanges();
    }

    addNamespace(namespace) {
        if (!this.selectedNamespaces.includes(namespace)) {
            this.selectedNamespaces.push(namespace);
            this.interCom.requestSend({
                action: 'UpdateTagKeysByNamespaces',
                payload: this.selectedNamespaces
            });
            this.updateNamespaceState();
        }
    }

    removeNamespace(namespace) {
        const index = this.selectedNamespaces.indexOf(namespace);
        if (!this.dbNamespaces.includes(namespace) && index !== -1) {
            this.selectedNamespaces.splice(index, 1);
            this.updateNamespaceState();
            if (this.selectedNamespaces.length > 0) {
                this.interCom.requestSend({
                    action: 'UpdateTagKeysByNamespaces',
                    payload: this.selectedNamespaces
                });
            } else {
                this.tagKeysByNamespaces = [];
            }
        }
    }

    updateTplVariableState(namespaces: string[], tvars: any[]) {
        this.interCom.requestSend({
            action: 'updateTemplateVariables',
            payload: {
                namespaces: namespaces,
                tvars: tvars
            }
        });
    }

    addToScope(val: string, index: number) {
        if (!this.tagScope.includes(val)) {
            this.tagScope.push(val);
            this.scopeModify = true;
            this.cdRef.markForCheck();
        }
    }

    removeFromScope(val: string, index: number) {
        // const idx = this.tplVariables.editTplVariables.tvars[index].scope.indexOf(val);
        const idx = this.tagScope.indexOf(val);
        if (idx > -1) {
            // this.tplVariables.editTplVariables.tvars[index].scope.splice(idx, 1);
            this.tagScope.splice(idx, 1);
            this.scopeModify = true;
            this.cdRef.markForCheck();
        }
    }

    toggleExcludeFromScope(val: string, index: number) {
        // by puutting ! infront of exlude value
        const valStrip = val.charAt(0) === '!' ? val.substr(1) : val;
        const idx = this.tagScope.indexOf(val);
        if (idx > -1) {
            this.tagScope[idx] = this.tagScope[idx].charAt(0) === '!' ? valStrip : '!' + valStrip;
            this.scopeModify = true;
            this.cdRef.markForCheck();
        }
    }

    scopeClose(index: number) {
        this.tagValueSearchInputControl.setValue('', {emitEvent: false});
        this.tagValueSearch = [];
        this.scopeIndex = -1;
        const selControl = this.getSelectedControl(index);
        selControl.get('scope').setValue(this.tagScope);
        if (this.scopeModify) {
            this.scopeCache[index] = [];
            this.scopeModify = false;
        }
        this.updateState(selControl, false);
    }
    scopeOpen(index: number) {
        this.scopeIndex = index;
        this.tagScope = this.tplVariables.editTplVariables.tvars[index].scope ? this.tplVariables.editTplVariables.tvars[index].scope : [];
        this.cdRef.markForCheck();
        this.tagValueSearchInputControl.setValue('');
    }
/*
    resetFilterValue(event: any, index: number) {
        event.stopPropagation();
        event.preventDefault();
        this.listVariables.controls[index].get('filter').setValue('');
        const control = <FormArray>this.listForm.controls['listVariables'];
        const selControl = control.at(index);
        // if it's a different value from viewlist
        if (this.tplVariables.viewTplVariables.tvars[index].filter !== selControl.get('filter').value) {
            this.tplVariables.viewTplVariables.tvars[index].filter = selControl.get('filter').value;
            this.interCom.requestSend({
                action: 'ApplyTplVarValue',
                payload: [selControl.value]
            });
        }
    }
  */
    // DragDrop Table reorder event
    dropTable(event: any) {
        // console.log('DROP TABLE EVENT', event);
        // move item within the controls array
        moveItemInArray(this.formTplVariables['controls'], event.previousIndex, event.currentIndex);

        // extract variables values from form
        // const values = this.formTplVariables.getRawValue();

        // Copy values over to the view side of the variables
        // this.tplVariables.viewTplVariables.tvars = [...values];

        // need a control to pass to update state. Just going to grab the first one
        const selControl = this.getSelectedControl(0);
        this.updateState(selControl, false);
    }

    dragStart(cdkEvent: CdkDragStart, index: number) {
        // console.log('DRAG START', cdkEvent, index);
        // get size of the element we are dragging
        const sourceElCoords = cdkEvent.source.element.nativeElement.getBoundingClientRect();
        // synchronize the width of the placeholder with the dragged element
        this.placeholderStyles = { width: (sourceElCoords.width - 6) + 'px', height: '49px', transform: 'translate3d(0px,0px,0px)' };
    }

    ngOnDestroy() {
        for (const sub in this.trackingSub) {
            if (this.trackingSub.hasOwnProperty(sub) && this.trackingSub[sub] instanceof Subscription) {
                this.trackingSub[sub].unsubscribe();
            }
        }
        if (this.tagValueScopeSub) {
            this.tagValueScopeSub.unsubscribe();
        }
    }
    get listVariables(): FormArray {
        return this.listForm.get('listVariables') as FormArray;
    }
    get formTplVariables(): FormArray {
        return this.editForm ? this.editForm.get('formTplVariables') as FormArray : new FormArray([]);
    }
}
