#!/usr/bin/env node
// const { spawn } = require('child_process');
// ESM style if "type": "module" in package.json
console.log("Welcome use psm 🎉");
process.env.NODE_ENV = 'production';
require('../server/app.js')
