const { existsSync } = require('node:fs');
const { join } = require('node:path');

function getPackageSearchPaths(packageName) {
  return require.resolve.paths(packageName) || [];
}

function isPackageInstalled(packageName, searchPaths = getPackageSearchPaths(packageName)) {
  return searchPaths.some((searchPath) => existsSync(join(searchPath, packageName, 'package.json')));
}

function createMissingPackageError(packageName) {
  const error = new Error(
    [
      `Missing npm package: ${packageName}`,
      '',
      'Run `npm install` in the project folder before starting the bot.',
      'If installation failed earlier, fix that npm error first and then run `npm install` again.',
    ].join('\n')
  );
  error.code = 'MISSING_NPM_PACKAGE';
  return error;
}

function ensureInstalledPackages(packageNames) {
  for (const packageName of packageNames) {
    if (!isPackageInstalled(packageName)) {
      throw createMissingPackageError(packageName);
    }
  }
}

function requireInstalledPackage(packageName) {
  ensureInstalledPackages([packageName]);

  return require(packageName);
}

module.exports = {
  createMissingPackageError,
  ensureInstalledPackages,
  isPackageInstalled,
  requireInstalledPackage,
};
