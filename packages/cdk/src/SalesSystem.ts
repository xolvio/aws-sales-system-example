/* eslint-disable no-new */
import { App, Stack } from "@aws-cdk/core";
import { runAfter } from "cdk-typescript-tooling";
import { createPurchasesHistoryTable } from "./createPurchasesHistoryTable";
import { AvailableLambdas, AvailableTables } from "./AvailableDependencies";
import {
  ToolkitFunction,
  addLambdas,
  addTables,
} from "./TypeScriptFunctionWrapper";

const createPurchaseEndpoints = (scope: Stack) => {
  new ToolkitFunction(scope, AvailableLambdas.STATUS, {
    entry: require.resolve(
      "@sales/purchase-endpoint/src/purchase-status/purchase-status-handler.ts"
    ),
    addDependencies: [addTables(AvailableTables.PURCHASES_HISTORY)],
    withHttp: true,
  });

  new ToolkitFunction(scope, AvailableLambdas.PURCHASE_ACTION, {
    entry: require.resolve(
      "@sales/purchase-endpoint/src/purchase-action/purchase-action-handler.ts"
    ),
    addDependencies: [
      addTables(AvailableTables.PURCHASES_HISTORY),
      addLambdas(AvailableLambdas.PAYMENT_SERVICE),
    ],
  });

  new ToolkitFunction(scope, AvailableLambdas.PURCHASE_ENDPOINT, {
    entry: require.resolve(
      "@sales/purchase-endpoint/src/purchase-endpoint/handler.ts"
    ),
    addDependencies: [
      addLambdas(AvailableLambdas.PURCHASE_ACTION, AvailableLambdas.STATUS),
    ],
    withHttp: true,
  });
};

function createPaymentService(scope: Stack) {
  new ToolkitFunction(scope, AvailableLambdas.PAYMENT_SERVICE, {
    entry: require.resolve("@sales/payment-service/src/handler.ts"),
  });
}

export class SalesSystem extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    createPaymentService(this);
    createPurchaseEndpoints(this);
    createPurchasesHistoryTable(this);
    runAfter();
  }
}
