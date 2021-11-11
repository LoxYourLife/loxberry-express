const pm2 = require('pm2');
const expressConfig = require('../express.config');
const _ = require('lodash');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
const directories = require('./directories');

const memory = (bytes) => {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return { value: 0, unit: 'B' };
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return { value: Math.round(bytes / Math.pow(1024, i), 2), unit: sizes[i] };
};

const uptime = (data) => {
  if (data === 0) return null;
  const uptime = (new Date().getTime() - data) / 1000;

  var days = Math.floor(uptime / 86400);
  var hours = Math.floor(uptime / 3600);
  var minutes = Math.floor(uptime / 60);
  var seconds = uptime;

  if (days > 0) return `${days}d`;
  if (hours > 1) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

module.exports = class Pm2Manager {
  constructor(clients) {
    this.clients = clients;
    this.telemetryInterval = null;
    this.cachedTelemetry = {};
    this.logReader = null;
    this.errorLogReader = null;
  }

  startTelemetryInterval() {
    if (this.telemetryInterval === null || this.telemetryInterval._destroyed) {
      this.telemetryInterval = setInterval(this.telemetry.bind(this), 10000);
      this.readLogs();
      this.readErrorLogs();
      return this.telemetry();
    }

    this.broadcast(this.cachedTelemetry);
  }

  stopTelemetryInterval() {
    if (this.clients.size === 0) {
      clearInterval(this.telemetryInterval);
      if (this.logReader !== null) this.logReader.kill('SIGHUP');
      if (this.errorLogReader !== null) this.errorLogReader.kill('SIGHUP');
    }
  }

  async telemetry() {
    pm2.describe(expressConfig[0].name, (err, data) => {
      if (err !== null) return (this.cachedTelemetry = { error: err });
      const telemetry = data.find((service) => service.name === expressConfig[0].name);
      this.cachedTelemetry = {
        telemetry: {
          name: telemetry.name,
          pid: telemetry.pid,
          status: _.get(telemetry, 'pm2_env.status', 'unknown'),
          version: _.get(telemetry, 'pm2_env.version', 'unknown'),
          memory: memory(_.get(telemetry, 'monit.memory', 0)),
          cpu: _.get(telemetry, 'monit.cpu', 0),
          uptime: uptime(_.get(telemetry, 'pm2_env.pm_uptime', 0)),
          HeapSize: {
            value: _.get(telemetry, 'pm2_env.axm_monitor.Heap Size.value'),
            unit: _.get(telemetry, 'pm2_env.axm_monitor.Heap Size.unit')
          },
          HeapUsage: {
            value: _.get(telemetry, 'pm2_env.axm_monitor.Heap Usage.value'),
            unit: _.get(telemetry, 'pm2_env.axm_monitor.Heap Usage.unit')
          },
          UsedHeapSize: {
            value: _.get(telemetry, 'pm2_env.axm_monitor.Used Heap Size.value'),
            unit: _.get(telemetry, 'pm2_env.axm_monitor.Used Heap Size.unit')
          },
          ActiveRequests: _.get(telemetry, 'pm2_env.axm_monitor.Active requests.value'),
          ActiveHandles: _.get(telemetry, 'pm2_env.axm_monitor.Active handles.value'),
          EventLoopLatency: {
            value: _.get(telemetry, 'pm2_env.axm_monitor.Event Loop Latency.value'),
            unit: _.get(telemetry, 'pm2_env.axm_monitor.Event Loop Latency.unit')
          }
        }
      };

      this.broadcast(this.cachedTelemetry);
    });
  }

  broadcast(data) {
    this.clients.forEach((ws) => ws.send(JSON.stringify(data)));
  }

  async readLogs() {
    this.logReader = await spawn('tail', ['-n', '200', '-f', expressConfig[0].out_file]);
    this.logReader.stdout.on('data', (data) => {
      const logs = data
        .toString()
        .split('\n')
        .filter((entry) => !_.isEmpty(entry))
        .map((message) => ({ date: new Date(), message }));
      if (!_.isEmpty(logs)) this.broadcast({ logs });
    });

    this.logReader.on('close', () => {
      this.logReader = null;
    });
  }

  async readErrorLogs() {
    this.errorLogReader = await spawn('tail', ['-n', '200', '-f', expressConfig[0].error_file]);
    this.errorLogReader.stdout.on('data', (data) => {
      const errorLogs = data
        .toString()
        .split('\n')
        .filter((entry) => !_.isEmpty(entry))
        .map((message) => ({ date: new Date(), message }));
      if (!_.isEmpty(errorLogs)) this.broadcast({ errorLogs });
    });

    this.errorLogReader.on('close', () => {
      this.errorLogReader = null;
    });
  }

  async handleCommand(command) {
    switch (command) {
      case 'start':
        await exec('npm run start', { cwd: directories.bindir });
        break;
      case 'stop':
        await exec('npm run stop', { cwd: directories.bindir });
        break;
      case 'restart':
        await exec('npm run restart', { cwd: directories.bindir });
        break;
    }
    return this.telemetry();
  }
};
