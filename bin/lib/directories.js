const path = require('path');
const PRODUCTION = process.env.NODE_ENV === 'production';

const directories = () => {
  if (PRODUCTION) {
    return {
      homedir: process.env.LBHOMEDIR,
      config: 'REPLACELBPCONFIGDIR',
      logdir: 'REPLACELBPLOGDIR',
      bindir: 'REPLACELBPBINDIR',
      htmlauthPluginDir: path.join(process.env.LBHOMEDIR, 'webfrontend', 'htmlauth', 'plugins'),
      htmlExpressDir: path.join(process.env.LBHOMEDIR, 'webfrontend', 'html', 'express'),
      htmlauthExpressDir: path.join(process.env.LBHOMEDIR, 'webfrontend', 'htmlauth', 'express'),
      templateDir: process.env.LBPTEMPL,
      systemData: path.join(process.env.LBHOMEDIR, 'data', 'system'),
      systemConfig: path.join(process.env.LBHOMEDIR, 'config', 'system')
    };
  }

  return {
    homedir: path.join(__dirname, '../../loxberry'),
    config: path.join(__dirname, '../../config'),
    logdir: path.join(__dirname, '../../logs'),
    bindir: path.join(__dirname, '../'),
    htmlauthPluginDir: path.join(__dirname, '../../loxberry/webfrontend/htmlauth/plugins'),
    htmlauthExpressDir: path.join(__dirname, '../../loxberry/webfrontend/htmlauth/express'),
    htmlExpressDir: path.join(__dirname, '../../loxberry/webfrontend/html/express'),
    templateDir: path.join(__dirname, '../../loxberry/templates/plugins'),
    systemData: path.join(__dirname, '../../loxberry/data/system'),
    systemConfig: path.join(__dirname, '../../loxberry/config/system')
  };
};

module.exports = directories();
