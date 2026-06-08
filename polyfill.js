const util = require('util');

// Polyfill styleText if it does not exist in the current Node version
if (!util.styleText) {
  util.styleText = (format, text) => {
    // Simple terminal ANSI code fallbacks for basic formats
    const formats = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      bold: '\x1b[1m',
      reset: '\x1b[0m'
    };
    const code = formats[format] || '';
    return `${code}${text}${formats.reset}`;
  };
}

try {
  // Also register it under the node:util namespace
  const nodeUtil = require('node:util');
  if (!nodeUtil.styleText) {
    nodeUtil.styleText = util.styleText;
  }
} catch (e) {}
