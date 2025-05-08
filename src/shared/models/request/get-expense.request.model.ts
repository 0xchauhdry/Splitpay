import { DateRange } from "../common/date-range.model";
import { FilterRequest } from "../common/filter-request.model";

export class GetExpenseRequest extends FilterRequest{
  involved: boolean = false;
}
