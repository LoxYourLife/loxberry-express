const fileHandler = require('../../fileHandler');
const directories = require('../../directories');
const path = require('path');
const _ = require('lodash');
const os = require('os');
const ip = require('ip');

const loxoneTimeOffset = 1230764400; // 1.1.2009 00:00:00
const getTimezoneOffset = () => {
  const timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  return timeZoneOffset > 0 ? -timeZoneOffset : Math.abs(timeZoneOffset);
};

const getGeneralConfig = async () => {
  const configFile = path.join(directories.systemConfig, 'general.json');
  return fileHandler.readJson(configFile);
};

module.exports = class System {
  constructor(plugin) {
    this.plugin = plugin;
  }

  async getPlugins() {
    const dbFileName = path.join(directories.systemData, 'plugindatabase.json');
    const db = await fileHandler.readJson(dbFileName);
    return _.values(db.plugins);
  }

  async pluginData(givenName) {
    const plugins = await this.getPlugins();
    const name = givenName || this.plugin;

    const current = _.find(plugins, (entry) => entry.name === name);
    if (_.isUndefined(current)) throw Error('Plugin was not found');

    delete current.files;
    return current;
  }

  async pluginVersion(givenName) {
    const pluginData = await this.pluginData(givenName);
    return pluginData.version;
  }

  async pluginLogLevel(givenName) {
    const pluginData = await this.pluginData(givenName);
    return pluginData.loglevel;
  }

  async getMiniserver() {
    const config = await getGeneralConfig();
    const miniserver = _.get(config, 'Miniserver', {});
    return _.values(miniserver);
  }

  async getMiniserverByIp(ip) {
    const miniservers = await this.getMiniserver();
    const miniserver = _.find(miniservers, (ms) => ms.Ipaddress === ip);
    if (_.isUndefined(miniserver)) throw Error(`Miniserver with ip ${ip} was not found`);
    return miniserver;
  }

  async getMiniserverByName(name) {
    const miniservers = await this.getMiniserver();
    const miniserver = _.find(miniservers, (ms) => ms.Name === name);
    if (_.isUndefined(miniserver)) throw Error(`Miniserver with name "${name}" was not found`);
    return miniserver;
  }

  async getCountry() {
    const config = await getGeneralConfig();
    return _.get(config, 'Base.Country');
  }

  async getLanguage() {
    const config = await getGeneralConfig();
    return _.get(config, 'Base.Lang');
  }

  async getVersion() {
    const config = await getGeneralConfig();
    return _.get(config, 'Base.Version');
  }

  async getLoglevel() {
    const config = await getGeneralConfig();
    return _.get(config, 'Base.Systemloglevel');
  }

  async getFriendlyName() {
    const config = await getGeneralConfig();
    return _.get(config, 'Network.Friendlyname');
  }

  async getWebserverPort() {
    const config = await getGeneralConfig();
    return _.get(config, 'Webserver.Port');
  }

  async getHostname() {
    return os.hostname();
  }

  async getLocalIp() {
    return ip.address();
  }

  async dateToLox(date) {
    if (typeof _.get(date, 'getTime') != 'function') throw Error('Given date is not a valid date');
    const timeZoneOffset = getTimezoneOffset();
    const seconds = date.getTime() / 1000;
    return `${seconds - loxoneTimeOffset + timeZoneOffset / 1000 - 3600}`;
  }

  async loxToDate(loxoneDate) {
    if (_.isNil(loxoneDate) || loxoneDate < '0') throw Error('Positive number required');

    const time = parseInt(loxoneDate) + loxoneTimeOffset;
    const utcTime = time * 1000 - 3600000;
    return new Date(utcTime);
  }
};
