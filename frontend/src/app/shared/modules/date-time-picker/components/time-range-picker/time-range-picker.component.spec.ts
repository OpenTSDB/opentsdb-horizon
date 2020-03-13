// import { async, fakeAsync, ComponentFixture, TestBed, tick } from '@angular/core/testing';
// import { Component, NgModule, ViewChild, DebugElement } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { By } from '@angular/platform-browser';
// import { Moment } from 'moment';
// import * as momentNs from 'moment';
// const moment = momentNs;

// import { ISelectedTime } from '../../models/models';
// import { TimeRangePickerComponent } from './time-range-picker.component';
// import { DatePickerComponent } from '../date-picker/date-picker.component';
// import { DayTimeCalendarComponent } from '.././day-time-calendar/day-time-calendar.component';
// import { DayCalendarComponent } from '.././day-calendar/day-calendar.component';
// import { MonthCalendarComponent } from '.././month-calendar/month-calendar.component';
// import { CalendarNavComponent } from '.././calendar-nav/calendar-nav.component';

// import { DayTimeCalendarService } from '.././day-time-calendar/day-time-calendar.service';
// import { DayCalendarService } from '.././day-calendar/day-calendar.service';
// import { MonthCalendarService } from '.././month-calendar/month-calendar.service';
// import { TimeSelectService } from '.././time-select/time-select.service';
// import { UtilsService } from '../../services/utils.service';
// import { DatePickerService } from '.././date-picker/date-picker.service';

// describe('TimeRangePickerComponent', () => {
//   let component: TimeRangePickerComponent;
//   let fixture:   ComponentFixture<TimeRangePickerComponent>;
//   let startTime: DatePickerComponent;
//   let presets = ["1y", "3mo", "6w", "1mo", "7d", "4d", "2d", "24h", "12h", "6h", "1h", "year", "quarter", "month", "week", "day"];
//   let futureDateError = "Future not allowed";
//   let validationError = "Invalid Date";

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [FormsModule],
//       declarations: [TimeRangePickerComponent, DayTimeCalendarComponent, DayCalendarComponent, MonthCalendarComponent, CalendarNavComponent, DatePickerComponent],
//       providers: [DayTimeCalendarService, DayCalendarService, MonthCalendarService, TimeSelectService, UtilsService, DatePickerService]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TimeRangePickerComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should have all presets with correct name and presetClicked call', fakeAsync( () => {
//     let spy = spyOn(component, "presetClicked");

//     presets.forEach(function(preset: string) {
//       fixture.detectChanges();
//       let btn = fixture.debugElement.query(By.css("#button-" + preset));
//       expect(btn.nativeElement.textContent).toEqual(preset);

//       btn.triggerEventHandler('click', null);
//       tick();
//       fixture.detectChanges();
//       if(preset.match(/^\d/)){ preset = "-" + preset; }

//       expect(spy).toHaveBeenCalledWith(preset);
//     });
//   }));

//   it('should have 2 calendars that display seperately', fakeAsync(() => {
//     const de: DebugElement = fixture.debugElement;

//     const startCalendarDe = de.query(By.css("#daytimePickerStart"));
//     const startCalendar: HTMLElement = startCalendarDe.nativeElement;
//     expect(startCalendar).toBeDefined();

//     const endCalendarDe = de.query(By.css("#daytimePickerEnd"));
//     const endCalendar: HTMLElement = endCalendarDe.nativeElement;
//     expect(endCalendar).toBeDefined();

//     var spyCloseCall = spyOn(component.endTimeReference.api, "close");
//     fixture.detectChanges();
//     startCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     expect(spyCloseCall).toHaveBeenCalled();

//     spyCloseCall= spyOn(component.startTimeReference.api, "close");
//     fixture.detectChanges();
//     endCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     expect(spyCloseCall).toHaveBeenCalled();
  
//   }));

//   it('should have default values', () => {
//     expect(component).toBeTruthy();
//     expect(component.options.startTimePlaceholder).toEqual("-1h (or m, d, w, mo, q, y)");
//     expect(component.options.endTimePlaceholder).toEqual("now");
//     expect(component.options.startDateFormatError).toEqual(validationError);
//     expect(component.options.endDateFormatError).toEqual(validationError);
//     expect(component.startTimeReference.inputElementValue).toEqual("-1h");
//     expect(component.endTimeReference.inputElementValue).toEqual("now");
//   });

