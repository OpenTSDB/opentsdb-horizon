import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// store
import { NgxsModule } from '@ngxs/store';

// modules
import { MaterialModule } from '../material/material.module';
import { SharedcomponentsModule } from '../sharedcomponents/sharedcomponents.module';

import {
    ClipboardDrawerComponent,
    NavbarClipboardMenuComponent
} from './components';

import { UniversalClipboardState } from './state/clipboard.state';


@NgModule({

  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedcomponentsModule,
    NgxsModule.forFeature([
        // TODO: add clipboard state
        UniversalClipboardState
    ])
  ],
  declarations: [
    ClipboardDrawerComponent,
    NavbarClipboardMenuComponent
  ],
  exports: [
    ClipboardDrawerComponent,
    NavbarClipboardMenuComponent
  ]
})
export class UniversalClipboardModule { }
