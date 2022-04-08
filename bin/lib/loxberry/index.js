const System = require('./system');

module.exports = (plugin) => {
  return {
    system: new System(plugin)
  };
};
