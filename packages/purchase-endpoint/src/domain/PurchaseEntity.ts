import { generateId } from "@sales/shared/src/generateId";

export class PurchaseEntity {
  constructor(
    public userId: string,
    public isSuccess: boolean,
    public purchaseId: string = generateId()
  ) {}
}
