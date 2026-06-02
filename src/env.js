const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

function stripOptionalQuotes(value) {
  const trimmed = value.trim();

  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];

    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripOptionalQuotes(line.slice(separatorIndex + 1));

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      values[key] = value;
    }
  }

  return values;
}

function loadEnv(envPath = resolve(process.cwd(), '.env')) {
  if (!existsSync(envPath)) {
    return {};
  }

  const parsed = parseEnv(readFileSync(envPath, 'utf8'));

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return parsed;
}

module.exports = {
  loadEnv,
  parseEnv,
};
