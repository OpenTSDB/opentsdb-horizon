import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[navigatorPanelItem]'
})
export class NavigatorPanelItemDirective {

  constructor(
    public tpl: TemplateRef<any>
  ) { }

}
