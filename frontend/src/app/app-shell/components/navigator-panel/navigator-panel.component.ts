import {
    AfterViewInit,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';

import { NavigatorPanelItemDirective } from '../../directives/navigator-panel-item.directive';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '.navigator-panel-item'
})
// tslint:disable-next-line:directive-class-suffix
export class NavigatorPanelItemElement {
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'navigator-panel',
    templateUrl: './navigator-panel.component.html',
    styleUrls: ['./navigator-panel.component.scss']
})
export class NavigatorPanelComponent implements AfterViewInit {

    @HostBinding('class.navigator-panel') private _hostClass = true;
    @HostBinding('style.width') private panelWidth = '300px';

    @ContentChildren(NavigatorPanelItemDirective) items: QueryList<NavigatorPanelItemDirective>;
    @ViewChildren(NavigatorPanelItemElement, { read: ElementRef }) private itemElements: QueryList<ElementRef>;
    @ViewChild('navigatorPanel') private panel: ElementRef;

    @Input() timing = '200ms cubic-bezier(0.250, 0.460, 0.450, 0.940)';

    private player: AnimationPlayer;
    // tslint:disable-next-line:no-inferrable-types
    private currentSlide: number = 0;
    // tslint:disable-next-line:no-inferrable-types
    private itemWidth: number = 300;

    panelWrapperStyle = {
        width: '300px'
    };

    constructor(
        private builder: AnimationBuilder
    ) { }

    ngAfterViewInit() {
        if (this.items.length > 0) {
            this.currentSlide = this.items.length - 1;
            const tmpOffset = this.currentSlide * this.itemWidth;
            this.panel.nativeElement.style.transform = `translateX(-${tmpOffset}px)`;
        }
    }

    goNext(isDone?: any) {
        // console.log('%cGO NEXT', 'background-color: blue; color: white; padding: 4px;');

        if (this.currentSlide + 1 === this.items.length) { return; }

        this.currentSlide = (this.currentSlide + 1) % this.items.length;

        const offset = this.currentSlide * this.itemWidth;

        const myAnimation: AnimationFactory = this.buildAnimation(offset);

        this.player = myAnimation.create(this.panel.nativeElement);
        this.player.onDone(() => {
            if (isDone) {
                isDone();
            }
        });
        this.player.play();
    }

    goBack(isDone?: any) {
        if (this.currentSlide === 0) { return; }

        this.currentSlide = ((this.currentSlide - 1) + this.items.length) % this.items.length;

        const offset = this.currentSlide * this.itemWidth;

        const myAnimation: AnimationFactory = this.buildAnimation(offset);

        this.player = myAnimation.create(this.panel.nativeElement);
        this.player.onDone(() => {
            if (isDone) {
                isDone();
            }
        });
        this.player.play();
    }

    shiftTo(idx: any, fromIdx: any, isDone?: any) {
        if (this.currentSlide === 0) { return; }

        const tmpOffset = (fromIdx - 1) * this.itemWidth;
        this.panel.nativeElement.style.transform = `translateX(-${tmpOffset}px)`;

        this.currentSlide = idx;
        const offset = this.currentSlide * this.itemWidth;

        /*console.group('%cSHIFT TO', 'background-color: purple; color: white; padding: 4px;');
        console.log('idx', idx);
        console.log('from', fromIdx);
        console.log('tmpOffset', tmpOffset);
        console.log('offset', offset);
        console.groupEnd();*/

        const myAnimation: AnimationFactory = this.buildAnimation(offset);

        this.player = myAnimation.create(this.panel.nativeElement);
        this.player.onDone(() => {
            if (isDone) {
                isDone();
            }
        });
        this.player.play();

    }

    startAt(idx: any) {
        this.currentSlide = idx;
        const tmpOffset = this.currentSlide * this.itemWidth;
        this.panel.nativeElement.style.transform = `translateX(-${tmpOffset}px)`;
    }

    resetTo(idx: any, isDone?: any) {
        // console.log('PANEL RESET TO', idx);
        this.currentSlide = idx;
        const offset = this.currentSlide * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset, true);

        this.player = myAnimation.create(this.panel.nativeElement);
        this.player.onDone(() => {
            if (isDone) {
                isDone();
            }
        });
        this.player.play();
    }

    /** Privates */

    private buildAnimation(offset, immediate: boolean = false) {
        // console.log('%cOFFSET', 'background-color: purple; color: white; padding: 4px;', offset);
        return this.builder.build([
            animate((immediate) ? 0 : this.timing, style({ transform: `translateX(-${offset}px)` }))
        ]);
    }

}
