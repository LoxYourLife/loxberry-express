const path = require('path');
const directories = require('./lib/directories');

module.exports = [
  {
    name: 'Express Server',
    script: 'index.js',
    args: '--dev',
    cwd: __dirname,
    out_file: path.resolve(directories.logdir, 'express.log'),
    error_file: path.resolve(directories.logdir, './express-error.log'),
    pid_file: path.resolve(directories.logdir, 'express.pid'),
    watch: [__dirname]
  }
];
