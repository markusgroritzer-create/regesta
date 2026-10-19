// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Validator for the published procedure schema (schema/v0.1). Used by the tests in M0
// and later by the publication step, which must not publish an invalid document.

import { readdirSync, readFileSync } from 'node:fs';
import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js';
import formatsPlugin from 'ajv-formats';

export const SCHEMA_VERSION = '0.1';
export const SCHEMA_DIR = new URL(`../schema/v${SCHEMA_VERSION}/`, import.meta.url);
export const PROCEDURE_SCHEMA_ID = `https://regesta.io/schema/v${SCHEMA_VERSION}/procedure.schema.json`;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function loadSchemas(): Record<string, unknown>[] {
  return readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith('.schema.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(new URL(f, SCHEMA_DIR), 'utf8')) as Record<string, unknown>);
}

// Annotation keywords starting with "x-" carry vocabularies and notes; they never affect validation.
function annotationKeywords(schemas: Record<string, unknown>[]): string[] {
  const found = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith('x-')) found.add(key);
        walk(value);
      }
    }
  };
  schemas.forEach(walk);
  return [...found].sort();
}

export function createValidator(): (doc: unknown) => ValidationResult {
  const schemas = loadSchemas();
  const ajv = new Ajv2020({ strict: true, strictTypes: false, strictRequired: false, allErrors: true, allowUnionTypes: true });
  // ajv-formats is CommonJS; the plugin function is also exposed as its "default" property.
  formatsPlugin.default(ajv);
  for (const keyword of annotationKeywords(schemas)) ajv.addKeyword({ keyword });
  for (const schema of schemas) ajv.addSchema(schema);
  const validate = ajv.getSchema(PROCEDURE_SCHEMA_ID);
  if (!validate) throw new Error(`schema ${PROCEDURE_SCHEMA_ID} not found in ${SCHEMA_DIR.pathname}`);
  return (doc: unknown): ValidationResult => {
    const valid = validate(doc) as boolean;
    return { valid, errors: valid ? [] : (validate.errors ?? []).map(formatError) };
  };
}

function formatError(e: ErrorObject): string {
  return `${e.instancePath || '/'} ${e.message ?? e.keyword}${e.params ? ' ' + JSON.stringify(e.params) : ''}`;
}
