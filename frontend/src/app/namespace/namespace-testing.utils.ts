
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../shared/modules/sharedcomponents/sharedcomponents.module';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NamespaceRoutingModule } from './namespace-routing.module';

export const NAMESPACE_TESTING_IMPORTS = [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedcomponentsModule,
    NamespaceRoutingModule
];

