import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';
import { MatSnackBar } from '@angular/material';



// import { WidgetLoaderComponent } from '../widget-loader/widget-loader.component';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'landing-page-content',
    templateUrl: './landing-page-content.component.html',
    styleUrls: []
})
export class LandingPageContentComponent implements OnInit, OnDestroy {
    @HostBinding('class.landing-page-content') private _hostClass = true;

    /** Local variables */

    // TODO: this should be in user profile somewhere
    // tslint:disable-next-line:no-inferrable-types
    showHero: boolean = true;

    // Search query string
    // tslint:disable-next-line:no-inferrable-types
    searchQuery: string = '';

    // Selected search context
    // tslint:disable-next-line:no-inferrable-types
    searchContext: string = 'dashboard';

    // options for the search context dropdown menu in the search field
    fakeSearchContextOptions: Array<any> = [
        {
            label: 'Dashboards',
            value: 'dashboard'
        },
        {
            label: 'Namespaces',
            value: 'namespace'
        },
        {
            label: 'Metrics',
            value: 'metric'
        },
        {
            label: 'Users',
            value: 'user'
        }
    ];

    // AutoSuggest
    // TODO: Replace this with empty array that gets filled out by result from service call
    fakeQuerySuggestions: Array<any> = [
        {
            label: 'suggestion label 1'
        },
        {
            label: 'suggestion label 2'
        },
        {
            label: 'suggestion label 3'
        },
        {
            label: 'suggestion label 4'
        },
        {
            label: 'suggestion label 5'
        },
        {
            label: 'suggestion label 6'
        },
        {
            label: 'suggestion label 7'
        },
        {
            label: 'suggestion label 8'
        },
        {
            label: 'suggestion label 9'
        },
        {
            label: 'suggestion label 10'
        }
    ];

    /** Form Group */
    searchFormGroup: FormGroup;
    routeQueryParamsSub: Subscription;

    constructor(
        // private dbService: DashboardService,
        private interCom: IntercomService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.createSearchForm();
        this.routeQueryParamsSub = this.route.queryParams.subscribe(params => {
            // console.log("comes in router params....", params)
            if (params['db-delete']) {
                this.snackBar.open('Dashboard has been deleted.', '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    duration: 5000,
                    panelClass: 'info'});
            }
        });
    }

    createSearchForm() {
        this.searchFormGroup = this.fb.group({
            searchQuery: new FormControl(this.searchQuery),
            searchContext: new FormControl(this.searchContext)
        });
    }

    closeHero() {
        // close the hero
        this.showHero = false;
    }

    createDashboard() {
        this.router.navigate(['d', '_new_']);
    }

    // TODO: Get this link to yamas guide to work
    gotoYamasGuide() {
        alert('TODO: get link to yamas/horion guide');
    }

    /** AUTO SUGGESTION */

    /**
     * * If user hits enter, the input is valid and that option must exist in the list
     */
    queryKeydown(event: any) {
        this.searchQuery = this.searchFormGroup.get('searchQuery').value;
    }
    /**
     * * Event fired when an autocomplete option is selected
     */
    querySuggestOptionSelected(event: any) {
        this.searchQuery = event.option.value;
    }

    ngOnDestroy() {
        this.routeQueryParamsSub.unsubscribe();
    }

}
