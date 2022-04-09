const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const loadIniFile = require('read-ini-file');

const loxberryConfig = async (devPath) => {
  const sourceConfig = path.resolve(__dirname, 'loxberry.config.json');
  const destinationConfig = path.join(devPath, 'general.json');

  if (!fs.existsSync(devPath)) {
    await fs.promises.mkdir(devPath);
  }

  if (!fs.existsSync(destinationConfig)) {
    await fs.promises.copyFile(sourceConfig, destinationConfig);
    return;
  }

  const sourceBuffer = await fs.promises.readFile(sourceConfig);
  const sourceContent = JSON.parse(sourceBuffer.toString());

  const destinationBuffer = await fs.promises.readFile(destinationConfig);
  const destinationContent = JSON.parse(destinationBuffer.toString());

  const newContent = _.merge(sourceContent, destinationContent);

  await fs.promises.writeFile(destinationConfig, JSON.stringify(newContent, null, 2));
};

const plugindatabase = async (rootPath, devPath) => {
  const pluginDatabase = path.join(devPath, 'plugindatabase.json');
  const pluginFile = path.join(rootPath, 'plugin.cfg');

  if (!fs.existsSync(pluginFile)) {
    throw new Error('Cannot find plugin.cfg file');
  }

  const plugin = await loadIniFile(pluginFile);

  const pluginData = {
    author_email: _.get(plugin, 'AUTHOR.EMAIL'),
    author_name: _.get(plugin, 'AUTHOR.NAME'),
    autoupdate: _.get(plugin, 'AUTOUPDATE.AUTOMATIC_UPDATES'),
    directories: {
      installfiles: path.join(rootPath, 'data', 'system', 'install', _.get(plugin, 'PLUGIN.NAME')),
      lbpbindir: path.join(rootPath, 'bin'),
      lbpconfigdir: path.join(rootPath, 'config'),
      lbpdatadir: path.join(rootPath, 'data'),
      lbphtmlauthdir: path.join(rootPath, 'webfrontend', 'htmlauth'),
      lbphtmldir: path.join(rootPath, 'webfrontend', 'html'),
      lbplogdir: path.join(rootPath, 'log'),
      lbptemplatedir: path.join(rootPath, 'templates')
    },
    epoch_firstinstalled: 1628693690,
    files: {
      daemon: path.join(rootPath, 'daemon', 'daemon'),
      sudoers: path.join(rootPath, 'sudoers', 'sudoers'),
      uninstall: path.join(rootPath, 'uninstall', 'uninstall')
    },
    folder: _.get(plugin, 'PLUGIN.FOLDER'),
    interface: _.get(plugin, 'SYSTEM.INTERFACE'),
    loglevel: _.get(plugin, 'SYSTEM.CUSTOM_LOGLEVELS') === false ? '-1' : 3,
    loglevels_enabled: _.get(plugin, 'SYSTEM.CUSTOM_LOGLEVELS') === false ? 0 : 1,
    md5: '0f36144b3b61c7a03b436884fc8d9430',
    name: _.get(plugin, 'PLUGIN.NAME'),
    prereleasecfg: _.get(plugin, 'AUTOUPDATE.PRERELEASECFG'),
    releasecfg: _.get(plugin, 'AUTOUPDATE.RELEASECFG'),
    title: _.get(plugin, 'PLUGIN.TITLE'),
    version: _.get(plugin, 'PLUGIN.VERSION')
  };

  let pluginDb = {};
  if (fs.existsSync(pluginDatabase)) {
    const sourceBuffer = await fs.promises.readFile(pluginDatabase);
    pluginDb = JSON.parse(sourceBuffer.toString());
  }

  const newContent = _.merge(pluginDb, { plugins: { [pluginData.md5]: pluginData } });
  await fs.promises.writeFile(pluginDatabase, JSON.stringify(newContent, null, 2));

  return pluginData.name;
};

module.exports = async () => {
  const rootPath = path.resolve(process.argv[2]);
  const devPath = path.join(rootPath, '.dev');

  await loxberryConfig(devPath);
  const pluginName = await plugindatabase(rootPath, devPath);

  return pluginName;
};
