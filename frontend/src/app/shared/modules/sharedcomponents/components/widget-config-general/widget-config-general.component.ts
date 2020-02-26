import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'widget-config-general',
    templateUrl: './widget-config-general.component.html',
    styleUrls: []
})
export class WidgetConfigGeneralComponent implements OnInit, OnDestroy {
    @HostBinding('class.widget-config-tab') private _hostClass = true;
    @HostBinding('class.general-configuration') private _tabClass = true;

    /** Inputs */
    @Input() widget: any;

    /** Outputs */
    @Output() widgetChange = new EventEmitter;

    /** Local variables */
    formGroups: FormGroup;
    formGroupSub: Subscription;

    constructor(private fb: FormBuilder ) { }

    ngOnInit() {
        this.formGroups = this.fb.group({
            title: new FormControl(this.widget.settings.title, [Validators.required]),
            description: new FormControl(this.widget.settings.description)
        });

        this.formGroupSub = this.formGroups.valueChanges.subscribe( data => {
            this.widgetChange.emit( {action: 'SetMetaData', payload: {data: data} } );
        });
    }

    ngOnDestroy() {
        this.formGroupSub.unsubscribe();
    }

}
