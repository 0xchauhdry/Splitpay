import { DateRange } from "./date-range.model";

export class FilterRequest{
  pageNumber: number;
  pageSize: number;
  dateRange: DateRange = new DateRange();

  constructor(pageNumber: number, pageSize: number){
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
