const path = require('path');
module.exports = ({ router, static }) => {
  router.get('/', async (req, res) => {
    return res.render('index', { title: 'Express 0.0.1' });
  });
  router.use('/assets', static(path.resolve(__dirname, 'assets')));
  return router;
};
