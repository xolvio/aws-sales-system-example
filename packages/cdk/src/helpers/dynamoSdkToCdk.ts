/* eslint-disable no-param-reassign,@typescript-eslint/ban-ts-comment,@typescript-eslint/ban-types */
import _ from "lodash";

function deCapitalizeFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function replaceKeysDeep(obj: object | unknown[]) {
  // @ts-ignore
  return _.transform(obj, function (
    result: { [key: string]: unknown },
    value: string | object,
    key: string
  ) {
    const currentKey = deCapitalizeFirstLetter(key);

    if (_.isArray(value)) {
      result[currentKey] = (value as any[]).map((v: any[]) =>
        replaceKeysDeep(v)
      );
    } else if (_.isObject(value)) {
      result[currentKey] = replaceKeysDeep(value as object);
    } else if (currentKey !== "streamEnabled") {
      result[currentKey] = value;
    }
  });
}

export const dynamoSdkToCdk = (sdkVersion: object) =>
  replaceKeysDeep(sdkVersion);

// console.log(
//   JSON.stringify(dynamoSdkToCdk(PurchasesHistoryTableDefinition), null, 2)
// );
