const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.post('/plugin/:pluginName', async (req, res) => {
  const { pluginName } = req.params;
  const moduleKeys = _.filter(_.keys(require.cache), (key) => key.indexOf(`/plugins/${pluginName}/`) !== -1);
  _.forEach(moduleKeys, (key) => delete require.cache[key]);
  res.send(pluginName);
});

module.exports = router;
