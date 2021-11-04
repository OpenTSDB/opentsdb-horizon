import { Component, HostBinding, HostListener, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { RightDrawerService } from '../../services/right-drawer.service';
import * as _moment from 'moment';


@Component({
  selector: 'right-drawer',
  templateUrl: './right-drawer.component.html',
  styleUrls: ['./right-drawer.component.scss'],
  animations: [
    trigger('toggleDrawer', [
        state('closed', style({
            'width': '0'
        })),
        state('opened', style({
            width: '100%'
        })),
        transition('closed <=> opened', animate(300))
    ])
]
})
export class RightDrawerComponent implements OnInit, OnDestroy {

  private drawerState: string = 'closed';
  private subscription = new Subscription();
  params: any = {};

  @HostBinding('class.clipboard-drawer') private _hostClass = true;

  // binds the animation to the host component
  @HostBinding('@toggleDrawer') get getToggleDrawer(): string {
      return this.drawerState === 'closed' ? 'closed' : 'opened';
  }

  get getDrawerState() {
      return this.drawerState;
  }

  constructor(private drawerSrv: RightDrawerService) {  }

  ngOnInit() {
    console.log("123456 right-drawer loaded");
    // drawer open or closed
    this.subscription.add(this.drawerSrv.drawerState$.subscribe(val => {
      console.log("123456 right drawer sub value=", val);
      this.drawerState = val;
    }));

    this.subscription.add(this.drawerSrv.drawerParams$.subscribe(val => {
      console.log("123456 right drawer selected module=", val);
      this.params = val;
    }));
  }

  getTime() {
    return Date.now();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
