import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

@Injectable()
export class DashboardCanDeactivateGuardService implements CanDeactivate<DashboardComponent> {

    canDeactivate(component: DashboardComponent): boolean {
        if (component.isDashboardDirty()) {
            return confirm('Are you sure you want to discard your changes?');
        }
        return true;
    }
}
