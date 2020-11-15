/* eslint-disable no-param-reassign,@typescript-eslint/ban-ts-comment,@typescript-eslint/ban-types */
import _ from "lodash";
import aws from "aws-sdk";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceKeysDeep(obj: object) {
  // @ts-ignore
  return _.transform(obj, function (
    result: { [key: string]: unknown },
    value: string | object | unknown[],
    key: string
  ) {
    const currentKey = capitalizeFirstLetter(key);

    if (_.isArray(value)) {
      result[currentKey] = (value as any[]).map((v: any[]) =>
        replaceKeysDeep(v)
      );
    } else if (_.isObject(value)) {
      result[currentKey] = replaceKeysDeep(value as object);
    } else {
      result[currentKey] = value;
    }
  });
}

export const dynamoCdkToSdk = (
  sdkVersion: object
): aws.DynamoDB.CreateTableInput => {
  const replaced = replaceKeysDeep(sdkVersion);
  // @ts-ignore
  if (replaced.StreamSpecification) {
    // @ts-ignore
    replaced.StreamSpecification.StreamEnabled = true;
  }
  return replaced as aws.DynamoDB.CreateTableInput;
};
