/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
