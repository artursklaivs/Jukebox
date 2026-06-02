const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

const { createMissingPackageError, isPackageInstalled } = require('../src/dependencies');

test('isPackageInstalled detects packages in supplied node_modules paths', () => {
  const root = mkdtempSync(join(tmpdir(), 'jukebox-deps-'));
  const nodeModules = join(root, 'node_modules');
  const packageDir = join(nodeModules, 'whatsapp-web.js');

  try {
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(join(packageDir, 'package.json'), '{"name":"whatsapp-web.js"}');

    assert.equal(isPackageInstalled('whatsapp-web.js', [nodeModules]), true);
    assert.equal(isPackageInstalled('qrcode-terminal', [nodeModules]), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('createMissingPackageError explains how to install missing npm packages', () => {
  const error = createMissingPackageError('whatsapp-web.js');

  assert.equal(error.code, 'MISSING_NPM_PACKAGE');
  assert.match(error.message, /Missing npm package: whatsapp-web\.js/);
  assert.match(error.message, /npm install/);
});
