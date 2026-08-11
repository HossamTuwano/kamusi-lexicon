"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCamelCaseKeys = toCamelCaseKeys;
/** Convert snake_case keys to camelCase recursively (API wire format). */
function toCamelCaseKeys(value) {
    if (Array.isArray(value)) {
        return value.map((item) => toCamelCaseKeys(item));
    }
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        // Leave Date and Buffer-like values alone; plain objects get key-mapped.
        if (Buffer.isBuffer(value)) {
            return value;
        }
        const entries = Object.entries(value)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, nested]) => [snakeToCamel(key), toCamelCaseKeys(nested)]);
        return Object.fromEntries(entries);
    }
    return value;
}
function snakeToCamel(key) {
    return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
