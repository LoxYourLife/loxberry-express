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
  constructor(name) {
    this.name = name;
  }

  info(message) {
    stdOut(format(this.name, INFO, message));
  }

  debug(message) {
    stdOut(format(this.name, DEBUG, message));
  }

  warn(message) {
    stdOut(format(this.name, WARN, message));
  }

  error(message, error) {
    stdErr(format(this.name, ERROR, message));

    if (error && error.stack) {
      const errorInfo = `    ${error.message}\n    ${error.name}\n    ${error.code}\n    ${error.signal}\n    ${
        error.stack || error.toString()
      }`;
      return stdErr(errorInfo);
    }
  }
}

module.exports = (name) => new Logger(name);