//   it('should set timestamps to user-readable format', () => {
//     component.setStartTime("1523903992");
//     component.setEndTime("1");
//     expect(component.startTimeReference.inputElementValue).toEqual("04/16/2018 11:39 am");
//     expect(component.endTimeReference.inputElementValue).toEqual("12/31/1969 04:00 pm");
//   });

//   it('should set user-readable format as user-readable format', () => {
//     component.setStartTime("04/16/2018 11:39 am");
//     component.setEndTime("12/31/1969 04:00 pm");
//     expect(component.startTimeReference.inputElementValue).toEqual("04/16/2018 11:39 am");
//     expect(component.endTimeReference.inputElementValue).toEqual("12/31/1969 04:00 pm");
//   });

//   // TODO: user types in relative time or unix timestamp and clicks on calendar
//   // it('clicking on a relative time on the calendar should change to absolute time',fakeAsync(() => {

//   //   // let expectedStart = moment().startOf('year').unix().toString();
//   //   // component.setStartTime("year");
//   //   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   //   startCalendarDe.triggerEventHandler('click', null);
//   //   tick();
//   //   fixture.detectChanges();
  
//   //   let selectedDayDe = fixture.debugElement.query(By.css("dp-day-calendar dp-selected"));
//   //   expect(selectedDayDe).toBeTruthy();

//   // }));


//   it('should set relative format as relative format', () => {
//     component.setStartTime("-2d");
//     component.setEndTime("-1h");
//     expect(component.startTimeReference.inputElementValue).toEqual("-2d");
//     expect(component.endTimeReference.inputElementValue).toEqual("-1h");
//   });

//   it('should replace the start and end times when preset is clicked', fakeAsync(() => {
//     component.setStartTime("-1h");
//     component.setEndTime("-2d");
//     let btn = fixture.debugElement.query(By.css("#button-week"));
//     btn.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     expect(component.startTimeReference.inputElementValue).toEqual("week");
//     expect(component.endTimeReference.inputElementValue).toEqual("now");
//   }));

//   it('should have the apply button not appear, appear, then disappear for start time', fakeAsync(() => {
//     let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//     let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeNull();

//     startCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeDefined();

//     applyBtn.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeNull();

//   }));

//   it('should have the apply button appear and disappear for end time', fakeAsync(() => {
//     let endCalendarDe = fixture.debugElement.query(By.css("#daytimePickerEnd"));
//     endCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeDefined();

//     applyBtn.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeNull();
//   }));

//   it('should have the apply button disappear when clicking a preset', fakeAsync(() => {
//     let endCalendarDe = fixture.debugElement.query(By.css("#daytimePickerEnd"));
//     endCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeDefined();

//     let presetBtn = fixture.debugElement.query(By.css("#button-1y"));
//     presetBtn.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();
//     applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     expect(applyBtn).toBeNull();
//   }));

//   it('should emit the time when clicking a preset (which is year)', fakeAsync(() => {
//       let preset = "1y";
//       fixture.detectChanges();
//       let btn = fixture.debugElement.query(By.css("#button-" + preset));
//       expect(btn).toBeTruthy();

//       let _selectedTime: ISelectedTime;
//       component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
    
//       let expectedEnd = moment().unix().toString();
//       let expectedStart = moment().subtract(1, "year").unix().toString();

//       btn.triggerEventHandler('click', null);
//       tick();
//       fixture.detectChanges();

//       expect(_selectedTime.startTimeDisplay).toEqual("-" + preset);
//       expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//       expect(_selectedTime.endTimeDisplay).toEqual("now");
//       expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);

//   }));

//   it('should emit the time for month', fakeAsync(() => {

//     let expectedStart = moment().subtract(1, "month").unix().toString();
//     component.setStartTime("-1Mo");
//     let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//     startCalendarDe.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();

//     let _selectedTime: ISelectedTime;
//     component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//     let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//     applyBtn.triggerEventHandler('click', null);
//     tick();
//     fixture.detectChanges();

//     expect(_selectedTime.startTimeUnix).toEqual(expectedStart);

// }));

// it('should emit the time for week', fakeAsync(() => {

//   let expectedStart = moment().subtract(6, "week").unix().toString();
//   component.setStartTime("-6week");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);

// }));

// it('should emit the time for day', fakeAsync(() => {

