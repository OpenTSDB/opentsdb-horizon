import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '../material/material.module';

import { TimeRangePickerComponent } from './components/time-range-picker/time-range-picker.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { KeypadComponent } from './components/keypad/keypad.component';
import { DatepickerComponent } from './components/date-picker-2/datepicker.component';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  declarations: [
      TimePickerComponent,
      TimeRangePickerComponent,
      KeypadComponent,
      DatepickerComponent
  ],
  providers: [],
  exports: [
    TimePickerComponent,
    DatepickerComponent
  ]
})
export class DateTimePickerModule { }
