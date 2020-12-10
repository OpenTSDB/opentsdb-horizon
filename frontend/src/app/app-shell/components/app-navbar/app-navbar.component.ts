import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';

import { Router, NavigationStart } from '@angular/router';

import { CdkService } from '../../../core/services/cdk.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.scss']
})
export class AppNavbarComponent implements OnInit {

    @HostBinding('class.app-navbar') private _hostClass = true;

    // tslint:disable-next-line:no-inferrable-types
    @Input() mediaQuery: string = '';

    @Input() theme: string;
    @Output() themeChange = new EventEmitter<string>();

    @Output() sidenavToggle: EventEmitter<any> = new EventEmitter();

    snapshot = false;

    constructor(
        private router: Router,
        public cdkService: CdkService
    ) { }

    ngOnInit() { 
        this.router.events.subscribe((event) => {
            if ( event instanceof NavigationStart ) {
                this.snapshot = event.url.indexOf('snap') === 1;
            }
          });
    }

    toggleSidenav() {
        this.sidenavToggle.emit(true);
    }

}
