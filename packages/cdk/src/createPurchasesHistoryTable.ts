import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Stack } from "@aws-cdk/core";
import { PurchasesHistoryTableDefinition } from "../../purchase-endpoint/src/domain/purchases-history-table-definition";
import { AvailableTables } from "./AvailableDependencies";
import { registerTable } from "./TypeScriptFunctionWrapper";

export const createPurchasesHistoryTable = (scope: Stack) => {
  const cfn = new dynamodb.CfnTable(scope, "Purchases", {
    ...PurchasesHistoryTableDefinition,
  });

  const table = dynamodb.Table.fromTableAttributes(scope, "Purchases-Table", {
    tableArn: cfn.attrArn,
  });

  registerTable(AvailableTables.PURCHASES_HISTORY, table);
};
