const { readJson, read, write } = require('./lib/fileHandler');
const directories = require('./lib/directories');
const path = require('path');
const handlebars = require('handlebars');
const configFile = path.resolve(directories.config, 'express.json');

const writeHtaccess = async () => {
  const config = await readJson(configFile);

  const htmlHtaccess = await read(path.resolve(__dirname, './views/htaccess/html_htaccess'));
  await write(path.resolve(directories.htmlExpressDir, '.htaccess'), handlebars.compile(htmlHtaccess)(config));

  const htmlauthHtaccess = await read(path.resolve(__dirname, './views/htaccess/htmlauth_htaccess'));
  await write(path.resolve(directories.htmlauthExpressDir, '.htaccess'), handlebars.compile(htmlauthHtaccess)(config));
};

writeHtaccess();
