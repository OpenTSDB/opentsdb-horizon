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
    AfterViewInit,
    Component,
    EmbeddedViewRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { InfoIslandService } from '../../services/info-island.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'info-island-toolbar',
    templateUrl: './info-island-toolbar.component.html',
    styleUrls: ['./info-island-toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InfoIslandToolbarComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('toolbarPlaceholder', { static: true }) toolbarTmplRef;

    @Input() customClass = '';

    private disposeFn: () => void;
    private viewRef: EmbeddedViewRef<{}>;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private islandService: InfoIslandService
    ) { }

    ngOnInit() { }

    ngAfterViewInit(): void {
        // render the view
        this.viewRef = this.viewContainerRef.createEmbeddedView(
            this.toolbarTmplRef
        );
        this.viewRef.detectChanges();

        // get island window toolbar ref
        const toolbarRef = this.islandService.islandToolbarRef;

        // attach the view to the window toolbar ref
       toolbarRef.insert(this.viewRef);

        // register a dispose fn we can call later
        // to remove the content from the DOM again
        this.disposeFn = () => { };
    }

    ngOnDestroy(): void {
        const index = this.viewContainerRef.indexOf(this.viewRef);
        if (index !== -1) {
            this.viewContainerRef.remove(index);
        }
    }

}
