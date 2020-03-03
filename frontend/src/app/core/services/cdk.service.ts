import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Portal, TemplatePortal } from '@angular/cdk/portal';

@Injectable({
    providedIn: 'root'
})
export class CdkService {

    private navbarPortalHostSubject: BehaviorSubject<TemplatePortal<any>>;

    get navbarPortal$() {
        return this.navbarPortalHostSubject.asObservable();
    }

    setNavbarPortal(portal: TemplatePortal<any>) {
        this.navbarPortalHostSubject.next(portal);
    }

    // constructor
    constructor() {
        this.navbarPortalHostSubject = new BehaviorSubject(null);
    }
}
