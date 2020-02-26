import { Component, OnInit, OnDestroy, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'conditional-formatter',
  templateUrl: './conditional-formatter.component.html',
  styleUrls: ['./conditional-formatter.component.scss']
})
export class ConditionalFormatterComponent implements OnInit, OnDestroy {
  @HostBinding('class.conditional-formatter') private _hostClass = true;
  @Input() conditions: any = [];
  @Output() conditionChange = new EventEmitter();

  operators: Array<any> = [
    {
        label: '>',
        value: 'gt'
    },
    {
        label: '>=',
        value: 'ge'
    },
    {
        label: '<',
        value: 'lt'
    },
    {
        label: '<=',
        value: 'le'
    }
  ];

  conditionChanges$: BehaviorSubject<boolean>;
  conditionChangeSub: Subscription;
  constructor() { }

  ngOnInit() {
    if ( !this.conditions || !this.conditions.length ) {
      this.conditions = [];
      this.addCondition();
    }
    this.conditionChanges$ = new BehaviorSubject(false);

    this.conditionChangeSub = this.conditionChanges$
                                        .subscribe( trigger => {
                                            if ( trigger ) {
                                              this.conditionChange.emit(this.conditions);
                                            }
                                        });
  }

  setOperator(e, index) {
    this.conditions[index].operator = e.value;
    this.conditionChanges$.next(true);
  }
  selectColor(color,index ) {
    this.conditions[index].color = color.hex;
    this.conditionChanges$.next(true);
  }

  setValue(e, index) {
    this.conditions[index].value = e.srcElement.value.length ? Number(e.srcElement.value) : '';
    this.conditionChanges$.next(true);
  }

  addCondition() {
    this.conditions.push({'operator': 'gt', value: '', color:'#da001b'});
  }

  removeCondition(index) {
    this.conditions.splice(index, 1);
    this.conditionChanges$.next(true);
  }
  ngOnDestroy() {
    this.conditionChangeSub.unsubscribe();
  }
}
