process.env.NODE_ENV = '/opt/loxberry' === process.env.HOME ? 'production' : 'development';

const path = require('path');
const directories = require('./lib/directories');

module.exports = [
  {
    name: 'Express Manager',
    script: 'manager.js',
    args: '--dev',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production'
    },
    out_file: path.resolve(directories.logdir, 'express-manager.log'),
    error_file: path.resolve(directories.logdir, './express-manager-error.log'),
    pid_file: path.resolve(directories.logdir, 'express.-manager.pid')
  }
];
