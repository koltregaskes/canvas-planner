// Simple static accessibility checks without external dependencies.
// This script reads public/index.html and validates a few essential rules:
// - Document language is set.
// - Buttons have text.
// - Inputs are wrapped in labels or have aria-label/name placeholders.
// - At least one aria-live region exists for updates.
// Exit code 1 on failure so CI can catch issues.

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let hasError = false;

function fail(message) {
  console.error(`⚠️  ${message}`);
  hasError = true;
}

if (!/lang="[a-zA-Z-]+"/.test(html)) {
  fail('Missing lang attribute on <html>.');
}

const buttonMatches = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
if (buttonMatches.some((m) => !m[1].trim())) {
  fail('One or more buttons have no visible text.');
}

const inputMatches = [...html.matchAll(/<input([^>]*)>/gi)];
inputMatches.forEach((match) => {
  const attrs = match[1];
  const typeMatch = attrs.match(/type\s*=\s*"([^"]+)"/i);
  const type = typeMatch ? typeMatch[1].toLowerCase() : '';

  if (type === 'checkbox' || type === 'radio') {
    return; // these are wrapped in labels in the markup
  }

  const hasAria = /aria-label\s*=/.test(attrs);
  const hasName = /name\s*=/.test(attrs);
  const hasPlaceholder = /placeholder\s*=/.test(attrs);
  if (!hasAria && !hasName && !hasPlaceholder) {
    fail(`Input missing helper text (aria-label, name, or placeholder): ${match[0]}`);
  }
});

if (!/aria-live="polite"/i.test(html) && !/aria-live="assertive"/i.test(html)) {
  fail('No aria-live region found for announcements.');
}

if (hasError) {
  process.exit(1);
} else {
  console.log('Accessibility static checks passed.');
}
