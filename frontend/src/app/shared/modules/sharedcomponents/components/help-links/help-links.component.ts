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
            { label: 'Admin guide', href: 'https://git.vzbuilders.com/pages/monitoring/yamas_userguide_2.0/' },
            { label: 'File a ticket', href: 'https://jira.vzbuilders.com/secure/CreateIssueDetails!init.jspa?pid=10503&issuetype=10100&priority=10300' },
            { label: 'Talk to us', icon: 'd-slack', href: 'https://vzbuilders.slack.com/archives/C6PJGN58S' },
            { label: 'Release notes', href: 'https://git.vzbuilders.com/pages/monitoring/yamas-guide/release_notes/horizon/' },
            { label: 'Recommented dashboards', href : 'https://git.vzbuilders.com/pages/monitoring/yamas-guide/recommended/' }
        ];
  constructor() { }

  ngOnInit() {
  }

}
