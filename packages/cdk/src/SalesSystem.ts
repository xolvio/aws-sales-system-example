/* eslint-disable no-new */
import * as lambda from "@aws-cdk/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigateway";
import * as apiGateway2 from "@aws-cdk/aws-apigatewayv2";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { App, CfnOutput, Stack } from "@aws-cdk/core";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { PurchasesHistoryTableDefinition } from "@sales/purchase-endpoint/src/domain/purchases-history-table-definition";
import { NodejsFunction } from "../webpackLambdaBundle";

const createPurchaseEndpoint = (scope: Stack, paymentServiceUrl: string) => {
  const cfn = new dynamodb.CfnTable(scope, "Purchases", {
    ...PurchasesHistoryTableDefinition,
  });

  const table = dynamodb.Table.fromTableAttributes(scope, "Purchases-Table", {
    tableArn: cfn.attrArn,
  });

  const handle = new NodejsFunction(scope, "Purchase-Endpoint", {
    entry: require.resolve("@sales/purchase-endpoint/src/handler.ts"),
    runtime: lambda.Runtime.NODEJS_12_X,
    environment: {
      PAYMENT_SERVICE_URL: paymentServiceUrl,
      PURCHASES_HISTORY: table.tableName,
    },
  });

  table.grantReadWriteData(handle);

  const httpApi = new HttpApi(scope, "PurchaseHttpApi", {
    defaultIntegration: new apiGateway2.LambdaProxyIntegration({
      handler: handle,
    }),
  });

  new CfnOutput(scope, "purchaseUrl", {
    value: httpApi.url,
  });

  new CfnOutput(scope, "purchaseFunctionName", {
    value: handle.functionName,
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
    createPurchaseEndpoint(this, paymentServiceUrl);
  }
}
