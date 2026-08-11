/** Convert snake_case keys to camelCase recursively (API wire format). */
export function toCamelCaseKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCaseKeys(item)) as T;
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    // Leave Date and Buffer-like values alone; plain objects get key-mapped.
    if (Buffer.isBuffer(value)) {
      return value as T;
    }

    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, nested]) => [snakeToCamel(key), toCamelCaseKeys(nested)]);

    return Object.fromEntries(entries) as T;
  }

  return value as T;
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}
