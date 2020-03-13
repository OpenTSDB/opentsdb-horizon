import { Injectable } from '@angular/core';
import * as d3 from 'd3';

export type D3 = typeof d3;

@Injectable({
  providedIn: 'root'
})
export class D3Service {

  constructor() { }

  public getD3(): D3 {
    return d3;
  }
}