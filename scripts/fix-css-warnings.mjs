#!/usr/bin/env node
/**
 * One-shot CSS cleanup for VS Code / Microsoft Edge Tools warnings.
 *
 * Safe, mechanical transforms only:
 *   1. Ensure any `-webkit-<prop>: value;` line is placed *before* its
 *      unprefixed `<prop>: value;` counterpart inside the same rule block.
 *   2. Remove `-webkit-overflow-scrolling: touch;` lines — the property is
 *      deprecated and is no longer supported by any current browser engine
 *      (iOS Safari 13+ handles momentum scrolling natively).
 *   3. Remove `text-wrap: pretty;` declarations — unsupported by Firefox,
 *      Safari, and older Chrome. `text-wrap: balance` (used elsewhere) is
 *      kept intact; this only strips the `pretty` value lines.
 *
 * The script is intentionally conservative and operates line-by-line; it
 * never reorders or rewrites any CSS it does not explicitly target.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const targets = [
  resolve(root, "src/index.css"),
  resolve(root, "src/ii-mobile-fixes.css"),
];

const prefixRe = /^(\s*)-webkit-([a-z-]+)\s*:\s*([^;]+);\s*$/i;
const plainRe = (prop) =>
  new RegExp(`^(\\s*)${prop}\\s*:\\s*([^;]+);\\s*$`, "i");

const overflowScrollingRe = /^\s*-webkit-overflow-scrolling\s*:\s*touch\s*;\s*$/i;
const textWrapPrettyRe = /^\s*text-wrap\s*:\s*pretty\s*;\s*$/i;

function reorderPrefixFirst(lines) {
  // If the unprefixed property appears immediately before its -webkit- variant,
  // swap them so the prefixed one comes first.
  for (let i = 0; i < lines.length - 1; i++) {
    const next = lines[i + 1];
    const m = next.match(prefixRe);
    if (!m) continue;
    const prop = m[2];
    if (plainRe(prop).test(lines[i])) {
      const a = lines[i];
      lines[i] = lines[i + 1];
      lines[i + 1] = a;
    }
  }
  return lines;
}

let totalRemoved = 0;
let totalReordered = 0;

for (const file of targets) {
  const original = readFileSync(file, "utf8");
  const originalLines = original.split(/\r?\n/);

  // 1. Strip deprecated / unsupported lines.
  const kept = [];
  let removed = 0;
  for (const line of originalLines) {
    if (overflowScrollingRe.test(line) || textWrapPrettyRe.test(line)) {
      removed += 1;
      continue;
    }
    kept.push(line);
  }

  // 2. Reorder prefix-before-standard where applicable.
  const before = kept.join("\n");
  const reordered = reorderPrefixFirst(kept.slice());
  const after = reordered.join("\n");

  // Count how many swaps happened (cheap diff estimate).
  let reorderCount = 0;
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i] !== kept[i]) reorderCount += 1;
  }
  reorderCount = Math.floor(reorderCount / 2);

  if (removed > 0 || reorderCount > 0) {
    // Preserve trailing newline if present.
    const trailing = original.endsWith("\n") ? "\n" : "";
    writeFileSync(
      file,
      after.replace(/\n+$/, "") + trailing,
      "utf8"
    );
  }

  totalRemoved += removed;
  totalReordered += reorderCount;

  console.log(
    `[fix-css-warnings] ${file}: removed ${removed} deprecated lines, reordered ${reorderCount} prefix pairs`
  );
}

console.log(
  `[fix-css-warnings] done — ${totalRemoved} lines removed, ${totalReordered} pairs reordered`
);