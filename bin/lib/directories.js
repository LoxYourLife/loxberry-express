const path = require('path');
const PRODUCTION = process.env.NODE_ENV === 'production';

const directories = () => {
  if (PRODUCTION) {
    return {
      homedir: process.env.LBHOMEDIR,
      logdir: 'REPLACELBPLOGDIR',
      bindir: 'REPLACELBPBINDIR',
      pluginDir: process.env.LBHOMEDIR + '/webfrontend/htmlauth/plugins',
      templateDir: process.env.LBPTEMPL
    };
  }

  return {
    homedir: path.join(__dirname, '../../loxberry'),
    logdir: path.join(__dirname, '../../logs'),
    bindir: path.join(__dirname, '../'),
    pluginDir: path.join(__dirname, '../../plugins'),
    templateDir: path.join(__dirname, '../../templates')
  };
};

module.exports = directories();
