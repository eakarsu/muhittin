#!/usr/bin/env node
const { getRuntimeConfig } = require('../config');

try {
  getRuntimeConfig();
  console.log('Runtime configuration is valid.');
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 1;
}
