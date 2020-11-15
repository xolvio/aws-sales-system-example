import { httpGet } from "../helpers/httpGet";

const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;

export const paymentCall = (userId: string) => {
  return httpGet(`${paymentServiceUrl}?userId=${userId}`);
};
