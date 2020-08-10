import { NgModule } from '@angular/core';
import {
    TtMouseListenerDirective,
    TtBoundaryListenerDirective
} from './directives';

@NgModule({
  imports: [],
  declarations: [
    TtMouseListenerDirective,
    TtBoundaryListenerDirective
  ],
  exports: [
    TtMouseListenerDirective,
    TtBoundaryListenerDirective
  ]
})
export class UniversalDataTooltipDirectivesModule { }
