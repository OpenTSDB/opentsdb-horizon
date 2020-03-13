import { Component, OnInit, HostBinding, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { CdkService } from '../../../core/services/cdk.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: []
})
export class LandingPageComponent implements OnInit {

    @HostBinding('class.landing-page-main') private _hostClass = true;

    // portal templates
    @ViewChild('landingpageNavbarTmpl') landingpageNavbarTmpl: TemplateRef<any>;

    // portal placeholders
    landingpageNavbarPortal: TemplatePortal;

    constructor(private cdkService: CdkService, private router: Router ) {}

    ngOnInit() {
      // setup navbar portal
      this.landingpageNavbarPortal = new TemplatePortal(this.landingpageNavbarTmpl, undefined, {});
      this.cdkService.setNavbarPortal(this.landingpageNavbarPortal);
    }

    createDashboard() {
      this.router.navigate(['dashboard', '_new_']);
    }

}
