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
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-debug-dialog',
  templateUrl: './debug-dialog.component.html',
  styleUrls: ['./debug-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DebugDialogComponent implements OnInit {
    log: any;

    constructor(
        public dialogRef: MatDialogRef<DebugDialogComponent>,
        private domSanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public dialogData: any
    ) {

      this.log = '<table>';
      var i = 0;
      dialogData.log.forEach(element => {
          if (i++ % 2 == 0) {
            this.log += '<tr bgcolor="#f6f5fa"><td>';
          } else {
            this.log += '<tr><td>';
          }
          this.log += element.replace(/\n/g, '<br>');
          this.log += '</td></tr>';
      });
      this.log += '</table>';
      this.log = domSanitizer.bypassSecurityTrustHtml(this.log);
    }

    ngOnInit() {
    }

    copyText() {
      let listener = (e: ClipboardEvent) => {
        let clipboard = e.clipboardData || window["clipboardData"];
        clipboard.setData("text", JSON.stringify(this.dialogData));
        e.preventDefault();
      };

      document.addEventListener("copy", listener, false)
      document.execCommand("copy");
      document.removeEventListener("copy", listener, false);
    }

}

