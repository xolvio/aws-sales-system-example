/* eslint-disable no-new */
import * as lambda from "@aws-cdk/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigateway";
import * as apiGateway2 from "@aws-cdk/aws-apigatewayv2";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { App, CfnOutput, Stack } from "@aws-cdk/core";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { PurchasesHistoryTableDefinition } from "@sales/purchase-endpoint/src/domain/purchases-history-table-definition";
import { NodejsFunction } from "../webpackLambdaBundle";

const createPurchaseEndpoints = (scope: Stack, paymentServiceUrl: string) => {
  const cfn = new dynamodb.CfnTable(scope, "Purchases", {
    ...PurchasesHistoryTableDefinition,
  });

  const table = dynamodb.Table.fromTableAttributes(scope, "Purchases-Table", {
    tableArn: cfn.attrArn,
  });

  const statusHandle = new NodejsFunction(scope, "Purchase-Status-Endpoint", {
    entry: require.resolve("@sales/purchase-endpoint/src/handler.ts"),
    runtime: lambda.Runtime.NODEJS_12_X,
    environment: {
      PURCHASES_HISTORY: table.tableName,
    },
  });

  const statusApi = new HttpApi(scope, "PurchaseStatusHttpApi", {
    defaultIntegration: new apiGateway2.LambdaProxyIntegration({
      handler: statusHandle,
    }),
  });

  table.grantReadWriteData(statusHandle);

  const purchaseHandle = new NodejsFunction(scope, "Purchase-Endpoint", {
    entry: require.resolve("@sales/purchase-endpoint/src/handler.ts"),
    runtime: lambda.Runtime.NODEJS_12_X,
    environment: {
      PAYMENT_SERVICE_URL: paymentServiceUrl,
      PURCHASES_HISTORY: table.tableName,
      STATUS_URL: statusApi.url,
    },
  });

  table.grantReadWriteData(purchaseHandle);

  const purchaseApi = new HttpApi(scope, "PurchaseHttpApi", {
    defaultIntegration: new apiGateway2.LambdaProxyIntegration({
      handler: purchaseHandle,
    }),
  });

  new CfnOutput(scope, "purchaseUrl", {
    value: purchaseApi.url,
  });

  new CfnOutput(scope, "statusUrl", {
    value: statusApi.url,
  });

  new CfnOutput(scope, "purchaseFunctionName", {
    value: purchaseHandle.functionName,
  });
};

function createPaymentService(scope: Stack) {
  const handle = new NodejsFunction(scope, "Payment-Service", {
    entry: require.resolve("@sales/payment-service/src/handler.ts"),
    runtime: lambda.Runtime.NODEJS_12_X,
  });

  const httpApi = new HttpApi(scope, "PaymentHttpApi", {
    defaultIntegration: new apiGateway2.LambdaProxyIntegration({
      handler: handle,
    }),
  });

  new CfnOutput(scope, "paymentFunctionName", {
    value: handle.functionName,
  });

  return { paymentServiceUrl: httpApi.url };
}

export class SalesSystem extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    const { paymentServiceUrl } = createPaymentService(this);
    createPurchaseEndpoints(this, paymentServiceUrl);
  }
}
