import { Injectable } from '@angular/core';

@Injectable()
export class CommonService {
  static round(number: number, total: number = 0): number {
    if (total){
        number = number/total;
    }
    return Math.round(number * 100) / 100;
  }

  static setStartDate(date: string | Date): Date{
    return new Date(new Date(date).setHours(0, 0, 0))
  }

  static setEndDate(date: string | Date): Date{
    return new Date(new Date(date).setHours(23, 59, 59))
  }
}

