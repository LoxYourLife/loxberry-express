const format = (name, level, message) => {
  const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  return `[${date}] ${name}|${level.toUpperCase()}: ${message}\n`;
};

const stdErr = (msg) => process.stderr.write(msg);
const stdOut = (msg) => process.stdout.write(msg);

const INFO = 'info';
const DEBUG = 'debug';
const WARN = 'warn';
const ERROR = 'error';

class Logger {
  constructor(name, config) {
    this.name = name;
    this.loglevel = config.loglevel;
  }

  info(message) {
    if (this.loglevel.info) stdOut(format(this.name, INFO, message));
  }

  debug(message) {
    if (this.loglevel.debug) stdOut(format(this.name, DEBUG, message));
  }

  warn(message) {
    if (this.loglevel.warning) stdOut(format(this.name, WARN, message));
  }

  error(message, error) {
    if (this.loglevel.error) {
      stdErr(format(this.name, ERROR, message));

      if (error && error.stack) {
        const errorInfo = `    ${error.message}\n    ${error.name}\n    ${error.code}\n    ${error.signal}\n    ${
          error.stack || error.toString()
        }`;
        return stdErr(errorInfo);
      }
    }
  }
}

module.exports = (name, config) => new Logger(name, config);
