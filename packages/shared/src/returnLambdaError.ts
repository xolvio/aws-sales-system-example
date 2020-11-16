import { StatusCodes } from "http-status-codes";

export const returnLambdaError = (
  message: string,
  statusCode = StatusCodes.SERVICE_UNAVAILABLE
) => ({
  statusCode,
  body: JSON.stringify({ message }),
});
