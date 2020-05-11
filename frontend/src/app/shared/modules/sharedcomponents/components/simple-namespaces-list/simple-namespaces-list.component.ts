import {
    Component,
    OnInit,
    HostBinding
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'simple-namespaces-list',
  templateUrl: './simple-namespaces-list.component.html'
})
export class SimpleNamespacesListComponent implements OnInit {

    @HostBinding('class.widget-panel-content') private _hostClass = true;
    @HostBinding('class.simple-namespaces-list') private _componentClass = true;

  constructor() { }

  ngOnInit() {
  }

}
