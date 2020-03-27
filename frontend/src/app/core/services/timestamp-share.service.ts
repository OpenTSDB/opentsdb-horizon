import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimestampShareService {

  constructor() { }

  private timestamp: number = -1;

  clear() {
    this.timestamp = -1;
  }

  setTimestamp(ts: number) {
    this.timestamp = ts;
    console.log('* in setter', ts);
  }

  getTimestamp() {
    return this.timestamp;
  }

}
