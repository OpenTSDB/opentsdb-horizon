
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../shared/modules/material/material.module';
import { SharedcomponentsModule } from '../../../shared/modules/sharedcomponents/sharedcomponents.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

export const UNIVERSAL_CLIPBOARD_TESTING_IMPORTS = [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedcomponentsModule,
    FlexLayoutModule
];

export const UNIVERSAL_CLIPBOARD_SERVICES_TESTING_IMPORTS = [
    HttpClientTestingModule,
];
