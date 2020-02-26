import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'alert-details-transitions',
  templateUrl: './alert-details-transitions.component.html',
  styleUrls: []
})
export class AlertDetailsTransitionsComponent implements OnInit {

  constructor() { }

  @Input() showWarn: boolean;
  @Input() showComposite: boolean;
  @Input() showUnknown: boolean;

  @Input() readMode: boolean;

  @Input() selectedTransitions;
  @Input() enabledTransitions;

  @Output() newEnabledTransitions = new EventEmitter();

  transitionToLabel = {
    'GoodToBad' : 'Good to Bad',
    'BadToGood' : 'Bad to Good',
    'WarnToGood' : 'Warn to Good',
    'WarnToBad' : 'Warn to Bad',
    'GoodToWarn' : 'Good to Warn',
    'BadToWarn' : 'Bad to Warn',
    'WarnToWarn' : 'Warn to Warn',
    'BadToBad' : 'Bad to Bad',
    'BadToUnknown' : 'Bad to Unknown',
    'UnknownToBad' : 'Unknown to Bad',
    'GoodToUnknown' : 'Good to Unknown',
    'UnknownToGood' : 'Unknown to Good',
    'WarnToUnknown' : 'Warn to Unknown',
    'UnknownToWarn' : 'Unknown to Warn'
  };

  baseTransitions = ['GoodToBad', 'BadToGood'];
  warnTransitions = ['WarnToGood', 'WarnToBad', 'GoodToWarn', 'BadToWarn'];
  compositeTransitions = ['WarnToWarn', 'BadToBad'];
  unknownTransitions = ['BadToUnknown', 'UnknownToBad', 'GoodToUnknown', 'UnknownToGood'];
  warnUnknownTransitions = ['WarnToUnknown', 'UnknownToWarn'];

  possibleTransitions = [];

  ngOnInit() {

    if (!this.selectedTransitions) {
      this.selectedTransitions = [];
    }

    if (!this.enabledTransitions) {
      this.enabledTransitions = [];
    }

    this.addTransitions(this.baseTransitions);

    if (this.showWarn) {
      this.addTransitions(this.warnTransitions);
    }

    if (this.showComposite) {
      this.addTransitions(this.compositeTransitions);
    }

    if (this.showUnknown) {
      this.addTransitions(this.unknownTransitions);
    }

    if (this.showWarn && this.showUnknown) {
      this.addTransitions(this.warnUnknownTransitions);
    }
  }

  addTransitions(transitions) {
    for (const transition of transitions) {
      this.possibleTransitions.push(transition);
    }
  }

  isEnabled(transition): boolean {
    return this.enabledTransitions.includes(transition);
  }

  isSelected(transition): boolean {
    return this.selectedTransitions.includes(transition);
  }

  selectionChanged(transition) {
    this.toggleTransition(transition);
    this.newEnabledTransitions.emit(this.selectedTransitions);
  }

  toggleTransition(transition) {
    if (this.isSelected(transition)) {
      for (let i = 0; i < this.selectedTransitions.length; i++) {
        if (this.selectedTransitions[i] === transition) {
          this.selectedTransitions.splice(i, 1);
        }
      }
    } else {
      this.selectedTransitions.push(transition);
    }
  }

}
