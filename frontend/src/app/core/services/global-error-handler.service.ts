import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService extends ErrorHandler {
  constructor() {
    super();
  }
  handleError(error: any) {
    super.handleError(error);
    alert(`Error occurred:${error.message}`);
  }
}