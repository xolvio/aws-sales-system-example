import { generateId } from "../helpers/generateId";

export class PurchaseEntity {
  constructor(
    public userId: string,
    public isSuccess: boolean,
    public purchaseId: string = generateId()
  ) {}
}
