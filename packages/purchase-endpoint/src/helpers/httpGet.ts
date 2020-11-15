import https from "https";

export const httpGet = async (
  url: string
): Promise<string | Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    let dataString = "";
    const req = https.get(url, function (res) {
      res.on("data", (chunk) => {
        console.log("chunk", chunk);
        dataString += chunk;
      });
      res.on("end", () => {
        console.log("OK");

        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(dataString));
          } else {
            reject(new Error(JSON.parse(dataString).message));
          }
        } catch (e) {
          resolve(dataString);
        }
      });
    });

    req.on("error", (e) => {
      reject(new Error(`Something went wrong! ${e.message}`));
    });
  });
