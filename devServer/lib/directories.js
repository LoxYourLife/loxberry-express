const path = require('path');
const rootPath = path.resolve(process.argv[2]);

module.exports = {
  systemData: path.join(rootPath, '.dev'),
  systemConfig: path.join(rootPath, '.dev')
};
