import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {

  constructor() { }

  private data: any;
  private message = '';

  clear() {
    this.data = null;
    this.message = '';
  }

  setData(data: any) {
    this.data = data;
  }

  setMessage(message: string) {
    this.message = message;
  }

  getData() {
    return this.data;
  }

  getMessage() {
    return this.message;
  }
}
