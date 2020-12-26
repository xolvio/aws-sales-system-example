import { CloudWatchLogsDecodedData, CloudWatchLogsHandler } from "aws-lambda";
import zlib from "zlib";

export const handler: CloudWatchLogsHandler = async (event, context) => {
  const compressedPayload = Buffer.from(event.awslogs.data, "base64");
  const jsonPayload = zlib.gunzipSync(compressedPayload).toString("utf8");
  const parsed: CloudWatchLogsDecodedData = JSON.parse(jsonPayload);
  console.log(parsed);
};
