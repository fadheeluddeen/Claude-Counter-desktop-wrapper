'use strict';
const { spawn } = require('child_process');
const electron = require('electron');
const env = Object.assign({}, process.env);
delete env.ELECTRON_RUN_AS_NODE;
const proc = spawn(electron, ['.'], { stdio: 'inherit', env });
proc.on('close', code => process.exit(code || 0));
