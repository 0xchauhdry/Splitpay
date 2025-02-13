import { DateRange } from "../common/date-range.model";
import { Pagination } from "../common/pagination.model";

export class GetExpenseRequest extends Pagination{
  involved: boolean = false;
  dateRange: DateRange = new DateRange();
}
