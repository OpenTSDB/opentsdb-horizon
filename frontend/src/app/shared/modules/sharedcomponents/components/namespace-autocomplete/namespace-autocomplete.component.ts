/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    AfterContentInit,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    HostBinding,
    HostListener
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, switchMap, skip } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';
import { HttpService } from '../../../../../core/http/http.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'namespace-autocomplete',
    templateUrl: './namespace-autocomplete.component.html',
    styleUrls: []
})

export class NamespaceAutocompleteComponent implements OnInit, OnDestroy {

    @HostBinding('class.namespace-autocomplete-component') private _hostClass = true;

    @Input() value = '';
    @Input() options: any = {};
    @Input() initFocus = false;
    @Output() nschange = new EventEmitter();
    @Output() blur = new EventEmitter();
    @ViewChild('namespaceInput') nsInput: ElementRef;
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;

    visible = false;
    destroy = false;
    filteredNamespaceOptions = [];
    namespaces = [];
    namespaceControl: FormControl;
    selectedNamespace;



    constructor(private httpService: HttpService, private cdRef: ChangeDetectorRef) { }

    ngOnInit() {
        let showFullList = true;
        this.namespaceControl = new FormControl(this.value || '');
        this.namespaceControl.valueChanges
            .pipe(
                debounceTime(100),
            ).subscribe( search => {
                search = search.trim();
                search = search === '' || showFullList ? '.*' : search;
                search = search.replace(/\s+/g, '.*').toLowerCase();
                const regex = new RegExp( search );
                for ( let i = 0; i < this.namespaces.length; i++ ) {
                    this.filteredNamespaceOptions = this.namespaces.filter(d => regex.test(d.toLowerCase()));
                }
                if ( !this.destroy ) {
                    this.cdRef.detectChanges();
                }
                showFullList = false;
            });
        this.httpService.getNamespaces({ search: '' }, this.options.metaSource)
                        .subscribe(res => {
                            this.namespaces = res;
                            this.namespaceControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
                        },
                        err => {
                            this.namespaces = [];
                            this.filteredNamespaceOptions = [];
                        });

        setTimeout(() => {
            this.visible = true;
            if ( this.initFocus ) {
                this.nsInput.nativeElement.focus();
            }
        }, 200);
    }


    namespaceKeydown(event: any) {
        // this fixes issue related to LastPass plugin throwing error
        // see: https://github.com/lastpass/lastpass-cli/issues/428
        //      https://github.com/KillerCodeMonkey/ngx-quill/issues/351#issuecomment-475175743
        event.preventDefault();
        event.stopPropagation();

        const textVal = this.namespaceControl.value;

        // check if the namespace is valid option

        // find index in options
        const checkIdx = this.filteredNamespaceOptions.findIndex(item => textVal.toLowerCase() === item.toLowerCase());

        if (checkIdx >= 0) {
            // set value to the option value (since typed version could be different case)
            this.selectedNamespace = this.filteredNamespaceOptions[checkIdx];
            // emit change
            this.nschange.emit(this.selectedNamespace);
            this.clearInput();
        }
    }

    resetNamespaceList() {
        if ( this.namespaces.length ) {
            this.filteredNamespaceOptions = this.namespaces;
        }
    }

    /**
     * * Event fired when an autocomplete option is selected
     */
    namespaceOptionSelected(event: any) {
        this.selectedNamespace = event.option.value;
        this.nschange.emit(this.selectedNamespace);
        this.clearInput();
    }

    clearInput() {
        if ( this.trigger.panelOpen ) {
            this.trigger.closePanel();
        }
        this.nsInput.nativeElement.blur();
        if ( this.options.resetOnBlur ) {
            this.namespaceControl.setValue(this.value, {emitEvent: false});
        }
    }

    @HostListener('click', ['$event'])
    hostClickHandler(e) {
        e.stopPropagation();
    }

    @HostListener('document:click', ['$event.target'])
    documentClickHandler(target) {
        if (!target.classList.contains('mat-option-text') && this.visible) {
            this.namespaceControl.setValue(this.value, {emitEvent: false});
            this.blur.emit('');
        }
    }

    ngOnDestroy() {
        this.destroy = true;
    }

}
