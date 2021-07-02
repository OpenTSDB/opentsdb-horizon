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
import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'help-links',
  templateUrl: './help-links.component.html',
  styleUrls: ['./help-links.component.scss']
})
export class HelpLinksComponent implements OnInit {
  @HostBinding('class.help-links') private _hostClass = true;

  links = [
            { label: 'User guide', href: 'http://yo/yamas-guide' },
            { label: 'File a ticket', href: 'https://jira.vzbuilders.com/secure/CreateIssueDetails!init.jspa?pid=10503&issuetype=10100&priority=10300' },
            { label: 'Talk to us', icon: 'd-slack', href: 'https://vzbuilders.slack.com/archives/C6PJGN58S' },
            { label: 'Release notes', href: 'https://git.vzbuilders.com/pages/monitoring/yamas-guide/release_notes/horizon/' },
            { label: 'Recommented dashboards', href : 'https://git.vzbuilders.com/pages/monitoring/yamas-guide/recommended/' }
        ];
  constructor() { }

  ngOnInit() {
  }

}
