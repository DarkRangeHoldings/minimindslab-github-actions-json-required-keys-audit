import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

function fail(message) {
  throw new Error(message);
}

if (typeof payloadRaw !== 'string') fail('INPUT_PAYLOAD must be set');
if (typeof outputPath !== 'string' || outputPath.length === 0) fail('GITHUB_OUTPUT must be set');

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  fail('INPUT_PAYLOAD must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  fail('payload must be an object');
}

if (!Object.prototype.hasOwnProperty.call(parsed, 'value')) fail('payload.value is required');
if (!Object.prototype.hasOwnProperty.call(parsed, 'required')) fail('payload.required is required');

const value = parsed.value;
const required = parsed.required;

if (value === null || typeof value !== 'object' || Array.isArray(value)) {
  fail('payload.value must be a plain object');
}

if (!Array.isArray(required)) fail('payload.required must be an array');

const seen = new Set();
for (let i = 0; i < required.length; i++) {
  const k = required[i];
  if (typeof k !== 'string' || k.length === 0) fail('payload.required must contain non-empty strings');
  if (seen.has(k)) fail('payload.required must contain unique strings');
  seen.add(k);
}

const ownKeys = Object.keys(value);
const present = [];
const missing = [];

for (let i = 0; i < required.length; i++) {
  const k = required[i];
  if (Object.prototype.hasOwnProperty.call(value, k)) present.push(k);
  else missing.push(k);
}

present.sort();
missing.sort();

const result = {
  missing,
  ok: missing.length === 0,
  present
};

appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);