import { Injectable } from '@angular/core';

@Injectable()
export class CommonService {
  round(number: number, total: number = 0): number {
    if (total){
        number = number/total;
    }
    return Math.round(number * 100) / 100;
  }
}

