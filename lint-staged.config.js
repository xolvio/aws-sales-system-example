module.exports = {
  "packages/**/*.{t,j}s": ["eslint --cache --fix", "jest --findRelatedTests"],
  "package.json": ["sort-package-json"],
  "packages/*/package.json": ["sort-package-json"],
};
