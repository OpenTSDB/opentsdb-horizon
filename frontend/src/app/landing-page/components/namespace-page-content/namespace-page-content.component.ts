import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-namespace-page-content',
    templateUrl: './namespace-page-content.component.html',
    styleUrls: ['./namespace-page-content.component.scss']
})
export class NamespacePageContentComponent implements OnInit {

    // Subscriptions
    private subscription: Subscription = new Subscription();

    nsalias: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.subscription.add(this.route.paramMap.subscribe(params => {
            this.nsalias = params.get('nsalias');
        }));
    }

    ngOnDestroy() {

    }

}
