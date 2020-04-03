import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-page-content',
    templateUrl: './user-page-content.component.html',
    styleUrls: ['./user-page-content.component.scss']
})
export class UserPageContentComponent implements OnInit, OnDestroy {

    // Subscriptions
    private subscription: Subscription = new Subscription();

    userid: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.subscription.add(this.route.paramMap.subscribe(params => {
            this.userid = params.get('userid');
        }));
    }

    ngOnDestroy() {

    }

}
