const iShouldFail = () => {
  return Math.random() > 0.5;
};
export const heavyAndFlakyProcessing = async (userId: string) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (iShouldFail()) {
        reject(new Error(`No luck this time for ${userId}`));
      } else {
        resolve(`Great success for ${userId}!`);
      }
    }, 50);
  });
