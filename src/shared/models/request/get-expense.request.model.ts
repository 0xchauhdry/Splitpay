import { FilterRequest } from "../common/filter-request.model";

export class GetExpenseRequest extends FilterRequest{
  involved: boolean = false;
  deleted: boolean = false;
}
