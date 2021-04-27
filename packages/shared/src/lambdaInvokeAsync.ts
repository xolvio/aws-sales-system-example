import AWS from "aws-sdk";

export const lambdaInvokeAsync = (
  FunctionName: string,
  payload: Record<string, unknown>
) => {
  const lambda = new AWS.Lambda();

  if (!FunctionName) {
    return Promise.reject(new Error("Please provide a name"));
  }

  const parameters = {
    FunctionName,
    InvocationType: "Event",
    Payload: JSON.stringify(payload),
  };

  return lambda.invoke(parameters).promise();
};
