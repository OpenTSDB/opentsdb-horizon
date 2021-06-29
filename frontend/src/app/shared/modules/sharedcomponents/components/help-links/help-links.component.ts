import { Component, OnInit, HostBinding } from '@angular/core';
import { AppConfigService } from '../../../../../core/services/config.service';


@Component({
  selector: 'help-links',
  templateUrl: './help-links.component.html',
  styleUrls: ['./help-links.component.scss']
})
export class HelpLinksComponent implements OnInit {
  @HostBinding('class.help-links') private _hostClass = true;

  links = [];

  constructor(private appConfig: AppConfigService) { }

  ngOnInit() {
    const helpLinks = this.appConfig.getConfig().helpLinks;
    this.links = helpLinks ? helpLinks : [];
  }

}