//   let expectedStart = moment().subtract(2, "day").unix().toString();
//   component.setStartTime("-2d");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);

// }));

// it('should emit the time for hour', fakeAsync(() => {

//   let expectedStart = moment().subtract(3, "hour").unix().toString();
//   component.setStartTime("-3H");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);

// }));

// it('should emit the time for minute', fakeAsync(() => {

//   let expectedStart = moment().subtract(60, "minute").unix().toString();
//   component.setStartTime("-60m");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);

// }));

// it('should emit the time for this year', fakeAsync(() => {

//   let expectedStart = moment().startOf('year').unix().toString();
//   component.setStartTime("year");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
// }));

// it('should emit the time for this quarter', fakeAsync(() => {

//   let expectedStart = moment().startOf('quarter').unix().toString();
//   component.setStartTime("QuArTeR");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
// }));

// it('should emit the time for this month', fakeAsync(() => {

//   let expectedStart = moment().startOf('month').unix().toString();
//   component.setStartTime("MOnth");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
// }));

// it('should emit the time for this week', fakeAsync(() => {

//   let expectedStart = moment().startOf('week').unix().toString();
//   component.setStartTime("wEEk");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
// }));

// it('should emit the time for this day', fakeAsync(() => {

//   let expectedStart = moment().startOf('day').unix().toString();
//   component.setStartTime("DAY");
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
// }));

// it('should emit the time when using relative and unix timestamp', fakeAsync(() => {
//   component.setStartTime("1521319450");
//   component.setEndTime("-1d");

//   let expectedStart = "1521319440";
//   let expectedEnd = moment().subtract(1, "day").unix().toString();

//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.startTimeDisplay).toEqual("03/17/2018 01:44 pm");
//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
//   expect(_selectedTime.endTimeDisplay).toEqual("-1d");
// }));

// it('should emit the time when using relative and unix timestamp', fakeAsync(() => {
//   component.setStartTime("year");
//   component.setEndTime("now");

//   let expectedStart = moment().startOf('year').unix().toString();
//   let expectedEnd = moment().unix().toString();

//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.startTimeDisplay).toEqual("year");
//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
//   expect(_selectedTime.endTimeDisplay).toEqual("now");
// }));

// it('should emit -1hr if no start time', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setStartTime("");
//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   let expectedStart = moment().subtract(1,'hour').unix().toString();
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.startTimeDisplay).toEqual("");
// }));

// it('should emit now if no end time', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setEndTime("");
//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   let expectedEnd = moment().unix().toString();
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
//   expect(_selectedTime.endTimeDisplay).toEqual("");
// }));

// it('should emit -1hr if invalid start time', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setStartTime("blah");
//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   let expectedStart = moment().subtract(1,'hour').unix().toString();
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.startTimeDisplay).toEqual("blah");
// }));

// it('should emit now if invalid end time', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setEndTime("blah");
//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));
//   let expectedEnd = moment().unix().toString();
//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
//   expect(_selectedTime.endTimeDisplay).toEqual("blah");
// }));

// it('should emit opposite unix times if end before start', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setStartTime("-1d");
//   component.setEndTime("-2d");

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));

//   let expectedStart = moment().subtract(2,"day").unix().toString();
//   let expectedEnd = moment().subtract(1,"day").unix().toString();

//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeDisplay).toEqual("-1d");
//   expect(_selectedTime.endTimeDisplay).toEqual("-2d");

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
// }));

// it('should add 2 minutes if duration is 1 minute or less', fakeAsync(() => {
//   let startCalendarDe = fixture.debugElement.query(By.css("#daytimePickerStart"));
//   startCalendarDe.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   component.setStartTime("-1m");
//   component.setEndTime("-2m");

//   let _selectedTime: ISelectedTime;
//   component.timeSelected.subscribe((time: ISelectedTime) => _selectedTime = time);
//   let applyBtn = fixture.debugElement.query(By.css("#button-apply"));

//   let expectedStart = moment().subtract(4,"minute").unix().toString(); 
//   let expectedEnd = moment().subtract(1,"minute").unix().toString();

//   applyBtn.triggerEventHandler('click', null);
//   tick();
//   fixture.detectChanges();

//   expect(_selectedTime.startTimeDisplay).toEqual("-1m");
//   expect(_selectedTime.endTimeDisplay).toEqual("-2m");

