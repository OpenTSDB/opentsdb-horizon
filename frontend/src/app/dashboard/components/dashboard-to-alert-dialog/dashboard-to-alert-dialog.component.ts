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
import { Component, OnInit, Inject, HostBinding, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dashboard-to-alert-dialog',
  templateUrl: './dashboard-to-alert-dialog.component.html',
  styleUrls: ['./dashboard-to-alert-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardToAlertDialogComponent implements OnInit, AfterViewInit {
  @HostBinding('class.dashboard-to-alert-dialog') private _hostClass = true;


  constructor(private _focusMonitor: FocusMonitor, public dialogRef: MatDialogRef<DashboardToAlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
                if (data.namespaces) {
                  this.namespaces = data.namespaces;
                }
              }

  namespaces: string[] = [];

  ngOnInit() { }

   ngAfterViewInit() { // remove focus from first button
    this._focusMonitor.stopMonitoring(document.getElementById('ns0'));
}

  nsSelected(ns) {
    this.dialogRef.close( {namespace : ns} );
  }

  canceled() {
    this.dialogRef.close( {canceled : true } );
  }

}
