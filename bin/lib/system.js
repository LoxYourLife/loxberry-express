const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.post('/plugin/:pluginName', async (req, res) => {
  _.forEach(_.keys(require.cache), (key) => delete require.cache[key]);
  res.send('ok');
});

module.exports = router;