//   expect(_selectedTime.startTimeUnix).toEqual(expectedStart);
//   expect(_selectedTime.endTimeUnix).toEqual(expectedEnd);
// }));

// it('should show error for future timestamp', fakeAsync(() => {
//   component.setEndTime(moment().add(1, "day").unix().toString());
//   component.setStartTime(moment().add(1, "day").unix().toString());
//   fixture.detectChanges();

//   let maxDateValidationForStart = fixture.debugElement.query(By.css("#maxDateValidationForStart"));
//   let maxDateValidationForEnd = fixture.debugElement.query(By.css("#maxDateValidationForEnd"));

//   expect(maxDateValidationForStart).toBeTruthy();
//   expect(maxDateValidationForEnd).toBeTruthy();

//   expect(maxDateValidationForStart.nativeElement.textContent.trim()).toEqual(futureDateError);
//   expect(maxDateValidationForEnd.nativeElement.textContent.trim()).toEqual(futureDateError);
// }));

// it('should show error for extreme timestamp', fakeAsync(() => {
//   component.setEndTime("1000000000000");
//   component.setStartTime("1000000000000");
//   fixture.detectChanges();

//   let formatValidationForEnd = fixture.debugElement.query(By.css("#formatValidationForEnd"));
//   let formatValidationForStart = fixture.debugElement.query(By.css("#formatValidationForStart"));
  
//   expect(formatValidationForEnd).toBeTruthy();
//   expect(formatValidationForStart).toBeTruthy();

//   expect(formatValidationForEnd.nativeElement.textContent.trim()).toEqual(validationError);
//   expect(formatValidationForStart.nativeElement.textContent.trim()).toEqual(validationError);
// }));

// it('should show error for extreme relative time', fakeAsync(() => {
//   let relativeTimes = ["m", "h", "d", "w", "mo", "q", "y"];

//   relativeTimes.forEach(function(relativeTime: string) {
//     component.setEndTime("-1000000000000" + relativeTime);
//     component.setStartTime("-1000000000000" + relativeTime);
//     fixture.detectChanges();

//     let formatValidationForEnd = fixture.debugElement.query(By.css("#formatValidationForEnd"));
//     let formatValidationForStart = fixture.debugElement.query(By.css("#formatValidationForStart"));
    
//     expect(formatValidationForEnd).toBeTruthy();
//     expect(formatValidationForStart).toBeTruthy();
  
//     expect(formatValidationForEnd.nativeElement.textContent.trim()).toEqual(validationError);
//     expect(formatValidationForStart.nativeElement.textContent.trim()).toEqual(validationError);
//   });
// }));

// it('should show error for invalid times', fakeAsync(() => {
//   let invalidTimes = ["-0m" , "-m", "-", "m", "13/31/1969 04:00 pm", "13/31/1969 04:00", "12/311969 04:00 pm", "12/31/3000000 04:00 pm"];

//   invalidTimes.forEach(function(invalidTime: string) {
//     component.setEndTime("-1000000000000" + invalidTime);
//     component.setStartTime("-1000000000000" + invalidTime);
//     fixture.detectChanges();

//     let formatValidationForEnd = fixture.debugElement.query(By.css("#formatValidationForEnd"));
//     let formatValidationForStart = fixture.debugElement.query(By.css("#formatValidationForStart"));
    
//     expect(formatValidationForEnd).toBeTruthy();
//     expect(formatValidationForStart).toBeTruthy();
  
//     expect(formatValidationForEnd.nativeElement.textContent.trim()).toEqual(validationError);
//     expect(formatValidationForStart.nativeElement.textContent.trim()).toEqual(validationError);
//   });
// }));

// it('should show error for invalid future times', fakeAsync(() => {

//     component.setEndTime("12/31/3018 04:00 pm");
//     component.setStartTime("12/31/3018 04:00 pm");
//     fixture.detectChanges();

//     let formatValidationForEnd = fixture.debugElement.query(By.css("#maxDateValidationForStart"));
//     let formatValidationForStart = fixture.debugElement.query(By.css("#maxDateValidationForEnd"));
    
//     expect(formatValidationForEnd).toBeTruthy();
//     expect(formatValidationForStart).toBeTruthy();
  
//     expect(formatValidationForEnd.nativeElement.textContent.trim()).toEqual(futureDateError);
//     expect(formatValidationForStart.nativeElement.textContent.trim()).toEqual(futureDateError);
// }));

// });
