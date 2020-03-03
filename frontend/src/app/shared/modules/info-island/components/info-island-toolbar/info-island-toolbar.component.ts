import {
    AfterViewInit,
    Component,
    EmbeddedViewRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
    Input
} from '@angular/core';
import { InfoIslandService } from '../../services/info-island.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'info-island-toolbar',
    templateUrl: './info-island-toolbar.component.html',
    styleUrls: []
})
export class InfoIslandToolbarComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('toolbarPlaceholder') toolbarTmplRef;

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
