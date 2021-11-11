const path = require('path');
const PRODUCTION = '/opt/loxberry' === process.env.HOME;

const directories = () => {
  if (PRODUCTION) {
    return {
      homedir: process.env.LBHOMEDIR,
      logdir: 'REPLACELBPLOGDIR',
      bindir: 'REPLACELBPBINDIR',
      pluginDir: process.env.LBHOMEDIR + '/webfrontend/htmlauth/plugins'
    };
  }

  return {
    homedir: path.join(__dirname, '../../loxberry'),
    logdir: path.join(__dirname, '../../logs'),
    bindir: path.join(__dirname, '../'),
    plugindir: path.join(__dirname, '../../plugin')
  };
};

module.exports = directories();
